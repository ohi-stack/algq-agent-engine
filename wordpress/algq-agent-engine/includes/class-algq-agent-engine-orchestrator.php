<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Agent_Engine_Orchestrator {
    private static ?ALGQ_Agent_Engine_Orchestrator $instance = null;

    public static function get_instance(): ALGQ_Agent_Engine_Orchestrator {
        return self::$instance ??= new self();
    }

    private function __construct() {
        add_action( 'algq_trigger_agent_workflow', array( $this, 'handle_action_trigger' ), 10, 3 );
    }

    public function handle_action_trigger( string $agent_id, string|int $deal_id, array $context = array() ): void {
        $result = $this->orchestrate( $agent_id, (string) $deal_id, $context );
        do_action( 'algq_agent_workflow_result', $result, $agent_id, (string) $deal_id, $context );
    }

    public function orchestrate( string $agent_id, string $deal_id, array $context = array() ): array|WP_Error {
        $agent_id = sanitize_key( $agent_id );
        $deal_id  = sanitize_text_field( $deal_id );
        $skill_id = sanitize_text_field( $context['target_skill'] ?? '' );

        if ( '' === $agent_id || '' === $deal_id || '' === $skill_id ) {
            return new WP_Error( 'invalid_request', 'agent_id, deal_id, and target_skill are required.' );
        }

        $agents = ALGQ_Agent_Registry::get_instance();
        $skills = ALGQ_Skill_Registry::get_instance();
        $runs   = ALGQ_Agent_Run_Repository::get_instance();
        $platform = ALGQ_Platform_Service_Interface::get_instance();

        $agent = $agents->get_agent( $agent_id );
        if ( ! $agent ) {
            return new WP_Error( 'invalid_agent', "Agent '{$agent_id}' does not exist." );
        }
        if ( ! $agents->agent_has_skill( $agent_id, $skill_id ) ) {
            return new WP_Error( 'skill_not_authorized', 'Requested skill is not authorized for this agent.' );
        }

        $skill = $skills->get_skill( $skill_id );
        if ( ! $skill ) {
            return new WP_Error( 'invalid_skill', 'Requested skill is not registered.' );
        }

        $deal = $platform->get_deal( $deal_id );
        if ( is_wp_error( $deal ) ) {
            return $deal;
        }

        $state = sanitize_key( strtoupper( (string) ( $deal['primary_state'] ?? $deal['state'] ?? '' ) ) );
        $allowed_states = $skill['allowed_states'] ?? array();
        if ( ! in_array( '*', $allowed_states, true ) && ! in_array( $state, $allowed_states, true ) ) {
            return new WP_Error(
                'state_not_allowed',
                sprintf( 'Skill %s cannot run while deal %s is in state %s.', $skill_id, $deal_id, $state ?: 'UNKNOWN' )
            );
        }

        $normalized_input = array(
            'deal_id' => $deal_id,
            'agent_id' => $agent_id,
            'skill_id' => $skill_id,
            'context' => $context,
        );
        $input_hash = hash( 'sha256', wp_json_encode( $normalized_input ) );
        $event_id = sanitize_text_field( $context['event_id'] ?? $context['correlation_id'] ?? 'manual' );
        $correlation_key = hash( 'sha256', implode( '|', array( $deal_id, $agent_id, $skill_id, $event_id, $input_hash ) ) );

        $existing = $runs->find_by_correlation_key( $correlation_key );
        if ( $existing ) {
            return array(
                'status' => 'IDEMPOTENT_REPLAY',
                'run_uuid' => $existing['run_uuid'],
                'original_status' => $existing['status'],
                'result' => $existing['result_json'] ? json_decode( $existing['result_json'], true ) : null,
            );
        }

        if ( ALGQ_Approval_Gate::requires_approval( $skill, $context ) ) {
            $approval_id = ALGQ_Approval_Gate::create_ticket( $agent_id, $deal_id, $skill_id, $context );
            if ( is_wp_error( $approval_id ) ) {
                return $approval_id;
            }

            $run = $runs->create_run( array(
                'correlation_key' => $correlation_key,
                'deal_id' => $deal_id,
                'agent_id' => $agent_id,
                'skill_id' => $skill_id,
                'trigger_type' => sanitize_key( $context['trigger_type'] ?? 'manual' ),
                'status' => 'AWAITING_APPROVAL',
                'approval_id' => $approval_id,
                'input_hash' => $input_hash,
            ) );
            if ( is_wp_error( $run ) ) {
                return $run;
            }
            if ( ! $runs->audit( $deal_id, $agent_id, 'PAUSED_FOR_APPROVAL', array( 'approval_id' => $approval_id, 'skill_id' => $skill_id ), $run['run_uuid'] ) ) {
                return new WP_Error( 'audit_failed', 'Approval created but audit persistence failed.' );
            }

            return array(
                'status' => 'HALTED_AWAITING_HUMAN_APPROVAL',
                'run_uuid' => $run['run_uuid'],
                'approval_id' => $approval_id,
                'message' => 'Action requires authorized human approval before execution.',
            );
        }

        $run = $runs->create_run( array(
            'correlation_key' => $correlation_key,
            'deal_id' => $deal_id,
            'agent_id' => $agent_id,
            'skill_id' => $skill_id,
            'trigger_type' => sanitize_key( $context['trigger_type'] ?? 'manual' ),
            'status' => 'RUNNING',
            'input_hash' => $input_hash,
        ) );
        if ( is_wp_error( $run ) ) {
            return $run;
        }

        $runs->audit( $deal_id, $agent_id, 'EXECUTION_STARTED', array( 'skill_id' => $skill_id ), $run['run_uuid'] );

        try {
            $result = $skills->execute_skill( $skill_id, $deal_id, $context );
            if ( is_wp_error( $result ) ) {
                $runs->finalize_run( $run['run_uuid'], 'FAILED', array( 'message' => $result->get_error_message() ), $result->get_error_code() );
                $runs->audit( $deal_id, $agent_id, 'EXECUTION_FAILED', array( 'error' => $result->get_error_message(), 'skill_id' => $skill_id ), $run['run_uuid'] );
                return $result;
            }

            if ( ! $runs->finalize_run( $run['run_uuid'], 'COMPLETED', $result ) ) {
                return new WP_Error( 'run_finalize_failed', 'Skill executed but run finalization failed.' );
            }
            if ( ! $runs->audit( $deal_id, $agent_id, 'EXECUTION_SUCCESS', array( 'skill_id' => $skill_id, 'result' => $result ), $run['run_uuid'] ) ) {
                return new WP_Error( 'audit_failed', 'Skill executed but audit persistence failed.' );
            }

            do_action( 'algq_agent_run_completed', $run['run_uuid'], $deal_id, $agent_id, $skill_id, $result );
            return array( 'status' => 'COMPLETED', 'run_uuid' => $run['run_uuid'], 'result' => $result );
        } catch ( Throwable $e ) {
            $runs->finalize_run( $run['run_uuid'], 'FAILED', array( 'message' => $e->getMessage() ), 'throwable' );
            $runs->audit( $deal_id, $agent_id, 'EXECUTION_FAILED', array( 'error' => $e->getMessage(), 'skill_id' => $skill_id ), $run['run_uuid'] );
            return new WP_Error( 'execution_error', $e->getMessage() );
        }
    }
}
