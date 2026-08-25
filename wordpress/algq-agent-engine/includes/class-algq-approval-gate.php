<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Approval_Gate {
    public static function requires_approval( array $skill, array $context = array() ): bool {
        $policy = $skill['approval'] ?? 'none';
        if ( 'required' === $policy ) {
            return true;
        }
        return (bool) apply_filters( 'algq_agent_requires_approval', false, $skill, $context );
    }

    public static function create_ticket( string $agent_id, string $deal_id, string $skill_id, array $context ): int|WP_Error {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_approvals';
        $ok = $wpdb->insert(
            $table,
            array(
                'approval_uuid' => wp_generate_uuid4(),
                'deal_id' => $deal_id,
                'agent_id' => $agent_id,
                'skill_id' => $skill_id,
                'action_type' => sanitize_text_field( $context['requested_action'] ?? $skill_id ),
                'status' => 'pending',
                'request_json' => wp_json_encode( $context ),
                'conditions_json' => null,
                'requested_at' => current_time( 'mysql' ),
                'requested_by' => get_current_user_id(),
                'decided_at' => null,
                'decided_by' => null,
            ),
            array( '%s','%s','%s','%s','%s','%s','%s','%s','%d','%s','%d' )
        );
        if ( false === $ok ) {
            return new WP_Error( 'approval_persistence_failed', 'Unable to create approval ticket.' );
        }
        return (int) $wpdb->insert_id;
    }

    public static function decide( int $approval_id, string $decision, array $conditions = array() ): bool|WP_Error {
        if ( ! current_user_can( 'approve_algq_agent_actions' ) ) {
            return new WP_Error( 'forbidden', 'You are not authorized to approve agent actions.' );
        }
        if ( ! in_array( $decision, array( 'approved', 'rejected' ), true ) ) {
            return new WP_Error( 'invalid_decision', 'Approval decision must be approved or rejected.' );
        }
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_approvals';
        $ok = $wpdb->update(
            $table,
            array(
                'status' => $decision,
                'conditions_json' => wp_json_encode( $conditions ),
                'decided_at' => current_time( 'mysql' ),
                'decided_by' => get_current_user_id(),
            ),
            array( 'id' => $approval_id, 'status' => 'pending' ),
            array( '%s','%s','%s','%d' ),
            array( '%d','%s' )
        );
        return false !== $ok;
    }

    public static function pending( int $limit = 50 ): array {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_approvals';
        $limit = max( 1, min( 100, $limit ) );
        return $wpdb->get_results( "SELECT * FROM {$table} WHERE status='pending' ORDER BY id DESC LIMIT {$limit}", ARRAY_A ) ?: array();
    }
}
