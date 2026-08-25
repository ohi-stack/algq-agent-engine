<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Agent_Engine_Admin {
    private static ?ALGQ_Agent_Engine_Admin $instance = null;

    public static function get_instance(): ALGQ_Agent_Engine_Admin {
        return self::$instance ??= new self();
    }

    private function __construct() {
        add_action( 'admin_menu', array( $this, 'menu' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'assets' ) );
        add_action( 'admin_post_algq_agent_approval_decision', array( $this, 'handle_approval' ) );
    }

    public function menu(): void {
        add_menu_page(
            'ARE Agent Engine',
            'ARE Agent Engine',
            'manage_algq_agent_engine',
            'algq-agent-engine',
            array( $this, 'render' ),
            'dashicons-networking',
            58
        );
    }

    public function assets( string $hook ): void {
        if ( 'toplevel_page_algq-agent-engine' !== $hook ) { return; }
        wp_enqueue_style( 'algq-agent-engine-admin', ALGQ_AGENT_ENGINE_URL . 'assets/admin.css', array(), ALGQ_AGENT_ENGINE_VERSION );
    }

    public function handle_approval(): void {
        if ( ! current_user_can( 'approve_algq_agent_actions' ) ) {
            wp_die( esc_html__( 'You are not authorized to approve agent actions.', 'algq-agent-engine' ) );
        }
        check_admin_referer( 'algq_agent_approval_decision' );
        $approval_id = absint( $_POST['approval_id'] ?? 0 );
        $decision = sanitize_key( $_POST['decision'] ?? '' );
        $result = ALGQ_Approval_Gate::decide( $approval_id, $decision );
        $status = is_wp_error( $result ) ? 'error' : 'updated';
        wp_safe_redirect( add_query_arg( 'algq_notice', $status, admin_url( 'admin.php?page=algq-agent-engine' ) ) );
        exit;
    }

    public function render(): void {
        if ( ! current_user_can( 'manage_algq_agent_engine' ) ) { return; }
        $agents = ALGQ_Agent_Registry::get_instance()->all();
        $runs = ALGQ_Agent_Run_Repository::get_instance()->recent_runs( 25 );
        $approvals = ALGQ_Approval_Gate::pending( 25 );
        ?>
        <div class="wrap algq-agent-engine">
            <div class="algq-hero">
                <div>
                    <span class="algq-kicker">ALGONQUIAN REAL ESTATE • ARE TECH</span>
                    <h1>Algonquian ARE Agent Engine</h1>
                    <p>Governed orchestration for transaction-advancing operational agents.</p>
                </div>
                <span class="algq-status">ENGINE <?php echo esc_html( ALGQ_AGENT_ENGINE_VERSION ); ?></span>
            </div>

            <?php if ( isset( $_GET['algq_notice'] ) ) : ?>
                <div class="notice notice-<?php echo 'updated' === sanitize_key( $_GET['algq_notice'] ) ? 'success' : 'error'; ?> is-dismissible"><p>Approval action processed.</p></div>
            <?php endif; ?>

            <div class="algq-grid algq-kpis">
                <div class="algq-card"><span>REGISTERED AGENTS</span><strong><?php echo esc_html( count( $agents ) ); ?></strong></div>
                <div class="algq-card"><span>PENDING APPROVALS</span><strong><?php echo esc_html( count( $approvals ) ); ?></strong></div>
                <div class="algq-card"><span>RECENT RUNS</span><strong><?php echo esc_html( count( $runs ) ); ?></strong></div>
                <div class="algq-card"><span>CANONICAL DEAL AUTHORITY</span><strong>Pipeline CRM</strong></div>
            </div>

            <div class="algq-panel">
                <h2>14-Agent Registry</h2>
                <div class="algq-agent-grid">
                    <?php foreach ( $agents as $id => $agent ) : ?>
                        <div class="algq-agent-card">
                            <span class="algq-agent-id"><?php echo esc_html( $id ); ?></span>
                            <h3><?php echo esc_html( $agent['name'] ); ?></h3>
                            <p><?php echo esc_html( $agent['authority'] ); ?></p>
                            <small><?php echo esc_html( implode( ' • ', $agent['skills'] ) ); ?></small>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="algq-panel">
                <h2>Human Approval Queue</h2>
                <?php if ( ! $approvals ) : ?>
                    <p class="algq-empty">No actions are awaiting approval.</p>
                <?php else : ?>
                    <table class="widefat striped"><thead><tr><th>Deal</th><th>Agent</th><th>Skill</th><th>Requested</th><th>Decision</th></tr></thead><tbody>
                    <?php foreach ( $approvals as $approval ) : ?>
                        <tr>
                            <td><?php echo esc_html( $approval['deal_id'] ); ?></td>
                            <td><?php echo esc_html( $approval['agent_id'] ); ?></td>
                            <td><?php echo esc_html( $approval['skill_id'] ); ?></td>
                            <td><?php echo esc_html( $approval['requested_at'] ); ?></td>
                            <td>
                                <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="algq-inline-form">
                                    <input type="hidden" name="action" value="algq_agent_approval_decision">
                                    <input type="hidden" name="approval_id" value="<?php echo esc_attr( $approval['id'] ); ?>">
                                    <?php wp_nonce_field( 'algq_agent_approval_decision' ); ?>
                                    <button class="button button-primary" name="decision" value="approved">Approve</button>
                                    <button class="button" name="decision" value="rejected">Reject</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody></table>
                <?php endif; ?>
            </div>

            <div class="algq-panel">
                <h2>Recent Agent Runs</h2>
                <?php if ( ! $runs ) : ?>
                    <p class="algq-empty">No agent runs have been recorded yet.</p>
                <?php else : ?>
                    <table class="widefat striped"><thead><tr><th>Run</th><th>Deal</th><th>Agent</th><th>Skill</th><th>Status</th><th>Started</th></tr></thead><tbody>
                    <?php foreach ( $runs as $run ) : ?>
                        <tr>
                            <td><code><?php echo esc_html( substr( $run['run_uuid'], 0, 8 ) ); ?></code></td>
                            <td><?php echo esc_html( $run['deal_id'] ); ?></td>
                            <td><?php echo esc_html( $run['agent_id'] ); ?></td>
                            <td><?php echo esc_html( $run['skill_id'] ); ?></td>
                            <td><span class="algq-pill"><?php echo esc_html( strtoupper( $run['status'] ) ); ?></span></td>
                            <td><?php echo esc_html( $run['started_at'] ); ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody></table>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
}
