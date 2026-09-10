<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) { exit; }

// Conservative uninstall: operational run, approval, and audit records are retained by default.
// Define ALGQ_AGENT_ENGINE_PURGE_ON_UNINSTALL as true before uninstalling to remove plugin-owned data.
if ( ! defined( 'ALGQ_AGENT_ENGINE_PURGE_ON_UNINSTALL' ) || true !== ALGQ_AGENT_ENGINE_PURGE_ON_UNINSTALL ) {
    return;
}

global $wpdb;
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}algq_agent_runs" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}algq_agent_approvals" );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}algq_agent_audit_log" );
delete_option( 'algq_agent_engine_version' );
