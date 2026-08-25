# Algonquian ARE Agent Engine

WordPress orchestration layer for the Algonquian Real Estate operational agent system.

## Version

0.1.0

## Authority boundary

The Agent Engine coordinates work around a canonical `deal_id`; it does not own or duplicate authoritative business records.

- Deal Intake owns intake records.
- Pipeline CRM owns the canonical deal and transaction lifecycle.
- MAO Engine owns underwriting calculations.
- Offer Generator owns offer/proposal records.
- Document Library and PDF & Signature own document/PDF/signature records.
- Funding Tracker owns funding records.
- Buyer Portal / Deal Marketplace own buyer access and distribution records.
- Automation Engine owns scheduled/event execution infrastructure.
- Command Center consumes Agent Engine run, approval, and health data for oversight.

## 14 registered agents

1. Intake Agent
2. Enrichment Agent
3. Qualification Agent
4. Property Analysis Agent
5. Underwriting Agent
6. Acquisition Agent
7. Follow-Up Agent
8. Offer Agent
9. Transaction Agent
10. Buyer Agent
11. Capital Agent
12. Closing Agent
13. Relationship Agent
14. Executive Agent

## Core runtime

`Agent Registry -> Skill Registry -> Orchestrator -> Approval Gate -> ARE Platform Service Interface -> authoritative ARE plugin`

Every execution creates a persistent AgentRun and append-only audit events. Idempotency uses a correlation key derived from deal, agent, skill, event/correlation identifier, and input hash.

## Human approval controls

Approval is required for consequential skills such as acquisition strategy recommendation, offer preparation/release, capital commitment, and closing authorization. Approval records are first-class persistent records and require `approve_algq_agent_actions`.

## Integration contract

Pipeline CRM (or a platform adapter) must resolve canonical deals:

```php
add_filter( 'algq_platform_service_get_deal', function( $deal, $deal_id ) {
    // Return canonical deal array, including primary_state/state.
    return $deal;
}, 10, 2 );
```

Authoritative plugins execute skills through:

```php
add_filter( 'algq_platform_service_execute_skill', function( $result, $skill_id, $deal_id, $context ) {
    // Route skill_id to the authoritative plugin/service.
    return $result;
}, 10, 4 );
```

If no adapter exists, the engine returns a controlled `WP_Error`; it does not simulate transaction data.

## Database tables

- `{prefix}algq_agent_runs`
- `{prefix}algq_agent_approvals`
- `{prefix}algq_agent_audit_log`

## Capabilities

- `manage_algq_agent_engine`
- `approve_algq_agent_actions`

Administrators receive both capabilities on activation.

## Admin UI

WordPress Admin -> ARE Agent Engine provides the registered agent roster, approval queue, and recent run history using the ARE navy/gold/teal enterprise palette.

## Production status

This v0.1.0 package is a foundation release. Before live certification, test activation/migrations, canonical Pipeline CRM deal resolution, service adapters, state-policy enforcement, idempotent replay, approval decisions, audit persistence, and at least one full Intake -> Qualification -> Underwriting workflow on staging.
