<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

final class ALGQ_Skill_Registry {
    private static ?ALGQ_Skill_Registry $instance = null;
    private array $skills = array();

    public static function get_instance(): ALGQ_Skill_Registry {
        return self::$instance ??= new self();
    }

    private function __construct() {
        $this->skills = $this->default_skills();
        $this->skills = apply_filters( 'algq_skill_registry', $this->skills );
    }

    public function all(): array { return $this->skills; }
    public function get_skill( string $skill_id ): ?array {
        return $this->skills[ sanitize_text_field( $skill_id ) ] ?? null;
    }

    public function execute_skill( string $skill_id, string $deal_id, array $context ): array|WP_Error {
        $skill = $this->get_skill( $skill_id );
        if ( ! $skill ) {
            return new WP_Error( 'invalid_skill', 'Requested skill is not registered.' );
        }
        $callback = $skill['callback'] ?? null;
        if ( ! is_callable( $callback ) ) {
            return new WP_Error( 'skill_unavailable', 'Registered skill has no executable callback.' );
        }
        return call_user_func( $callback, $deal_id, $context, $skill );
    }

    private function dispatch_to_platform( string $skill_id, string $deal_id, array $context ): array|WP_Error {
        return ALGQ_Platform_Service_Interface::get_instance()->execute( $skill_id, $deal_id, $context );
    }

    private function default_skills(): array {
        $platform = fn( string $skill_id ) => function( string $deal_id, array $context ) use ( $skill_id ) {
            return $this->dispatch_to_platform( $skill_id, $deal_id, $context );
        };

        return array(
            'intake.validate_submission' => array('approval'=>'none','allowed_states'=>array('LEAD_NEW'),'callback'=>$platform('intake.validate_submission')),
            'intake.create_handoff' => array('approval'=>'none','allowed_states'=>array('LEAD_NEW','QUALIFICATION'),'callback'=>$platform('intake.create_handoff')),
            'enrichment.collect_property_facts' => array('approval'=>'none','allowed_states'=>array('LEAD_NEW','ENRICHMENT'),'callback'=>$platform('enrichment.collect_property_facts')),
            'qualification.evaluate_deal' => array('approval'=>'none','allowed_states'=>array('QUALIFICATION','CONTACTED'),'callback'=>$platform('qualification.evaluate_deal')),
            'property_analysis.build_package' => array('approval'=>'none','allowed_states'=>array('UNDERWRITING','STRATEGY_REVIEW'),'callback'=>$platform('property_analysis.build_package')),
            'underwriting.run_preliminary' => array('approval'=>'none','allowed_states'=>array('UNDERWRITING'),'callback'=>$platform('underwriting.run_preliminary')),
            'acquisition.recommend_strategy' => array('approval'=>'required','allowed_states'=>array('STRATEGY_REVIEW','APPROVAL_REQUIRED'),'callback'=>$platform('acquisition.recommend_strategy')),
            'follow_up.schedule_next_action' => array('approval'=>'none','allowed_states'=>array('CONTACT_PENDING','CONTACTED','NURTURE','OFFER_SENT','NEGOTIATION'),'callback'=>$platform('follow_up.schedule_next_action')),
            'offer.prepare_draft' => array('approval'=>'required','allowed_states'=>array('OFFER_PREPARATION','OFFER_READY'),'callback'=>$platform('offer.prepare_draft')),
            'offer.release_offer' => array('approval'=>'required','allowed_states'=>array('OFFER_READY'),'callback'=>$platform('offer.release_offer')),
            'transaction.review_milestones' => array('approval'=>'none','allowed_states'=>array('UNDER_CONTRACT','DUE_DILIGENCE','CLOSING_PREP'),'callback'=>$platform('transaction.review_milestones')),
            'buyer.rank_matches' => array('approval'=>'none','allowed_states'=>array('BUYER_MATCH','DUE_DILIGENCE'),'callback'=>$platform('buyer.rank_matches')),
            'capital.rank_sources' => array('approval'=>'none','allowed_states'=>array('CAPITAL_MATCH','DUE_DILIGENCE'),'callback'=>$platform('capital.rank_sources')),
            'capital.commit_source' => array('approval'=>'required','allowed_states'=>array('CAPITAL_MATCH'),'callback'=>$platform('capital.commit_source')),
            'closing.assess_readiness' => array('approval'=>'none','allowed_states'=>array('CLOSING_PREP','CLOSING_READY'),'callback'=>$platform('closing.assess_readiness')),
            'closing.authorize_close' => array('approval'=>'required','allowed_states'=>array('CLOSING_READY'),'callback'=>$platform('closing.authorize_close')),
            'relationship.schedule_retention' => array('approval'=>'none','allowed_states'=>array('POST_CLOSE','ARCHIVED'),'callback'=>$platform('relationship.schedule_retention')),
            'executive.build_brief' => array('approval'=>'none','allowed_states'=>array('*'),'callback'=>$platform('executive.build_brief')),
            'executive.get_exceptions' => array('approval'=>'none','allowed_states'=>array('*'),'callback'=>$platform('executive.get_exceptions')),
        );
    }
}
