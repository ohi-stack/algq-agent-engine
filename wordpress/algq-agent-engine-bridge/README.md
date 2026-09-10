# Algonquian ARE Agent Engine Bridge 0.2.0

This companion WordPress plugin connects the hosted `ohi-stack/algq-agent-engine` application to the installed **Algonquian ARE Agent Engine** plugin and the broader ARE Platform Service Interface.

## Role

The bridge owns the authenticated external/runtime boundary only. It does **not** own canonical Deals, underwriting, offers, documents, buyers, funding records, signatures, or closing records.

The installed Agent Engine plugin continues to own:

- AgentRun persistence
- approval tickets
- agent audit events
- 14-agent/skill governance
- approval gating
- orchestration through `ALGQ_Agent_Engine_Orchestrator`

The ARE operational plugins continue to own their assigned business domains.

## REST routes

Namespace: `/wp-json/algq/v1`

- `GET /health`
- `GET /agent-engine/snapshot`
- `POST /services/call`
- `POST /agents/runs`
- `POST /approvals/{ticket_id}/resolve`
- `POST /events`

Mutating routes require WordPress authentication and the appropriate ARE capability. Approval resolution requires `approve_algq_agent_actions` or administrator authority.

## Hosted application mount

The bridge registers:

```text
[algq_agent_engine_app]
```

for authenticated website application pages. It also adds **Connected App** under the existing ARE Agent Engine admin menu when the Agent Engine plugin is active.

The bridge sends runtime configuration to the hosted application with `postMessage`, including:

- canonical API URL
- WordPress REST URL
- WordPress REST nonce
- runtime surface
- current user ID/name
- current user capabilities

The React application only accepts configuration/invalidation messages from trusted `algonquianrealestate.com` origins or its own origin.

## Snapshot providers

The bridge intentionally does not query another plugin's tables. Authoritative plugins or the Platform layer should supply aggregate snapshot data with these filters:

```php
add_filter( 'algq_agent_engine_snapshot_deals', function( array $deals ) {
    // Return Pipeline CRM-authorized deal DTOs.
    return $deals;
} );

add_filter( 'algq_agent_engine_snapshot_funds', function( array $funds ) {
    // Return Funding Tracker-authorized source DTOs.
    return $funds;
} );

add_filter( 'algq_agent_engine_snapshot_triggers', function( array $triggers ) {
    // Return Automation Engine-authorized rules.
    return $triggers;
} );
```

The Agent Engine plugin's own run and pending-approval repositories are included automatically when their classes are active.

## Platform service contract

For domain mutations, the bridge uses the shared service boundary:

```php
algq_platform_service_call( $service, $action, $args );
```

when the Platform function exists, otherwise it exposes the equivalent `algq_platform_service_call` filter contract. No direct cross-plugin SQL is performed.

## Legacy UI compatibility

The hosted app currently contains an earlier UI agent/skill vocabulary. The bridge maps the known legacy IDs to the canonical 14-agent WordPress registry during the transition. New development should use the canonical IDs directly.

## Installation

Package the `algq-agent-engine-bridge/` directory as a WordPress plugin ZIP and install it alongside:

1. Algonquian Real Estate Platform
2. Algonquian ARE Agent Engine
3. the authoritative operational plugins required by the workflows being executed

Repository/source validation is not live-site certification. Complete an authenticated end-to-end Deal test before designating production synchronization complete.
