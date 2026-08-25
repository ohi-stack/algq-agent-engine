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
        wp_safe_redirect( add_query_arg( 'algq_notice', $status, admin_url( 'admin.php?page=algq-agent-engine#approvals' ) ) );
        exit;
    }

    public function render(): void {
        if ( ! current_user_can( 'manage_algq_agent_engine' ) ) { return; }

        $agents = ALGQ_Agent_Registry::get_instance()->all();
        $runs = ALGQ_Agent_Run_Repository::get_instance()->recent_runs( 25 );
        $approvals = ALGQ_Approval_Gate::pending( 25 );
        $gemini_configured = ALGQ_Agent_Engine::gemini_api_key_configured();
        ?>
        <div class="wrap algq-agent-engine are-app">
            <div class="are-shell">
                <header class="algq-hero are-header" id="overview">
                    <div>
                        <span class="algq-kicker are-kicker">ALGONQUIAN REAL ESTATE • ARE TECH</span>
                        <h1>Algonquian ARE Agent Engine</h1>
                        <p>Governed orchestration for transaction-advancing operational agents.</p>
                    </div>
                    <span class="algq-status are-badge">ENGINE <?php echo esc_html( ALGQ_AGENT_ENGINE_VERSION ); ?></span>
                </header>

                <nav class="are-nav" aria-label="ARE Agent Engine sections">
                    <a href="#overview">Overview</a>
                    <a href="#agents">Agents</a>
                    <a href="#approvals">Approvals</a>
                    <a href="#runs">Runs</a>
                    <a href="#deployment">Deployment</a>
                </nav>

                <?php if ( isset( $_GET['algq_notice'] ) ) : ?>
                    <?php $notice_ok = 'updated' === sanitize_key( wp_unslash( $_GET['algq_notice'] ) ); ?>
                    <div class="are-alert <?php echo esc_attr( $notice_ok ? 'are-alert--success' : 'are-alert--danger' ); ?>" role="status">
                        <?php echo esc_html( $notice_ok ? 'Approval action processed.' : 'The approval action could not be completed.' ); ?>
                    </div>
                <?php endif; ?>

                <section class="algq-grid algq-kpis are-grid are-grid--kpis" aria-label="Agent Engine key metrics">
                    <div class="algq-card are-card are-card--metric"><span class="are-card__label">STATUS</span><strong><?php echo esc_html( ALGQ_AGENT_ENGINE_STATUS ); ?></strong></div>
                    <div class="algq-card are-card are-card--metric"><span class="are-card__label">REGISTERED AGENTS</span><strong><?php echo esc_html( count( $agents ) ); ?></strong></div>
                    <div class="algq-card are-card are-card--metric"><span class="are-card__label">PENDING APPROVALS</span><strong><?php echo esc_html( count( $approvals ) ); ?></strong></div>
                    <div class="algq-card are-card are-card--metric"><span class="are-card__label">CANONICAL DEAL AUTHORITY</span><strong>Pipeline CRM</strong></div>
                </section>

                <section class="algq-panel are-panel" id="agents">
                    <div class="are-toolbar">
                        <div>
                            <h2>14-Agent Registry</h2>
                            <p class="are-panel__intro">Registered operational agents, their authorities, and allowlisted skills.</p>
                        </div>
                        <span class="are-badge">LIVE REGISTRY</span>
                    </div>
                    <div class="algq-agent-grid are-agent-grid">
                        <?php foreach ( $agents as $id => $agent ) : ?>
                            <article class="algq-agent-card are-card are-card--agent">
                                <span class="algq-agent-id are-agent-id"><?php echo esc_html( $id ); ?></span>
                                <h3><?php echo esc_html( $agent['name'] ); ?></h3>
                                <p><?php echo esc_html( $agent['authority'] ); ?></p>
                                <small><?php echo esc_html( implode( ' • ', $agent['skills'] ) ); ?></small>
                            </article>
                        <?php endforeach; ?>
                    </div>
                </section>

                <section class="algq-panel are-panel" id="approvals">
                    <div class="are-toolbar">
                        <div>
                            <h2>Human Approval Queue</h2>
                            <p class="are-panel__intro">Consequential actions remain paused until an authorized human decision is recorded.</p>
                        </div>
                        <span class="are-badge"><?php echo esc_html( count( $approvals ) ); ?> PENDING</span>
                    </div>
                    <?php if ( ! $approvals ) : ?>
                        <div class="algq-empty are-empty" role="status">
                            <strong>No actions are awaiting approval.</strong>
                            Consequential Agent Engine requests will appear here when human authorization is required.
                        </div>
                    <?php else : ?>
                        <table class="are-table">
                            <thead><tr><th>Deal</th><th>Agent</th><th>Skill</th><th>Requested</th><th>Decision</th></tr></thead>
                            <tbody>
                            <?php foreach ( $approvals as $approval ) : ?>
                                <tr>
                                    <td data-label="Deal"><?php echo esc_html( $approval['deal_id'] ); ?></td>
                                    <td data-label="Agent"><?php echo esc_html( $approval['agent_id'] ); ?></td>
                                    <td data-label="Skill"><?php echo esc_html( $approval['skill_id'] ); ?></td>
                                    <td data-label="Requested"><?php echo esc_html( $approval['requested_at'] ); ?></td>
                                    <td data-label="Decision">
                                        <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="algq-inline-form">
                                            <input type="hidden" name="action" value="algq_agent_approval_decision">
                                            <input type="hidden" name="approval_id" value="<?php echo esc_attr( $approval['id'] ); ?>">
                                            <?php wp_nonce_field( 'algq_agent_approval_decision' ); ?>
                                            <button class="are-btn are-btn--primary" name="decision" value="approved">Approve</button>
                                            <button class="are-btn are-btn--outline" name="decision" value="rejected">Reject</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </section>

                <section class="algq-panel are-panel" id="runs">
                    <div class="are-toolbar">
                        <div>
                            <h2>Recent Agent Runs</h2>
                            <p class="are-panel__intro">Truthful execution history sourced from persistent AgentRun records.</p>
                        </div>
                        <span class="are-badge"><?php echo esc_html( count( $runs ) ); ?> SHOWN</span>
                    </div>
                    <?php if ( ! $runs ) : ?>
                        <div class="algq-empty are-empty" role="status">
                            <strong>No agent runs have been recorded yet.</strong>
                            Completed, failed, paused, and replay-protected executions will appear here once orchestration begins.
                        </div>
                    <?php else : ?>
                        <table class="are-table">
                            <thead><tr><th>Run</th><th>Deal</th><th>Agent</th><th>Skill</th><th>Status</th><th>Started</th></tr></thead>
                            <tbody>
                            <?php foreach ( $runs as $run ) : ?>
                                <tr>
                                    <td data-label="Run"><code><?php echo esc_html( substr( $run['run_uuid'], 0, 8 ) ); ?></code></td>
                                    <td data-label="Deal"><?php echo esc_html( $run['deal_id'] ); ?></td>
                                    <td data-label="Agent"><?php echo esc_html( $run['agent_id'] ); ?></td>
                                    <td data-label="Skill"><?php echo esc_html( $run['skill_id'] ); ?></td>
                                    <td data-label="Status"><span class="algq-pill are-badge"><?php echo esc_html( strtoupper( $run['status'] ) ); ?></span></td>
                                    <td data-label="Started"><?php echo esc_html( $run['started_at'] ); ?></td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php endif; ?>
                </section>

                <section class="algq-panel are-panel" id="deployment">
                    <div class="are-toolbar">
                        <div>
                            <h2>Deployment &amp; Gemini API</h2>
                            <p class="are-panel__intro">Environment facts only; secrets are never rendered or committed.</p>
                        </div>
                        <span class="are-badge"><?php echo esc_html( ALGQ_AGENT_ENGINE_STATUS ); ?></span>
                    </div>
                    <table class="are-table">
                        <tbody>
                            <tr><th scope="row">Status</th><td data-label="Status"><span class="algq-pill are-badge"><?php echo esc_html( ALGQ_AGENT_ENGINE_STATUS ); ?></span></td></tr>
                            <tr><th scope="row">App URL</th><td data-label="App URL"><a href="<?php echo esc_url( ALGQ_AGENT_ENGINE_APP_URL ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( ALGQ_AGENT_ENGINE_APP_URL ); ?></a></td></tr>
                            <tr><th scope="row">Gemini API</th><td data-label="Gemini API">API Key</td></tr>
                            <tr>
                                <th scope="row">API Key Status</th>
                                <td data-label="API Key Status">
                                    <span class="algq-pill are-badge"><?php echo esc_html( $gemini_configured ? 'CONFIGURED' : 'ACTION REQUIRED' ); ?></span>
                                    <p class="description">The secret is never stored in this repository. Configure <code>ALGQ_GEMINI_API_KEY</code> in <code>wp-config.php</code> or provide the <code>GEMINI_API_KEY</code> environment variable.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
        <?php
    }
}
