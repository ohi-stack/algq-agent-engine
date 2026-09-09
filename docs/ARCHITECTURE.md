# ARE Agent Engine Architecture

## System role

The Algonquian ARE Agent Engine is the orchestration layer for approved real-estate workflows. It coordinates agent selection, skill eligibility, state checks, input validation, idempotency, approval policy, service dispatch, run status, trace history, retries, and audit output.

It is not an authoritative transaction database.

## Execution contract

```text
Event / requested next action
        ↓
Agent selection
        ↓
Skill selection
        ↓
Deal/context resolution
        ↓
State and input validation
        ↓
Idempotency check
        ↓
Human approval gate where required
        ↓
Platform Service Interface dispatch
        ↓
Owning ARE plugin validates and persists
        ↓
Agent Engine records orchestration result
```

## Canonical record ownership

- Pipeline CRM: canonical Deal, acquisition stage, Deal tasks, next action, transaction activity.
- Deal Intake: seller/property submissions, intake consent and source evidence.
- MAO Engine: underwriting scenarios, assumptions, risk flags and outputs.
- Offer Generator: offers, proposals, LOIs and offer versions.
- Document Library: controlled document records and transaction packages.
- PDF & Signature Engine: rendered PDFs, signature requests and executed-file references.
- Buyer Portal: buyer profile, criteria and protected buyer access.
- Deal Marketplace: opportunity publication, NDA evidence, responses and offer submissions.
- Funding Tracker: capital-source criteria, commitments and deal-level funding state.
- Property Stewardship: stewardship clients, visits, vendors and stewardship reports.
- Automation Engine: automation rules, queue/execution state, retries and automation history.
- Admin Command Center: executive aggregation and oversight.

Agent Engine records reference those systems; they do not replace them.

## Agent-owned orchestration objects

The Agent Engine may maintain:

- AgentDefinition
- SkillDefinition
- AgentRun
- ApprovalTicket
- AgentRunTraceStep
- agent-specific audit events
- correlation IDs
- idempotency keys
- execution error/retry state

## Canonical deal identity

Deal-scoped work must carry a canonical `deal_id` resolved from Pipeline CRM. `deal_id` must remain string/UUID-capable.

A frontend `RealEstateDeal` object is an application DTO and must not become a second authoritative Deal store.

## Current implementation

Current source defines seven prototype/implementation agents:

1. Deal Intake & Sourcing Agent
2. MAO & Quantitative Underwriting Agent
3. Purchase Offer & Contract Agent
4. Debt & Equity Capital Allocator Agent
5. Stage Checklist & Task Coordinator Agent
6. Legal & Document Generation Agent
7. Escrow & Closing Coordinator Agent

Current source also includes:

- skill parameter schemas;
- allowed and blocked Deal states;
- approval policies;
- risk levels;
- idempotency TTLs;
- run traces;
- approval tickets;
- seed agent runs and audit-style demo data;
- Google Tasks lifecycle integration.

## Target operating model

ARE's current target roster contains fourteen operating roles:

- Intake
- Enrichment
- Qualification
- Property Analysis
- Underwriting
- Acquisition
- Follow-Up
- Offer
- Transaction
- Buyer
- Capital
- Closing
- Relationship
- Executive

The current seven-agent implementation may map multiple target roles into a single source agent today. Expansion should preserve one authoritative plugin owner per business domain.

## Human approval controls

At minimum, human approval is mandatory before:

- a binding offer is released;
- a contract is executed or signed;
- a legal decision is made on behalf of ARE;
- capital is committed;
- funds are moved or released;
- an acquisition/disposition is finally approved;
- a transaction is approved for closing;
- closing authority is exercised.

Skills may draft or prepare related materials without approval only when no binding or consequential action occurs.

## Production service-dispatch rule

Prototype functions that mutate local UI state are not production integrations.

Production execution must call an authorized Platform-owned service contract, such as:

```text
ARE_Platform_Service_Interface
    ├── pipeline.deals
    ├── mao.*
    ├── offers.*
    ├── documents.*
    ├── funding.*
    └── other registered authoritative services
```

Exact service IDs should be registered by the owning plugins. Agent Engine should discover and dispatch rather than hard-code database access.

## Safety and authorization

Every production run should record or verify:

- authenticated operator or system principal;
- agent ID;
- skill ID;
- Deal ID when applicable;
- source event/request;
- authorization result;
- state eligibility;
- validated inputs;
- idempotency key;
- approval requirement and decision;
- service target and operation;
- correlation ID;
- success/failure/retry outcome;
- timestamps;
- audit reference.

Credentials, tokens and secrets must never be written into traces or audit payloads.

## Seed/demo-state boundary

Hard-coded run counts, success rates, sample properties, sample funding sources, sample lenders, seed approvals, seed audit events and similar values are development/demo data unless backed by an authoritative production data source.

UI surfaces must label or remove seed data before production use.

## Legal and institutional language

The runtime must use Algonquian Real Estate's institutional business language. Legacy source references to sovereign compliance, sovereign contracts, government-like authority, title/escrow authority, or professional/legal authority must be replaced or qualified before those strings are exposed in production.

## WordPress adapter boundary

The live WordPress plugin observed at version 0.1.0 is a distinct adapter artifact. Its source has not yet been recovered in this repository.

The adapter should eventually provide only the WordPress-side integration required for:

- authentication/capability mapping;
- Platform Service Interface access;
- WordPress admin integration;
- agent/run/approval UI bridge where appropriate;
- audit/event handoff;
- safe configuration.

It should not duplicate the runtime's orchestration domain or the owning plugins' business records.
