<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Agent_Registry {
    private static ?ALGQ_Agent_Registry $instance = null;
    private array $agents = array();

    public static function get_instance(): ALGQ_Agent_Registry {
        return self::$instance ??= new self();
    }

    private function __construct() {
        $this->agents = $this->default_agents();
        $this->agents = apply_filters( 'algq_agent_registry', $this->agents );
    }

    public function all(): array {
        return $this->agents;
    }

    public function get_agent( string $agent_id ): ?array {
        $agent_id = sanitize_key( $agent_id );
        return $this->agents[ $agent_id ] ?? null;
    }

    public function agent_has_skill( string $agent_id, string $skill_id ): bool {
        $agent = $this->get_agent( $agent_id );
        return $agent && in_array( $skill_id, $agent['skills'], true );
    }

    private function default_agents(): array {
        return array(
            'intake' => array('name'=>'Intake Agent','authority'=>'Incoming opportunities','skills'=>array('intake.validate_submission','intake.create_handoff'),'approval_required'=>false),
            'enrichment' => array('name'=>'Enrichment Agent','authority'=>'Property intelligence','skills'=>array('enrichment.collect_property_facts'),'approval_required'=>false),
            'qualification' => array('name'=>'Qualification Agent','authority'=>'Lead qualification','skills'=>array('qualification.evaluate_deal'),'approval_required'=>false),
            'property_analysis' => array('name'=>'Property Analysis Agent','authority'=>'Property research','skills'=>array('property_analysis.build_package'),'approval_required'=>false),
            'underwriting' => array('name'=>'Underwriting Agent','authority'=>'Preliminary financial analysis','skills'=>array('underwriting.run_preliminary'),'approval_required'=>false),
            'acquisition' => array('name'=>'Acquisition Agent','authority'=>'Deal-structure recommendation','skills'=>array('acquisition.recommend_strategy'),'approval_required'=>true),
            'follow_up' => array('name'=>'Follow-Up Agent','authority'=>'Communication cadence','skills'=>array('follow_up.schedule_next_action'),'approval_required'=>false),
            'offer' => array('name'=>'Offer Agent','authority'=>'Draft offer preparation','skills'=>array('offer.prepare_draft','offer.release_offer'),'approval_required'=>false),
            'transaction' => array('name'=>'Transaction Agent','authority'=>'Executed-contract administration','skills'=>array('transaction.review_milestones'),'approval_required'=>false),
            'buyer' => array('name'=>'Buyer Agent','authority'=>'Disposition matching','skills'=>array('buyer.rank_matches'),'approval_required'=>false),
            'capital' => array('name'=>'Capital Agent','authority'=>'Funding matching','skills'=>array('capital.rank_sources','capital.commit_source'),'approval_required'=>false),
            'closing' => array('name'=>'Closing Agent','authority'=>'Closing coordination','skills'=>array('closing.assess_readiness','closing.authorize_close'),'approval_required'=>false),
            'relationship' => array('name'=>'Relationship Agent','authority'=>'Post-transaction CRM','skills'=>array('relationship.schedule_retention'),'approval_required'=>false),
            'executive' => array('name'=>'Executive Agent','authority'=>'Portfolio oversight','skills'=>array('executive.build_brief','executive.get_exceptions'),'approval_required'=>false),
        );
    }
}
