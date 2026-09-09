# Algonquian Real Estate Skills Catalog

Status: Phase 1 source implementation
Repository: `ohi-stack/algq-agent-engine`

## Purpose

ARE Skills are the executable capability layer used by the Algonquian ARE Agent Engine. An Agent defines who is acting. A Skill defines what capability may be requested, which authoritative service owns the operation, the expected inputs/outputs, the side-effect class, required scopes, approval policy, idempotency window, audit events, and guardrails.

Skills do not create new business-system authority. They call or prepare work for the plugin/system that already owns the record.

## Governing execution chain

`Agent -> Skill -> ARE API -> API Bridge -> ARE_Platform_Service_Interface -> authoritative plugin -> canonical record/audit event`

The Agent Engine may research, organize, analyze, recommend, draft, request, route, monitor, and automate approved administrative work. Human leadership retains final authority over acquisition strategy, price, negotiation, offers, contracts, legal decisions, financing, capital commitments, funds movement, transaction approval, and closing.

## Phase 1 revenue chain

Phase 1 intentionally focuses on the non-binding, revenue-moving acquisition chain:

`Intake -> Enrichment -> Qualification -> Property Analysis -> Underwriting -> Acquisition -> Follow-Up`

### Intake Agent
- `are.intake.capture_submission`
- `are.intake.check_completeness`
- `are.intake.detect_duplicate`
- `are.intake.promote_to_deal`

### Enrichment Agent
- `are.enrichment.research_property_facts`
- `are.enrichment.research_ownership`
- `are.enrichment.reconcile_contact`
- `are.enrichment.write_activity`

### Qualification Agent
- `are.qualification.score_lead`
- `are.qualification.recommend_disposition`
- `are.qualification.set_next_action`
- `are.qualification.advance_to_underwriting`

### Property Analysis Agent
- `are.property.analyze_comps`
- `are.property.analyze_rents`
- `are.property.organize_rehab_inputs`
- `are.property.prepare_analysis_package`

### Underwriting Agent
- `are.underwriting.calculate_mao`
- `are.underwriting.calculate_rental`
- `are.underwriting.calculate_seller_financing`
- `are.underwriting.recommend_scenario`

### Acquisition Agent
- `are.acquisition.compare_structures`
- `are.acquisition.prepare_strategy_review`
- `are.acquisition.record_approved_strategy`
- `are.acquisition.prepare_offer_request`

### Follow-Up Agent
- `are.followup.plan_seller_followup`
- `are.followup.draft_seller_message`
- `are.followup.schedule_next_action`
- `are.followup.audit_overdue_actions`

Total Phase 1 skills: 28.

## Service readiness

Each skill declares one of four service states:

- `available`: a real authoritative Platform service is already present on current source.
- `candidate`: service implementation exists in an unpromoted candidate branch/PR and must not be treated as production.
- `planned`: the authoritative plugin exists but has not yet registered the named service operation.
- `external`: a documented external integration owns the capability.

Current known available service family used by Phase 1 is `pipeline.deals`, with Deal operations exposed through the Platform Service Interface. Other service IDs in the catalog are forward contracts and remain `planned` or `candidate` until the owning plugin registers them.

## Side-effect classes

- `read_only`: no canonical business record mutation.
- `draft`: produces a reviewable draft/package only.
- `operational_write`: may update a non-binding operational record through the authoritative service.
- `binding_commitment`: reserved for explicitly human-approved future skills.
- `funds_movement`: reserved for human-only future controls and must never be model-autonomous.

## Approval rules

- `none`: may run when scopes/state/validation/idempotency checks pass.
- `review_required`: result is advisory/draft and must be reviewed before a consequential next step.
- `human_required`: a valid human approval record must be present before the service call can execute.
- `human_only`: the Agent Engine cannot execute the action; it may only prepare information for an authorized human workflow.

No skill may approve itself.

## Data and authority rules

1. Pipeline CRM remains the canonical Deal authority.
2. Deal Intake remains authoritative for submission-time intake records.
3. MAO Engine owns deterministic underwriting calculations and versioned scenarios.
4. Offer Generator owns offers/proposals; Phase 1 does not transmit binding offers.
5. Document Library/PDF systems own controlled documents and rendering.
6. Funding Tracker owns funding records; no capital is represented as committed without documented evidence.
7. Buyer Portal/Marketplace own buyer profiles/access/distribution records.
8. Automation Engine owns workflow execution/scheduling.
9. Agent Engine owns agent/skill orchestration and run/audit context, not the underlying business records.

## Mandatory run context

Every skill run should include:

- `requestId`
- `correlationId`
- `agentId`
- `skillId`
- canonical `dealId` when deal-scoped
- `relationshipId` when relationship-scoped
- authenticated actor identity when available
- approval reference when required

## Runtime validation order

1. Resolve Agent.
2. Resolve Skill.
3. Confirm the Agent is allowed to invoke the Skill.
4. Confirm service readiness.
5. Load canonical Deal/relationship context.
6. Validate scopes.
7. Validate inputs.
8. Validate side-effect/approval policy.
9. Create or verify idempotency key.
10. Execute authoritative service or produce advisory/draft output.
11. Record success/failure event and service correlation metadata.
12. Set/verify the next action when the workflow changes an active qualified Deal.

## Phase 2

Phase 2 should add the remaining canonical agents and human-gated capabilities:

- Offer Agent
- Transaction Agent
- Buyer Agent
- Capital Agent
- Closing Agent
- Relationship Agent
- Executive Agent

Phase 2 must not turn binding offers, contracts, capital commitments, funds movement, or closing authority into autonomous model actions. Those skills should remain review/human-required or human-only, with the Agent Engine preparing evidence and routing approval.

## Current migration note

The pre-existing `src/services/agentEngine.ts` contains a prototype Agent/Skill registry with seven agent definitions. The Phase 1 registry in `src/skills/` is the stricter target contract. UI/orchestrator migration should occur only after the canonical 14-agent IDs are reconciled and the current prototype registry is retired or adapted without breaking the app.
