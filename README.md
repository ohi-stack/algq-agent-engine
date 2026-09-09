# Algonquian ARE Agent Engine

`algq-agent-engine` is the orchestration and agent-control application for Algonquian Real Estate LLC and the Algonquian Real Estate Technology Division.

## Operating role

The Agent Engine coordinates the ARE transaction lifecycle without replacing authoritative operational systems.

**Canonical flow:**

`Lead → Intake → Qualification → Deal → Underwriting → Strategy → Approval → Offer → Contract → Due Diligence → Buyer/Capital → Closing → Operations/Reporting`

The Agent Engine may research, classify, calculate, recommend, route, monitor, draft, request, and coordinate. Human leadership retains final authority over consequential negotiations, offers, contracts, legal decisions, capital commitments, funds movement, transaction approval, and closing.

## Connected surfaces

One codebase is intended to serve:

- the hosted Agent Engine application;
- the authenticated AlgonquianRealEstate.com application/dashboard surface;
- the WordPress ARE Agent Engine/Admin plugin surface.

All surfaces use the same integration boundary:

- primary API: `https://api.algonquianrealestate.com/v1`
- WordPress fallback bridge: `https://algonquianrealestate.com/wp-json/algq/v1`

The WordPress bridge injects session-safe runtime configuration through `window.ARE_AGENT_ENGINE_CONFIG`. Private service credentials must never be embedded in the browser bundle.

## WordPress integration package

`wordpress/algq-agent-engine-bridge/` is the companion runtime bridge for the existing **Algonquian ARE Agent Engine** WordPress plugin. It provides:

- authenticated Agent Engine snapshot access;
- Platform Service Interface calls;
- AgentRun dispatch into the WordPress orchestrator;
- human approval resolution;
- platform event publication;
- health reporting;
- the `[algq_agent_engine_app]` website application surface;
- a Connected App admin surface;
- trusted runtime configuration and invalidation messaging.

The CI workflow lints the PHP integration and packages `algq-agent-engine-bridge-0.2.0.zip` as a workflow artifact.

## Canonical system boundaries

| Domain | Authoritative ARE system |
|---|---|
| Intake | Deal Intake |
| Deal / stage / tasks / activity | Pipeline CRM |
| Underwriting | MAO Engine |
| Offers / LOIs / term sheets | Offer Generator |
| Documents / PDFs / signatures | Document Library + PDF & Signature |
| Automation | Automation Engine |
| Buyer access / opportunity distribution | Buyer Portal + Deal Marketplace |
| Funding / capital | Funding Tracker |
| Executive aggregation | Admin Command Center |
| Agent orchestration / run context / approvals coordination | Agent Engine |

## Synchronization

`src/services/arePlatformClient.ts` implements the browser-safe API/WordPress failover client.

`src/services/platformSyncCoordinator.ts` synchronizes the current client-cache model with canonical services while the UI is incrementally migrated away from localStorage.

Important safeguard: no demo/seed record is pushed until a live platform snapshot has been successfully resolved.

## Canonical agents

`src/registry/areAgentRegistry.ts` publishes the 14-agent operating registry:

1. Intake
2. Enrichment
3. Qualification
4. Property Analysis
5. Underwriting
6. Acquisition
7. Follow-Up
8. Offer
9. Transaction
10. Buyer
11. Capital
12. Closing
13. Relationship
14. Executive

## Development

```bash
bun install
bun run dev
```

Validation:

```bash
bun run typecheck
bun run build
```

Use `VITE_ARE_SYNC_MODE=offline` for local/demo UI work when the production API and WordPress bridge are not available.

See [`docs/INTEGRATION_CONTRACT.md`](docs/INTEGRATION_CONTRACT.md) for the endpoint, ownership, synchronization, authorization, and production-certification contract.
