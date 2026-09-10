<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Platform_Service_Interface {
    private static ?ALGQ_Platform_Service_Interface $instance = null;

    public static function get_instance(): ALGQ_Platform_Service_Interface {
        return self::$instance ??= new self();
    }

    public function get_deal( string $deal_id ): array|WP_Error {
        $deal_id = sanitize_text_field( $deal_id );
        if ( '' === $deal_id ) {
            return new WP_Error( 'missing_deal_id', 'A canonical deal_id is required.' );
        }

        $deal = apply_filters( 'algq_platform_service_get_deal', null, $deal_id );
        if ( null === $deal || false === $deal ) {
            return new WP_Error(
                'deal_service_unavailable',
                'Canonical deal could not be resolved. Connect Pipeline CRM through algq_platform_service_get_deal.'
            );
        }
        if ( ! is_array( $deal ) ) {
            return new WP_Error( 'invalid_deal_response', 'Canonical deal service returned an invalid response.' );
        }
        return $deal;
    }

    public function execute( string $skill_id, string $deal_id, array $context ): array|WP_Error {
        $result = apply_filters( 'algq_platform_service_execute_skill', null, $skill_id, $deal_id, $context );
        if ( null === $result ) {
            return new WP_Error(
                'service_adapter_missing',
                sprintf( 'No authoritative ARE service adapter is registered for skill %s.', esc_html( $skill_id ) )
            );
        }
        if ( is_wp_error( $result ) ) {
            return $result;
        }
        return is_array( $result ) ? $result : array( 'value' => $result );
    }
}
