<?php
/**
 * Plugin Name: Algonquian ARE Agent Engine Bridge
 * Plugin URI: https://algonquianrealestate.com/technology/
 * Description: Authenticated REST, runtime configuration, and cross-surface synchronization bridge for the Algonquian ARE Agent Engine, ARE Platform, and WordPress plugin suite.
 * Version: 0.2.0
 * Requires at least: 6.8
 * Requires PHP: 8.2
 * Author: Algonquian Real Estate, LLC
 * Author URI: https://algonquianrealestate.com/technology/
 * Text Domain: algq-agent-engine-bridge
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

final class ALGQ_Agent_Engine_Bridge {
    public const VERSION = '0.2.0';
    public const REST_NAMESPACE = 'algq/v1';

    private static ?self $instance = null;

    public static function instance(): self {
        return self::$instance ??= new self();
    }

    private function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
        add_action( 'admin_menu', array( $this, 'register_admin_page' ), 99 );
        add_shortcode( 'algq_agent_engine_app', array( $this, 'render_app_shortcode' ) );
    }

    public function register_routes(): void {
        register_rest_route(
            self::REST_NAMESPACE,
            '/health',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'health' ),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/agent-engine/snapshot',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'snapshot' ),
                'permission_callback' => array( $this, 'can_view_engine' ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/services/call',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'service_call' ),
                'permission_callback' => array( $this, 'can_manage_engine' ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/agents/runs',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'agent_run' ),
                'permission_callback' => array( $this, 'can_manage_engine' ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/approvals/(?P<ticket_id>[A-Za-z0-9\-_]+)/resolve',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'resolve_approval' ),
                'permission_callback' => array( $this, 'can_approve_actions' ),
                'args'                => array(
                    'ticket_id' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        register_rest_route(
            self::REST_NAMESPACE,
            '/events',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'event' ),
                'permission_callback' => array( $this, 'can_manage_engine' ),
            )
        );
    }

    public function can_view_engine(): bool {
        return is_user_logged_in() && (
            current_user_can( 'manage_algq_agent_engine' ) ||
            current_user_can( 'read' )
        );
    }

    public function can_manage_engine(): bool {
        return current_user_can( 'manage_algq_agent_engine' ) || current_user_can( 'manage_options' );
    }

    public function can_approve_actions(): bool {
        return current_user_can( 'approve_algq_agent_actions' ) || current_user_can( 'manage_options' );
    }

    public function health(): WP_REST_Response {
        $agent_engine_active = class_exists( 'ALGQ_Agent_Engine_Orchestrator' );
        $platform_function   = function_exists( 'algq_platform_service_call' );
        $platform_filter     = has_filter( 'algq_platform_service_call' );

        return rest_ensure_response(
            array(
                'ok'                    => true,
                'bridge_version'        => self::VERSION,
                'agent_engine_active'   => $agent_engine_active,
                'platform_service_live' => (bool) ( $platform_function || $platform_filter ),
                'wordpress_version'     => get_bloginfo( 'version' ),
                'authenticated'         => is_user_logged_in(),
                'checked_at'            => current_time( 'c' ),
            )
        );
    }

    public function snapshot( WP_REST_Request $request ): WP_REST_Response {
        $deals      = apply_filters( 'algq_agent_engine_snapshot_deals', array(), $request );
        $funds      = apply_filters( 'algq_agent_engine_snapshot_funds', array(), $request );
        $triggers   = apply_filters( 'algq_agent_engine_snapshot_triggers', array(), $request );
        $logs       = apply_filters( 'algq_agent_engine_snapshot_logs', array(), $request );
        $approvals  = array();
        $agent_runs = array();

        if ( class_exists( 'ALGQ_Approval_Gate' ) && is_callable( array( 'ALGQ_Approval_Gate', 'pending' ) ) ) {
            $approvals = ALGQ_Approval_Gate::pending( 100 );
        }

        if ( class_exists( 'ALGQ_Agent_Run_Repository' ) ) {
            $agent_runs = ALGQ_Agent_Run_Repository::get_instance()->recent_runs( 100 );
        }

        $snapshot = array(
            'deals'          => is_array( $deals ) ? array_values( $deals ) : array(),
            'funds'          => is_array( $funds ) ? array_values( $funds ) : array(),
            'triggers'       => is_array( $triggers ) ? array_values( $triggers ) : array(),
            'automationLogs' => is_array( $logs ) ? array_values( $logs ) : array(),
            'approvals'      => is_array( $approvals ) ? array_values( $approvals ) : array(),
            'agentRuns'      => is_array( $agent_runs ) ? array_values( $agent_runs ) : array(),
            'health'         => array(
                'agent_engine_active' => class_exists( 'ALGQ_Agent_Engine_Orchestrator' ),
                'bridge_version'      => self::VERSION,
            ),
        );

        $snapshot['revision']    = hash( 'sha256', wp_json_encode( $snapshot ) );
        $snapshot['generatedAt'] = current_time( 'c' );

        return rest_ensure_response( $snapshot );
    }

    public function service_call( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $service = sanitize_key( (string) $request->get_param( 'service' ) );
        $action  = sanitize_key( (string) $request->get_param( 'action' ) );
        $deal_id = sanitize_text_field( (string) $request->get_param( 'deal_id' ) );
        $payload = $request->get_param( 'payload' );
        $payload = is_array( $payload ) ? $payload : array();

        if ( '' === $service || '' === $action ) {
            return new WP_Error( 'algq_invalid_service_call', 'service and action are required.', array( 'status' => 400 ) );
        }

        $context = $this->request_context( $request, $deal_id );
        $args    = array(
            'deal_id' => $deal_id,
            'payload' => $payload,
            'context' => $context,
        );

        if ( function_exists( 'algq_platform_service_call' ) ) {
            $result = algq_platform_service_call( $service, $action, $args );
        } else {
            $result = apply_filters( 'algq_platform_service_call', null, $service, $action, $args, $context );
        }

        if ( is_wp_error( $result ) ) {
            return $result;
        }
        if ( null === $result ) {
            return new WP_Error(
                'algq_platform_service_unavailable',
                sprintf( 'No authoritative ARE service is registered for %s.%s.', $service, $action ),
                array( 'status' => 503 )
            );
        }

        do_action( 'algq_agent_engine_bridge_service_called', $service, $action, $deal_id, $context, $result );

        return rest_ensure_response(
            array(
                'ok'             => true,
                'data'           => $result,
                'correlation_id' => $context['correlation_id'],
            )
        );
    }

    public function agent_run( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! class_exists( 'ALGQ_Agent_Engine_Orchestrator' ) ) {
            return new WP_Error( 'algq_agent_engine_unavailable', 'Algonquian ARE Agent Engine plugin is not active.', array( 'status' => 503 ) );
        }

        $deal_id  = sanitize_text_field( (string) $request->get_param( 'deal_id' ) );
        $agent_id = sanitize_key( (string) $request->get_param( 'agent_id' ) );
        $skill_id = sanitize_text_field( (string) $request->get_param( 'skill_id' ) );
        $inputs   = $request->get_param( 'inputs' );
        $inputs   = is_array( $inputs ) ? $inputs : array();

        if ( '' === $deal_id || '' === $agent_id || '' === $skill_id ) {
            return new WP_Error( 'algq_invalid_agent_run', 'deal_id, agent_id, and skill_id are required.', array( 'status' => 400 ) );
        }

        $agent_id = $this->canonical_agent_id( $agent_id );
        $skill_id = $this->canonical_skill_id( $skill_id );
        $context  = array_merge(
            $inputs,
            $this->request_context( $request, $deal_id ),
            array(
                'target_skill'    => $skill_id,
                'trigger_type'    => 'api',
                'requested_action'=> $skill_id,
                'inputs'          => $inputs,
            )
        );

        $result = ALGQ_Agent_Engine_Orchestrator::get_instance()->orchestrate( $agent_id, $deal_id, $context );
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return rest_ensure_response(
            array(
                'ok'             => true,
                'data'           => $result,
                'correlation_id' => $context['correlation_id'],
            )
        );
    }

    public function resolve_approval( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! class_exists( 'ALGQ_Approval_Gate' ) ) {
            return new WP_Error( 'algq_approval_gate_unavailable', 'Agent Engine approval gate is not active.', array( 'status' => 503 ) );
        }

        $ticket_id = sanitize_text_field( (string) $request['ticket_id'] );
        $decision  = sanitize_key( (string) $request->get_param( 'decision' ) );
        if ( ! in_array( $decision, array( 'approved', 'rejected' ), true ) ) {
            return new WP_Error( 'algq_invalid_approval_decision', 'decision must be approved or rejected.', array( 'status' => 400 ) );
        }

        $numeric_id = ctype_digit( $ticket_id ) ? (int) $ticket_id : $this->approval_numeric_id( $ticket_id );
        if ( $numeric_id < 1 ) {
            return new WP_Error( 'algq_approval_not_found', 'Approval ticket was not found.', array( 'status' => 404 ) );
        }

        $result = ALGQ_Approval_Gate::decide( $numeric_id, $decision );
        if ( is_wp_error( $result ) ) {
            return $result;
        }

        do_action(
            'algq_agent_engine_bridge_approval_resolved',
            $numeric_id,
            $decision,
            sanitize_textarea_field( (string) $request->get_param( 'notes' ) )
        );

        return rest_ensure_response(
            array(
                'ok'        => true,
                'ticket_id' => $ticket_id,
                'decision'  => $decision,
                'decidedBy' => get_current_user_id(),
                'decidedAt' => current_time( 'c' ),
            )
        );
    }

    public function event( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $event   = sanitize_key( (string) $request->get_param( 'event' ) );
        $deal_id = sanitize_text_field( (string) $request->get_param( 'deal_id' ) );
        $payload = $request->get_param( 'payload' );
        $payload = is_array( $payload ) ? $payload : array();

        if ( '' === $event ) {
            return new WP_Error( 'algq_invalid_event', 'event is required.', array( 'status' => 400 ) );
        }

        $context = $this->request_context( $request, $deal_id );
        do_action( 'algq_platform_event', $event, $payload, $context );
        do_action( 'algq_agent_engine_event', $event, $payload, $context );

        return rest_ensure_response(
            array(
                'ok'             => true,
                'event'          => $event,
                'correlation_id' => $context['correlation_id'],
                'recorded_at'    => current_time( 'c' ),
            )
        );
    }

    public function register_admin_page(): void {
        if ( ! current_user_can( 'manage_algq_agent_engine' ) && ! current_user_can( 'manage_options' ) ) {
            return;
        }

        if ( class_exists( 'ALGQ_Agent_Engine' ) ) {
            add_submenu_page(
                'algq-agent-engine',
                'Connected Agent App',
                'Connected App',
                'manage_algq_agent_engine',
                'algq-agent-engine-connected',
                array( $this, 'render_admin_app' )
            );
            return;
        }

        add_management_page(
            'ARE Agent Engine',
            'ARE Agent Engine',
            'manage_options',
            'algq-agent-engine-connected',
            array( $this, 'render_admin_app' )
        );
    }

    public function render_admin_app(): void {
        if ( ! $this->can_manage_engine() ) {
            return;
        }
        echo '<div class="wrap"><h1>Algonquian ARE Agent Engine — Connected App</h1>';
        echo wp_kses( $this->app_embed_html( 'wordpress_admin' ), $this->embed_allowed_html() );
        echo '</div>';
    }

    public function render_app_shortcode(): string {
        if ( ! is_user_logged_in() ) {
            return '<div class="algq-agent-engine-access">' . esc_html__( 'Please sign in to access the ARE Agent Engine.', 'algq-agent-engine-bridge' ) . '</div>';
        }
        return $this->app_embed_html( 'website' );
    }

    private function app_embed_html( string $surface ): string {
        $app_url = esc_url( (string) apply_filters( 'algq_agent_engine_app_url', defined( 'ALGQ_AGENT_ENGINE_APP_URL' ) ? ALGQ_AGENT_ENGINE_APP_URL : 'https://algonquianrealestate.ai.studio' ) );
        $frame_id = 'algq-agent-engine-frame-' . wp_generate_password( 8, false, false );
        $user = wp_get_current_user();
        $config = array(
            'apiUrl'          => (string) apply_filters( 'algq_agent_engine_api_url', 'https://api.algonquianrealestate.com/v1' ),
            'wordpressRestUrl'=> untrailingslashit( rest_url( self::REST_NAMESPACE ) ),
            'wordpressNonce'  => wp_create_nonce( 'wp_rest' ),
            'surface'         => $surface,
            'syncMode'        => 'dual',
            'clientId'        => 'algq-agent-engine-wordpress',
            'appVersion'      => self::VERSION,
            'currentUserId'   => get_current_user_id(),
            'currentUserName' => $user->display_name,
            'capabilities'    => array_values( array_keys( array_filter( $user->allcaps ) ) ),
        );
        $json = wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );

        return sprintf(
            '<div class="algq-agent-engine-embed" style="min-height:780px;border:1px solid #dce4ea;border-radius:14px;overflow:hidden;background:#f4f7fa"><iframe id="%1$s" src="%2$s" title="Algonquian ARE Agent Engine" style="width:100%%;min-height:780px;border:0" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"></iframe></div><script>(function(){var f=document.getElementById(%3$s);if(!f)return;var config=%4$s;var send=function(){try{f.contentWindow.postMessage({type:"ARE_AGENT_ENGINE_CONFIG",config:config},new URL(f.src).origin);}catch(e){console.warn("ARE Agent Engine configuration bridge unavailable",e);}};f.addEventListener("load",send);window.addEventListener("message",function(e){if(e.source===f.contentWindow&&e.data&&e.data.type==="ARE_AGENT_ENGINE_SYNCED"){document.dispatchEvent(new CustomEvent("are:agent-engine:synced",{detail:e.data}));}});})();</script>',
            esc_attr( $frame_id ),
            $app_url,
            wp_json_encode( $frame_id ),
            $json
        );
    }

    private function embed_allowed_html(): array {
        return array(
            'div'    => array( 'class' => true, 'style' => true ),
            'iframe' => array( 'id' => true, 'src' => true, 'title' => true, 'style' => true, 'loading' => true, 'sandbox' => true ),
            'script' => array(),
        );
    }

    private function request_context( WP_REST_Request $request, string $deal_id = '' ): array {
        $correlation_id = sanitize_text_field( (string) ( $request->get_param( 'correlation_id' ) ?: $request->get_header( 'X-ARE-Correlation-ID' ) ) );
        if ( '' === $correlation_id ) {
            $correlation_id = 'wp-' . wp_generate_uuid4();
        }

        return array(
            'deal_id'          => $deal_id,
            'correlation_id'   => $correlation_id,
            'idempotency_key'  => sanitize_text_field( (string) ( $request->get_param( 'idempotency_key' ) ?: $request->get_header( 'X-ARE-Idempotency-Key' ) ) ),
            'source_surface'   => sanitize_key( (string) ( $request->get_param( 'source_surface' ) ?: $request->get_header( 'X-ARE-Source-Surface' ) ) ),
            'client'           => sanitize_text_field( (string) $request->get_header( 'X-ARE-Client' ) ),
            'client_version'   => sanitize_text_field( (string) $request->get_header( 'X-ARE-Client-Version' ) ),
            'wordpress_user_id'=> get_current_user_id(),
        );
    }

    private function canonical_agent_id( string $agent_id ): string {
        $map = array(
            'agent_intake'       => 'intake',
            'agent_underwriting' => 'underwriting',
            'agent_offers'       => 'offer',
            'agent_capital'      => 'capital',
            'agent_tasks'        => 'follow_up',
            'agent_documents'    => 'transaction',
            'agent_transaction'  => 'closing',
        );
        return $map[ $agent_id ] ?? sanitize_key( $agent_id );
    }

    private function canonical_skill_id( string $skill_id ): string {
        $map = array(
            'skill_parse_intake'          => 'intake.validate_submission',
            'skill_enrich_metadata'       => 'enrichment.collect_property_facts',
            'skill_verify_ownership'      => 'enrichment.collect_property_facts',
            'skill_calculate_mao'         => 'underwriting.run_preliminary',
            'skill_run_arv_comps'         => 'property_analysis.build_package',
            'skill_stress_rehab'          => 'underwriting.run_preliminary',
            'skill_generate_offer_draft'  => 'offer.prepare_draft',
            'skill_release_binding_offer' => 'offer.release_offer',
            'skill_seller_finance_terms'  => 'offer.prepare_draft',
            'skill_match_capital'         => 'capital.rank_sources',
            'skill_commit_capital'        => 'capital.commit_source',
            'skill_issue_term_sheet'      => 'capital.rank_sources',
            'skill_provision_google_tasks'=> 'follow_up.schedule_next_action',
            'skill_audit_due_diligence'   => 'transaction.review_milestones',
            'skill_escalate_overdue'      => 'follow_up.schedule_next_action',
            'skill_generate_purchase_contract' => 'offer.prepare_draft',
            'skill_generate_assignment_agreement' => 'transaction.review_milestones',
            'skill_draft_jv_agreement'    => 'capital.rank_sources',
            'skill_open_title_escrow'     => 'closing.assess_readiness',
            'skill_verify_pof'            => 'closing.assess_readiness',
            'skill_issue_closing_instructions' => 'closing.authorize_close',
        );
        return $map[ $skill_id ] ?? sanitize_text_field( $skill_id );
    }

    private function approval_numeric_id( string $ticket_id ): int {
        global $wpdb;
        $table = $wpdb->prefix . 'algq_agent_approvals';

        if ( preg_match( '/^(?:ticket-)?(\d+)$/', $ticket_id, $matches ) ) {
            $candidate = (int) $matches[1];
            $found = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE id = %d LIMIT 1", $candidate ) );
            if ( $found > 0 ) {
                return $found;
            }
        }

        return (int) $wpdb->get_var(
            $wpdb->prepare( "SELECT id FROM {$table} WHERE approval_uuid = %s LIMIT 1", $ticket_id )
        );
    }
}

ALGQ_Agent_Engine_Bridge::instance();
