<?php
/**
 * Plugin Name: Algonquian ARE Agent Engine
 * Plugin URI: https://algonquianrealestate.com/technology/
 * Description: Orchestration, skills, approvals, execution runs, and audit controls for Algonquian Real Estate operational agents.
 * Version: 0.1.0
 * Requires at least: 6.8
 * Requires PHP: 8.2
 * Author: Algonquian Real Estate, LLC
 * Author URI: https://algonquianrealestate.com/technology/
 * Text Domain: algq-agent-engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'ALGQ_AGENT_ENGINE_VERSION', '0.1.0' );
define( 'ALGQ_AGENT_ENGINE_FILE', __FILE__ );
define( 'ALGQ_AGENT_ENGINE_DIR', plugin_dir_path( __FILE__ ) );
define( 'ALGQ_AGENT_ENGINE_URL', plugin_dir_url( __FILE__ ) );

require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-agent-registry.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-skill-registry.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-platform-service-interface.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-agent-run-repository.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-approval-gate.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-agent-engine-orchestrator.php';
require_once ALGQ_AGENT_ENGINE_DIR . 'includes/class-algq-agent-engine-admin.php';

final class ALGQ_Agent_Engine {
    private static ?ALGQ_Agent_Engine $instance = null;

    public static function instance(): ALGQ_Agent_Engine {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'plugins_loaded', array( $this, 'boot' ) );
    }

    public function boot(): void {
        ALGQ_Agent_Registry::get_instance();
        ALGQ_Skill_Registry::get_instance();
        ALGQ_Agent_Engine_Orchestrator::get_instance();
        ALGQ_Agent_Engine_Admin::get_instance();

        do_action( 'algq_agent_engine_ready', ALGQ_AGENT_ENGINE_VERSION );
    }

    public static function activate(): void {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset = $wpdb->get_charset_collate();

        $runs = $wpdb->prefix . 'algq_agent_runs';
        $approvals = $wpdb->prefix . 'algq_agent_approvals';
        $audit = $wpdb->prefix . 'algq_agent_audit_log';

        dbDelta( "CREATE TABLE {$runs} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            run_uuid char(36) NOT NULL,
            correlation_key varchar(191) NOT NULL,
            deal_id varchar(191) NOT NULL,
            agent_id varchar(100) NOT NULL,
            skill_id varchar(150) NOT NULL,
            trigger_type varchar(100) NOT NULL DEFAULT 'manual',
            status varchar(50) NOT NULL,
            approval_id bigint unsigned NULL,
            input_hash char(64) NOT NULL,
            result_json longtext NULL,
            error_code varchar(100) NULL,
            started_at datetime NOT NULL,
            completed_at datetime NULL,
            created_by bigint unsigned NOT NULL DEFAULT 0,
            PRIMARY KEY  (id),
            UNIQUE KEY run_uuid (run_uuid),
            UNIQUE KEY correlation_key (correlation_key),
            KEY deal_id (deal_id),
            KEY agent_status (agent_id,status)
        ) {$charset};" );

        dbDelta( "CREATE TABLE {$approvals} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            approval_uuid char(36) NOT NULL,
            deal_id varchar(191) NOT NULL,
            agent_id varchar(100) NOT NULL,
            skill_id varchar(150) NOT NULL,
            action_type varchar(150) NOT NULL,
            status varchar(30) NOT NULL DEFAULT 'pending',
            request_json longtext NULL,
            conditions_json longtext NULL,
            requested_at datetime NOT NULL,
            requested_by bigint unsigned NOT NULL DEFAULT 0,
            decided_at datetime NULL,
            decided_by bigint unsigned NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY approval_uuid (approval_uuid),
            KEY deal_status (deal_id,status)
        ) {$charset};" );

        dbDelta( "CREATE TABLE {$audit} (
            id bigint unsigned NOT NULL AUTO_INCREMENT,
            event_uuid char(36) NOT NULL,
            run_uuid char(36) NULL,
            deal_id varchar(191) NOT NULL,
            agent_id varchar(100) NOT NULL,
            event_type varchar(100) NOT NULL,
            event_json longtext NULL,
            created_at datetime NOT NULL,
            created_by bigint unsigned NOT NULL DEFAULT 0,
            PRIMARY KEY  (id),
            UNIQUE KEY event_uuid (event_uuid),
            KEY deal_id (deal_id),
            KEY run_uuid (run_uuid),
            KEY event_type (event_type)
        ) {$charset};" );

        $admin = get_role( 'administrator' );
        if ( $admin ) {
            $admin->add_cap( 'manage_algq_agent_engine' );
            $admin->add_cap( 'approve_algq_agent_actions' );
        }

        update_option( 'algq_agent_engine_version', ALGQ_AGENT_ENGINE_VERSION, false );
    }
}

register_activation_hook( __FILE__, array( 'ALGQ_Agent_Engine', 'activate' ) );
ALGQ_Agent_Engine::instance();
