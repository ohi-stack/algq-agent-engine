import type { ARESkillDefinition } from "./types";

const baseGuardrails = [
  "Use canonical ARE records; never create a competing system of record.",
  "Propagate request_id and correlation_id to every service call and audit event.",
  "Never expose model, API, service, lender, banking, or signing secrets.",
  "Keep facts, documented status, assumptions, projections, and recommendations distinct.",
];

const reviewGuardrails = [
  ...baseGuardrails,
  "Human leadership retains final authority over acquisition strategy, price, negotiation, offers, contracts, financing, capital commitments, funds movement, and closing.",
];

export const ARE_SKILL_REGISTRY: ARESkillDefinition[] = [
  {
    id: "are.intake.capture_submission", version: "1.0.0", name: "Capture Property Submission", agentId: "agent_intake",
    description: "Validate and normalize seller/property intake before authoritative persistence.",
    objective: "Create a complete traceable intake record without creating a duplicate Deal.",
    serviceId: "intake.submissions", operation: "create", serviceStatus: "planned", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "low", idempotencyTtlSeconds: 86400,
    requiredScopes: ["intake:create"],
    requiredInputs: [
      { name: "seller", type: "object", required: true, description: "Seller/contact data supplied through Deal Intake." },
      { name: "property", type: "object", required: true, description: "Property address and intake facts." },
      { name: "consent", type: "object", required: true, description: "Versioned consent/privacy evidence." }
    ],
    outputs: ["intake_submission_id", "intake_status", "duplicate_signal"], guardrails: baseGuardrails,
    successEvent: "are.skill.intake.capture_submission.completed", failureEvent: "are.skill.intake.capture_submission.failed"
  },
  {
    id: "are.intake.check_completeness", version: "1.0.0", name: "Check Intake Completeness", agentId: "agent_intake",
    description: "Identify missing seller, property, consent, attachment, and source information.",
    objective: "Prevent incomplete opportunities from entering qualification without a next action.",
    serviceId: "intake.submissions", operation: "validate", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 900,
    requiredScopes: ["intake:read"], requiredInputs: [{ name: "intakeSubmissionId", type: "string", required: true, description: "Authoritative intake identifier." }],
    outputs: ["complete", "missing_fields", "recommended_next_action"], guardrails: baseGuardrails,
    successEvent: "are.skill.intake.check_completeness.completed", failureEvent: "are.skill.intake.check_completeness.failed"
  },
  {
    id: "are.intake.detect_duplicate", version: "1.0.0", name: "Detect Duplicate Intake", agentId: "agent_intake",
    description: "Compare intake provenance and canonical Deal source identities for likely duplicates.",
    objective: "Prevent duplicate submissions from creating duplicate canonical Deals.",
    serviceId: "intake.submissions", operation: "duplicates", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 3600,
    requiredScopes: ["intake:read", "deals:read"], requiredInputs: [{ name: "intakeSubmissionId", type: "string", required: true, description: "Submission to compare." }],
    outputs: ["duplicate_probability", "matching_submission_ids", "matching_deal_ids"], guardrails: baseGuardrails,
    successEvent: "are.skill.intake.detect_duplicate.completed", failureEvent: "are.skill.intake.detect_duplicate.failed"
  },
  {
    id: "are.intake.promote_to_deal", version: "1.0.0", name: "Promote Accepted Intake to Canonical Deal", agentId: "agent_intake",
    description: "Create exactly one Pipeline CRM Deal from accepted intake using source idempotency.",
    objective: "Transfer transaction authority from intake to Pipeline CRM cleanly.",
    serviceId: "pipeline.deals", operation: "create", serviceStatus: "available", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 86400,
    requiredScopes: ["deals:write"], requiredInputs: [{ name: "intakeSubmissionId", type: "string", required: true, description: "Accepted intake submission." }],
    outputs: ["deal_id", "deal_number", "pipeline_stage"], guardrails: [...baseGuardrails, "Use source identity idempotency and persist only the canonical Deal identifier returned by Pipeline CRM."],
    successEvent: "are.skill.intake.promote_to_deal.completed", failureEvent: "are.skill.intake.promote_to_deal.failed"
  },

  {
    id: "are.enrichment.research_property_facts", version: "1.0.0", name: "Research Property Facts", agentId: "agent_enrichment",
    description: "Gather parcel, municipal, tax, zoning, unit-count, and public-record facts from documented sources.",
    objective: "Improve Deal quality without replacing authoritative public records or professional diligence.",
    serviceId: "research.property", operation: "facts", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 21600,
    requiredScopes: ["research:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["facts", "sources", "confidence", "unresolved_items"], guardrails: [...baseGuardrails, "Label unverified third-party data as unverified until evidence is stored."],
    successEvent: "are.skill.enrichment.research_property_facts.completed", failureEvent: "are.skill.enrichment.research_property_facts.failed"
  },
  {
    id: "are.enrichment.research_ownership", version: "1.0.0", name: "Research Ownership Record", agentId: "agent_enrichment",
    description: "Collect available owner-of-record and deed-reference information for operational follow-up.",
    objective: "Support seller/contact verification without making title or legal ownership determinations.",
    serviceId: "research.property", operation: "ownership", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "medium", idempotencyTtlSeconds: 21600,
    requiredScopes: ["research:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["owner_of_record", "recording_references", "sources", "verification_status"], guardrails: [...baseGuardrails, "Do not represent public-record research as a title opinion."],
    successEvent: "are.skill.enrichment.research_ownership.completed", failureEvent: "are.skill.enrichment.research_ownership.failed"
  },
  {
    id: "are.enrichment.reconcile_contact", version: "1.0.0", name: "Reconcile Contact Identity", agentId: "agent_enrichment",
    description: "Match seller/contact information to the shared CRM relationship layer using source identities.",
    objective: "Link records rather than create unnecessary duplicate contacts.",
    serviceId: "crm.relationships", operation: "reconcile_contact", serviceStatus: "candidate", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 86400,
    requiredScopes: ["crm:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Deal whose contact needs reconciliation." }],
    outputs: ["contact_id", "match_type", "source_identity"], guardrails: baseGuardrails,
    successEvent: "are.skill.enrichment.reconcile_contact.completed", failureEvent: "are.skill.enrichment.reconcile_contact.failed"
  },
  {
    id: "are.enrichment.write_activity", version: "1.0.0", name: "Write Enrichment Activity", agentId: "agent_enrichment",
    description: "Append a source-grounded enrichment summary to the canonical Deal activity stream.",
    objective: "Preserve what was learned, source quality, unresolved items, and next action.",
    serviceId: "pipeline.deals", operation: "activity", serviceStatus: "available", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "low", idempotencyTtlSeconds: 3600,
    requiredScopes: ["deals:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "summary", type: "string", required: true, description: "Source-grounded enrichment summary." }],
    outputs: ["activity_id"], guardrails: baseGuardrails,
    successEvent: "are.skill.enrichment.write_activity.completed", failureEvent: "are.skill.enrichment.write_activity.failed"
  },

  {
    id: "are.qualification.score_lead", version: "1.0.0", name: "Score Acquisition Lead", agentId: "agent_qualification",
    description: "Score fit using acquisition criteria, motivation, timing, property facts, and completeness.",
    objective: "Prioritize human attention on opportunities with a defensible path to transaction.",
    serviceId: "qualification.leads", operation: "score", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 1800,
    requiredScopes: ["deals:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["score", "fit", "reasons", "missing_information"], guardrails: baseGuardrails,
    successEvent: "are.skill.qualification.score_lead.completed", failureEvent: "are.skill.qualification.score_lead.failed"
  },
  {
    id: "are.qualification.recommend_disposition", version: "1.0.0", name: "Recommend Qualification Disposition", agentId: "agent_qualification",
    description: "Recommend qualify, nurture, hold, or disqualify with explicit reason codes.",
    objective: "Ensure every reviewed lead receives a documented path and next action.",
    serviceId: "qualification.leads", operation: "recommend", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "review_required", risk: "medium", idempotencyTtlSeconds: 1800,
    requiredScopes: ["deals:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["recommended_disposition", "reason_codes", "next_action", "follow_up_date"], guardrails: baseGuardrails,
    successEvent: "are.skill.qualification.recommend_disposition.completed", failureEvent: "are.skill.qualification.recommend_disposition.failed"
  },
  {
    id: "are.qualification.set_next_action", version: "1.0.0", name: "Set Qualification Next Action", agentId: "agent_qualification",
    description: "Write a concrete next action and due date to the canonical Deal after review.",
    objective: "Enforce the no-dead-deals operating rule.",
    serviceId: "pipeline.deals", operation: "update", serviceStatus: "available", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "low", idempotencyTtlSeconds: 900,
    requiredScopes: ["deals:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "nextAction", type: "string", required: true, description: "Required next action." }, { name: "dueAt", type: "string", required: true, description: "Deadline/follow-up time." }],
    outputs: ["deal_id", "record_version", "next_action"], guardrails: baseGuardrails,
    successEvent: "are.skill.qualification.set_next_action.completed", failureEvent: "are.skill.qualification.set_next_action.failed"
  },
  {
    id: "are.qualification.advance_to_underwriting", version: "1.0.0", name: "Advance Qualified Deal to Underwriting", agentId: "agent_qualification",
    description: "Request a valid Pipeline CRM transition for a qualified Deal.",
    objective: "Move qualified opportunities into financial analysis without bypassing CRM transition rules.",
    serviceId: "pipeline.deals", operation: "transition", serviceStatus: "available", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 3600,
    requiredScopes: ["deals:transition"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "expectedVersion", type: "number", required: true, description: "Optimistic concurrency version." }],
    outputs: ["deal_id", "stage", "record_version"], guardrails: baseGuardrails,
    successEvent: "are.skill.qualification.advance_to_underwriting.completed", failureEvent: "are.skill.qualification.advance_to_underwriting.failed"
  },

  {
    id: "are.property.analyze_comps", version: "1.0.0", name: "Analyze Comparable Sales", agentId: "agent_property_analysis",
    description: "Organize comparable-sale evidence and adjustments for underwriting review.",
    objective: "Produce a sourced comp set for ARV analysis without presenting an appraisal.",
    serviceId: "analysis.property", operation: "comps", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "medium", idempotencyTtlSeconds: 21600,
    requiredScopes: ["analysis:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["comps", "adjustments", "indicated_range", "sources"], guardrails: [...baseGuardrails, "Do not describe the result as a licensed appraisal."],
    successEvent: "are.skill.property.analyze_comps.completed", failureEvent: "are.skill.property.analyze_comps.failed"
  },
  {
    id: "are.property.analyze_rents", version: "1.0.0", name: "Analyze Market Rents", agentId: "agent_property_analysis",
    description: "Research comparable rents and unit-level income assumptions.",
    objective: "Supply documented rent assumptions for small-multifamily and rental scenarios.",
    serviceId: "analysis.property", operation: "rents", serviceStatus: "planned", executionMode: "research", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 21600,
    requiredScopes: ["analysis:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["rent_comps", "unit_rent_range", "sources", "assumptions"], guardrails: baseGuardrails,
    successEvent: "are.skill.property.analyze_rents.completed", failureEvent: "are.skill.property.analyze_rents.failed"
  },
  {
    id: "are.property.organize_rehab_inputs", version: "1.0.0", name: "Organize Rehab Inputs", agentId: "agent_property_analysis",
    description: "Organize condition observations and documented contractor/estimator inputs into underwriting categories.",
    objective: "Create traceable repair assumptions without presenting an inspection or engineering opinion.",
    serviceId: "analysis.property", operation: "rehab_inputs", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "review_required", risk: "medium", idempotencyTtlSeconds: 3600,
    requiredScopes: ["analysis:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["repair_categories", "estimate_range", "source_inputs", "unknowns"], guardrails: [...baseGuardrails, "Do not present visual observations as a licensed inspection, engineering report, or contractor commitment."],
    successEvent: "are.skill.property.organize_rehab_inputs.completed", failureEvent: "are.skill.property.organize_rehab_inputs.failed"
  },
  {
    id: "are.property.prepare_analysis_package", version: "1.0.0", name: "Prepare Property Analysis Package", agentId: "agent_property_analysis",
    description: "Assemble sourced comps, rents, facts, repair inputs, assumptions, and open questions.",
    objective: "Give underwriting a complete evidence package with explicit uncertainty.",
    serviceId: "analysis.property", operation: "package", serviceStatus: "planned", executionMode: "draft", effect: "draft", approval: "none", risk: "low", idempotencyTtlSeconds: 3600,
    requiredScopes: ["analysis:property"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["analysis_package", "assumptions", "risks", "missing_evidence"], guardrails: baseGuardrails,
    successEvent: "are.skill.property.prepare_analysis_package.completed", failureEvent: "are.skill.property.prepare_analysis_package.failed"
  },

  {
    id: "are.underwriting.calculate_mao", version: "1.0.0", name: "Calculate MAO Scenario", agentId: "agent_underwriting",
    description: "Request a versioned MAO calculation from the authoritative MAO Engine.",
    objective: "Centralize deterministic acquisition math in MAO Engine rather than the AI layer.",
    serviceId: "underwriting.scenarios", operation: "calculate_mao", serviceStatus: "planned", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 3600,
    requiredScopes: ["underwriting:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "scenarioInputs", type: "object", required: true, description: "Calculation inputs and assumptions." }],
    outputs: ["scenario_id", "mao", "formula_inputs", "assumptions"], guardrails: [...baseGuardrails, "The AI layer must not independently overwrite authoritative underwriting figures."],
    successEvent: "are.skill.underwriting.calculate_mao.completed", failureEvent: "are.skill.underwriting.calculate_mao.failed"
  },
  {
    id: "are.underwriting.calculate_rental", version: "1.0.0", name: "Calculate Rental Scenario", agentId: "agent_underwriting",
    description: "Request NOI, cash-flow, DSCR, and debt-service calculations from MAO Engine.",
    objective: "Evaluate hold economics with explicit assumptions.",
    serviceId: "underwriting.scenarios", operation: "calculate_rental", serviceStatus: "planned", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 3600,
    requiredScopes: ["underwriting:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "scenarioInputs", type: "object", required: true, description: "Rental and financing assumptions." }],
    outputs: ["scenario_id", "noi", "cash_flow", "dscr", "assumptions"], guardrails: baseGuardrails,
    successEvent: "are.skill.underwriting.calculate_rental.completed", failureEvent: "are.skill.underwriting.calculate_rental.failed"
  },
  {
    id: "are.underwriting.calculate_seller_financing", version: "1.0.0", name: "Calculate Seller-Financing Scenario", agentId: "agent_underwriting",
    description: "Request amortization, balloon, cash-flow, and acquisition-impact calculations from MAO Engine.",
    objective: "Analyze seller financing as a distinct acquisition structure.",
    serviceId: "underwriting.scenarios", operation: "calculate_seller_financing", serviceStatus: "planned", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "medium", idempotencyTtlSeconds: 3600,
    requiredScopes: ["underwriting:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "terms", type: "object", required: true, description: "Proposed seller-financing assumptions." }],
    outputs: ["scenario_id", "payment", "balloon", "cash_required", "risk_flags"], guardrails: [...baseGuardrails, "Keep seller financing operationally and legally distinct from Subject-To."],
    successEvent: "are.skill.underwriting.calculate_seller_financing.completed", failureEvent: "are.skill.underwriting.calculate_seller_financing.failed"
  },
  {
    id: "are.underwriting.recommend_scenario", version: "1.0.0", name: "Recommend Underwriting Scenario", agentId: "agent_underwriting",
    description: "Compare authoritative underwriting scenarios and explain assumptions, risks, and tradeoffs.",
    objective: "Provide a review-ready recommendation without setting final strategy or price.",
    serviceId: "underwriting.scenarios", operation: "compare", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "review_required", risk: "high", idempotencyTtlSeconds: 1800,
    requiredScopes: ["underwriting:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["recommended_scenario_id", "reasoning_summary", "risk_flags", "approval_questions"], guardrails: reviewGuardrails,
    successEvent: "are.skill.underwriting.recommend_scenario.completed", failureEvent: "are.skill.underwriting.recommend_scenario.failed"
  },

  {
    id: "are.acquisition.compare_structures", version: "1.0.0", name: "Compare Acquisition Structures", agentId: "agent_acquisition",
    description: "Compare conventional, seller-financed, lender-supported, JV/equity, and other documented structures.",
    objective: "Identify financially defensible paths without committing ARE to terms.",
    serviceId: "acquisition.strategy", operation: "compare", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "review_required", risk: "high", idempotencyTtlSeconds: 1800,
    requiredScopes: ["underwriting:read", "deals:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["structures", "tradeoffs", "recommended_path", "required_professional_review"], guardrails: reviewGuardrails,
    successEvent: "are.skill.acquisition.compare_structures.completed", failureEvent: "are.skill.acquisition.compare_structures.failed"
  },
  {
    id: "are.acquisition.prepare_strategy_review", version: "1.0.0", name: "Prepare Acquisition Strategy Review", agentId: "agent_acquisition",
    description: "Assemble pricing, underwriting, risks, financing path, contingencies, and unresolved questions for human review.",
    objective: "Present a decision packet before any material offer preparation.",
    serviceId: "acquisition.strategy", operation: "review_packet", serviceStatus: "planned", executionMode: "draft", effect: "draft", approval: "review_required", risk: "high", idempotencyTtlSeconds: 1800,
    requiredScopes: ["deals:read", "underwriting:read", "funding:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["strategy_packet", "decision_points", "risk_register", "missing_items"], guardrails: reviewGuardrails,
    successEvent: "are.skill.acquisition.prepare_strategy_review.completed", failureEvent: "are.skill.acquisition.prepare_strategy_review.failed"
  },
  {
    id: "are.acquisition.record_approved_strategy", version: "1.0.0", name: "Record Approved Acquisition Strategy", agentId: "agent_acquisition",
    description: "Persist a human-approved strategy reference and next action to the canonical Deal.",
    objective: "Make approval auditable without allowing the agent to approve itself.",
    serviceId: "pipeline.deals", operation: "update", serviceStatus: "available", executionMode: "service_call", effect: "operational_write", approval: "human_required", risk: "high", idempotencyTtlSeconds: 86400,
    requiredScopes: ["deals:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "approvalId", type: "string", required: true, description: "Human approval record." }, { name: "strategy", type: "string", required: true, description: "Approved strategy label." }],
    outputs: ["deal_id", "strategy", "record_version"], guardrails: reviewGuardrails,
    successEvent: "are.skill.acquisition.record_approved_strategy.completed", failureEvent: "are.skill.acquisition.record_approved_strategy.failed"
  },
  {
    id: "are.acquisition.prepare_offer_request", version: "1.0.0", name: "Prepare Offer Draft Request", agentId: "agent_acquisition",
    description: "Prepare the inputs needed for Offer Generator after human strategy/price approval.",
    objective: "Move the Deal toward offer drafting without transmitting or binding ARE to terms.",
    serviceId: "offers.proposals", operation: "prepare_request", serviceStatus: "planned", executionMode: "draft", effect: "draft", approval: "human_required", risk: "high", idempotencyTtlSeconds: 7200,
    requiredScopes: ["offers:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "approvalId", type: "string", required: true, description: "Approved strategy/price reference." }],
    outputs: ["offer_request", "approved_inputs", "missing_items"], guardrails: reviewGuardrails,
    successEvent: "are.skill.acquisition.prepare_offer_request.completed", failureEvent: "are.skill.acquisition.prepare_offer_request.failed"
  },

  {
    id: "are.followup.plan_seller_followup", version: "1.0.0", name: "Plan Seller Follow-Up", agentId: "agent_followup",
    description: "Recommend follow-up cadence from Deal stage, stated timeline, and prior activity.",
    objective: "Keep seller conversations moving without uncontrolled messaging.",
    serviceId: "automation.workflows", operation: "plan_followup", serviceStatus: "planned", executionMode: "recommend", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 900,
    requiredScopes: ["deals:read", "automation:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }],
    outputs: ["cadence", "next_contact_at", "channel_recommendation", "reason"], guardrails: baseGuardrails,
    successEvent: "are.skill.followup.plan_seller_followup.completed", failureEvent: "are.skill.followup.plan_seller_followup.failed"
  },
  {
    id: "are.followup.draft_seller_message", version: "1.0.0", name: "Draft Seller Follow-Up", agentId: "agent_followup",
    description: "Draft concise seller communication grounded in known Deal facts and the approved communication objective.",
    objective: "Reduce writing labor while keeping negotiation-sensitive messaging under human review.",
    serviceId: "communications.drafts", operation: "seller_followup", serviceStatus: "planned", executionMode: "draft", effect: "draft", approval: "review_required", risk: "medium", idempotencyTtlSeconds: 900,
    requiredScopes: ["deals:read"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "purpose", type: "string", required: true, description: "Follow-up objective." }],
    outputs: ["draft_subject", "draft_body", "fact_check"], guardrails: reviewGuardrails,
    successEvent: "are.skill.followup.draft_seller_message.completed", failureEvent: "are.skill.followup.draft_seller_message.failed"
  },
  {
    id: "are.followup.schedule_next_action", version: "1.0.0", name: "Schedule Next Action", agentId: "agent_followup",
    description: "Create a reminder/workflow for a defined non-binding seller follow-up action.",
    objective: "Automate timing and accountability without autonomously negotiating terms.",
    serviceId: "automation.workflows", operation: "schedule", serviceStatus: "planned", executionMode: "service_call", effect: "operational_write", approval: "none", risk: "low", idempotencyTtlSeconds: 3600,
    requiredScopes: ["automation:write"], requiredInputs: [{ name: "dealId", type: "string", required: true, description: "Canonical Deal identifier." }, { name: "runAt", type: "string", required: true, description: "Scheduled time." }, { name: "action", type: "string", required: true, description: "Defined follow-up action." }],
    outputs: ["workflow_id", "scheduled_at"], guardrails: baseGuardrails,
    successEvent: "are.skill.followup.schedule_next_action.completed", failureEvent: "are.skill.followup.schedule_next_action.failed"
  },
  {
    id: "are.followup.audit_overdue_actions", version: "1.0.0", name: "Audit Overdue Deal Actions", agentId: "agent_followup",
    description: "Identify active Deals whose required next action is overdue or missing.",
    objective: "Prevent qualified Deals from stalling silently.",
    serviceId: "pipeline.deals", operation: "query", serviceStatus: "available", executionMode: "research", effect: "read_only", approval: "none", risk: "low", idempotencyTtlSeconds: 900,
    requiredScopes: ["deals:read"], requiredInputs: [{ name: "asOf", type: "string", required: true, description: "Evaluation timestamp." }],
    outputs: ["overdue_deals", "missing_next_actions", "recommended_owner"], guardrails: baseGuardrails,
    successEvent: "are.skill.followup.audit_overdue_actions.completed", failureEvent: "are.skill.followup.audit_overdue_actions.failed"
  }
];

export const ARE_SKILLS_BY_ID = new Map(ARE_SKILL_REGISTRY.map((item) => [item.id, item]));

export function getARESkill(skillId: string): ARESkillDefinition | undefined {
  return ARE_SKILLS_BY_ID.get(skillId);
}

export function getARESkillsForAgent(agentId: string): ARESkillDefinition[] {
  return ARE_SKILL_REGISTRY.filter((item) => item.agentId === agentId);
}

export function getAREExecutableSkills(): ARESkillDefinition[] {
  return ARE_SKILL_REGISTRY.filter((item) => item.serviceStatus === "available" && item.executionMode === "service_call");
}
