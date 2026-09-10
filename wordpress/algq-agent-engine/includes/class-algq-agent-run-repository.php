<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Agent_Run_Repository {
    private static ?ALGQ_Agent_Run_Repository $instance = null;

    public static function get_instance(): ALGQ_Agent_Run_Repository {
        return self::$instance ??= new self();
    }

    public function find_by_correlation_key( string $correlation_key ): ?array {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_runs';
        $row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE correlation_key = %s LIMIT 1", $correlation_key ), ARRAY_A );
        return $row ?: null;
    }

    public function create_run( array $data ): array|WP_Error {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_runs';
        $run_uuid = wp_generate_uuid4();
        $ok = $wpdb->insert(
            $table,
            array(
                'run_uuid' => $run_uuid,
                'correlation_key' => $data['correlation_key'],
                'deal_id' => $data['deal_id'],
                'agent_id' => $data['agent_id'],
                'skill_id' => $data['skill_id'],
                'trigger_type' => $data['trigger_type'] ?? 'manual',
                'status' => $data['status'] ?? 'QUEUED',
                'approval_id' => $data['approval_id'] ?? null,
                'input_hash' => $data['input_hash'],
                'result_json' => null,
                'error_code' => null,
                'started_at' => current_time( 'mysql' ),
                'completed_at' => null,
                'created_by' => get_current_user_id(),
            ),
            array( '%s','%s','%s','%s','%s','%s','%s','%d','%s','%s','%s','%s','%s','%d' )
        );
        if ( false === $ok ) {
            return new WP_Error( 'run_persistence_failed', 'Unable to persist agent run.' );
        }
        return array( 'id' => (int) $wpdb->insert_id, 'run_uuid' => $run_uuid );
    }

    public function finalize_run( string $run_uuid, string $status, array $result = array(), ?string $error_code = null ): bool {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_runs';
        return false !== $wpdb->update(
            $table,
            array(
                'status' => sanitize_key( $status ),
                'result_json' => wp_json_encode( $result ),
                'error_code' => $error_code ? sanitize_key( $error_code ) : null,
                'completed_at' => current_time( 'mysql' ),
            ),
            array( 'run_uuid' => $run_uuid ),
            array( '%s','%s','%s','%s' ),
            array( '%s' )
        );
    }

    public function audit( string $deal_id, string $agent_id, string $event_type, array $payload = array(), ?string $run_uuid = null ): bool {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_audit_log';
        $ok = $wpdb->insert(
            $table,
            array(
                'event_uuid' => wp_generate_uuid4(),
                'run_uuid' => $run_uuid,
                'deal_id' => $deal_id,
                'agent_id' => $agent_id,
                'event_type' => sanitize_key( strtolower( $event_type ) ),
                'event_json' => wp_json_encode( $payload ),
                'created_at' => current_time( 'mysql' ),
                'created_by' => get_current_user_id(),
            ),
            array( '%s','%s','%s','%s','%s','%s','%s','%d' )
        );
        return false !== $ok;
    }

    public function recent_runs( int $limit = 25 ): array {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_runs';
        $limit = max( 1, min( 100, $limit ) );
        return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
    }
}
