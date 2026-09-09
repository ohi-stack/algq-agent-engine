# Algonquian ARE Agent Engine — Integration Contract

## Status

This document defines the integration boundary between `ohi-stack/algq-agent-engine`, the canonical ARE API, AlgonquianRealEstate.com, and the WordPress ARE plugin suite.

The Agent Engine is an orchestration and decision-support system. It **must not** become a competing system of record for Deals, underwriting, offers, documents, funding, buyers, signatures, or closing records.

## Runtime surfaces

One Agent Engine build may be rendered in three approved surfaces:

1. **Agent app** — AI Studio / hosted Agent Engine application.
2. **Website** — authenticated AlgonquianRealEstate.com dashboard/application surface.
3. **WordPress admin** — ARE Agent Engine/Admin plugin mount in `wp-admin`.

All three surfaces use the same API/service contract and canonical transaction identifiers.

## Endpoint priority

Default production mode is `dual`:

1. `https://api.algonquianrealestate.com/v1`
2. `https://algonquianrealestate.com/wp-json/algq/v1`
3. Local/demo cache only when neither production boundary is reachable.

The WordPress REST endpoint is a fallback/embedded bridge, not a second authoritative business database.

## Browser authentication

The browser bundle must never contain private service credentials.

- API requests use the authenticated ARE application/session.
- WordPress embedded requests use the logged-in WordPress session and an `X-WP-Nonce` injected by the plugin through `window.ARE_AGENT_ENGINE_CONFIG`.
- Server-to-server secrets belong in the API gateway or WordPress plugin/server configuration, never in `VITE_*` variables.

## Shared headers

Every mutation should carry:

- `X-ARE-Correlation-ID`
- `X-ARE-Idempotency-Key` for mutating calls
- `X-ARE-Client`
- `X-ARE-Client-Version`
- `X-ARE-Source-Surface`
- `X-WP-Nonce` only when using the authenticated WordPress bridge

## Canonical endpoints

### Snapshot

`GET /agent-engine/snapshot`

Expected payload:

```json
{
  "revision": "opaque-revision",
  "generatedAt": "2026-09-08T21:00:00-04:00",
  "deals": [],
  "funds": [],
  "triggers": [],
  "automationLogs": [],
  "approvals": [],
  "agentRuns": [],
  "health": {}
}
```

The snapshot is read-only aggregation. Each object still belongs to its authoritative plugin.

### Service interface

`POST /services/call`

```json
{
  "service": "pipeline.deals",
  "action": "update_stage",
  "deal_id": "canonical-deal-id",
  "payload": {
    "previous_state": "UNDERWRITING",
    "new_state": "STRATEGY_REVIEW"
  },
  "correlation_id": "corr-...",
  "idempotency_key": "pipeline.deals.update_stage:...",
  "source_surface": "agent_app"
}
```

The bridge resolves the service to the authoritative ARE plugin. The Agent Engine does not update plugin tables directly.

### Agent runs

`POST /agents/runs`

Used for persisted agent execution requests. The server validates the agent/skill allowlist, deal state, approval policy, authorization, and target service before execution.

### Approvals

`POST /approvals/{ticket_id}/resolve`

Consequential actions remain paused until an authorized human resolves the approval ticket.

### Events

`POST /events`

Events must include correlation, source surface, timestamp, and deal ID when applicable. Event publication does not transfer record ownership.

### Health

`GET /health`

Should report API/bridge version, service registry status, plugin availability, auth state, and dependency health without exposing secrets.

## Canonical deal-state translation

The current UI may display legacy labels. Integration code maps them to canonical platform states:

| Client label | Canonical state |
|---|---|
| New Intake | `LEAD_NEW` |
| Due Diligence | `DUE_DILIGENCE` |
| Underwriting | `UNDERWRITING` |
| Offer Submitted | `OFFER_SENT` |
| Seller Negotiation | `NEGOTIATION` |
| Under Contract | `UNDER_CONTRACT` |
| Funded & Closed | `CLOSED` |
| Archived | `ARCHIVED` |

New platform work should use the full ARE transaction state machine rather than expanding the legacy display enum.

## Authoritative ownership

- Deal Intake → intake/submission record
- Pipeline CRM → canonical Deal, stage, tasks, activity
- MAO Engine → underwriting/scenarios
- Offer Generator → offers/LOIs/term sheets
- Document Library / PDF & Signature → controlled documents, generated PDFs, signatures
- Funding Tracker → funding/capital records
- Buyer Portal / Deal Marketplace → buyer profile, authorization, opportunity distribution
- Automation Engine → automation rules/execution
- Command Center → executive aggregation/oversight
- Agent Engine → orchestration, run context, recommendation, approval coordination, agent audit

## Human-control gates

The architecture must technically require human approval before:

- binding offers are released;
- contracts are executed;
- material negotiated terms are committed;
- capital is committed;
- funds are moved/released;
- closing documents are signed;
- final acquisition/disposition decisions are made.

## Synchronization behavior

The current React application historically stored working data in local state/localStorage. The sync coordinator now treats localStorage as a client cache:

1. Pull canonical snapshot before React mounts.
2. Do not push any local/demo record until a live snapshot has resolved.
3. Diff local mutations and route them through the service interface.
4. Poll remote revisions.
5. Update cache on remote change and notify the mounted surface.
6. Refresh the current surface when necessary so local React state cannot remain stale indefinitely.

This transitional cache layer should be removed gradually as each UI section moves to direct query/mutation hooks against the service client.

## WordPress plugin responsibilities

The WordPress Agent Engine/API Bridge plugin should:

- inject `window.ARE_AGENT_ENGINE_CONFIG`;
- provide the authenticated REST nonce;
- expose or proxy the endpoint contract above;
- enforce WordPress capabilities and record-level authorization;
- call `ARE_Platform_Service_Interface` rather than another plugin's database tables;
- publish invalidation messages after authoritative mutations;
- mount the same Agent Engine build rather than maintaining a separate dashboard codebase.

## Production certification

Repository integration is not live certification. Production acceptance requires:

- API and WordPress bridge health both verified;
- authenticated snapshot retrieval;
- one canonical Deal visible on all three surfaces;
- stage mutation reflected on all three surfaces;
- MAO call persisted by MAO Engine;
- offer approval gate verified;
- approval decision persisted and audited;
- event correlation verified across API, plugin, and Agent Engine logs;
- no duplicate Deal, underwriting, offer, funding, or document records created.
