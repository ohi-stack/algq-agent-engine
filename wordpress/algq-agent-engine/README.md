# Algonquian ARE Agent Engine

WordPress orchestration layer for the Algonquian Real Estate operational agent system.

## Version

0.1.0

## Deployment status

- **Status:** Ready
- **App URL:** https://algonquianrealestate.ai.studio
- **Gemini API:** API Key

The Gemini API secret must not be committed to this repository. Configure it through either:

```php
define( 'ALGQ_GEMINI_API_KEY', 'your-secret-key' );
```

in `wp-config.php`, or provide the server environment variable:

```text
GEMINI_API_KEY=your-secret-key
```

The ARE Agent Engine admin workstation reports whether a Gemini API key is configured without displaying the secret.

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

## ARE branded application UI

The Agent Engine adopts the platform-wide **ARE Branded Plugin UI Standard** as a mandatory release requirement.

The controlling rule is:

> **Centralize the design system; specialize the workflow.**

The WordPress workstation now uses the shared `are-*` component namespace for the application shell, navigation, KPI cards, tables, buttons, badges, alerts, responsive states, and legitimate empty states while retaining `algq-*` identifiers for WordPress/PHP implementation compatibility.

The UI must never invent operational metrics. Visible counts and status widgets must come from registered agents, persistent approval records, persistent AgentRun records, authoritative platform services, or other real system data. Otherwise the interface must show an explicit empty/loading/failure state or omit the widget.

See [`docs/ARE-UI-STANDARD.md`](docs/ARE-UI-STANDARD.md) for the complete Agent Engine UI contract, accessibility requirements, responsive rules, component vocabulary, and production acceptance gate.

## Admin UI

WordPress Admin -> ARE Agent Engine provides:

- ARE application header and local navigation;
- truthful KPI/status widgets;
- 14-agent registry;
- human approval queue;
- recent persistent AgentRun history;
- deployment status;
- App URL;
- Gemini API configuration state;
- responsive table/card behavior;
- explicit empty and failure states.

The application uses the ARE navy/gold/teal enterprise palette and preserves WordPress capabilities, nonces, sanitization, escaping, and lifecycle conventions.

## Production status

This v0.1.0 package is a foundation release. Before live certification, test activation/migrations, canonical Pipeline CRM deal resolution, service adapters, state-policy enforcement, idempotent replay, approval decisions, audit persistence, Gemini API configuration, ARE UI compliance/accessibility/responsive behavior, and at least one full Intake -> Qualification -> Underwriting workflow on staging.
