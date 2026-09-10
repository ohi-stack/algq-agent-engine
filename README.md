# Algonquian ARE Agent Engine

**Organization:** Algonquian Real Estate, LLC  
**Technology division:** Algonquian Real Estate Technology Division  
**Repository role:** Agent Engine runtime and control-plane source  
**Canonical ARE platform repository:** `ohi-stack/algonquian-real-estate-platform`

## Purpose

This repository contains the current application/control-plane source for the Algonquian ARE Agent Engine: agent and skill definitions, execution-run models, approval tickets, audit traces, task integrations, and operator-facing interfaces used to coordinate approved real-estate workflows.

The Agent Engine is an **orchestrator**. It does not own the canonical business records operated on by ARE plugins.

## Important source distinction

The live AlgonquianRealEstate.com WordPress installation reports an **Algonquian ARE Agent Engine plugin version 0.1.0**.

This repository is not presently proven to be the source package for that WordPress plugin. The current `package.json` reports version `0.0.0`, and this repository contains a React/Vite/TypeScript application rather than the recovered PHP plugin bootstrap `algq-agent-engine.php`.

Accordingly:

- this repo is registered as **runtime/control-plane source**;
- the live WordPress 0.1.0 plugin is registered as a **separate adapter artifact**;
- the exact WordPress adapter source must be recovered before source parity is declared.

## Architecture rule

```text
Agent Engine determines an approved next operation
        ↓
ARE Platform Service Interface
        ↓
Authoritative owning plugin
        ↓
Authoritative result
        ↓
Agent run / trace / audit outcome
```

The Agent Engine must not write directly to another plugin's database tables.

## Record authority

The Agent Engine may own:

- agent definitions;
- skill definitions;
- approval-policy state;
- orchestration runs;
- approval tickets;
- trace steps;
- correlation and idempotency identifiers;
- agent audit events.

It does not own:

- canonical Deals — Pipeline CRM;
- intake submissions/consent — Deal Intake;
- underwriting — MAO Engine;
- offers/proposals — Offer Generator;
- controlled documents — Document Library;
- PDFs/signatures — PDF & Signature Engine;
- buyer profiles/access — Buyer Portal;
- marketplace NDA/visibility/responses — Deal Marketplace;
- capital commitments/funding status — Funding Tracker;
- stewardship records — Property Stewardship;
- automation rules/execution — Automation Engine;
- executive reporting — Admin Command Center.

## Current source implementation

The current source defines seven agent implementations:

1. Deal Intake & Sourcing Agent
2. MAO & Quantitative Underwriting Agent
3. Purchase Offer & Contract Agent
4. Debt & Equity Capital Allocator Agent
5. Stage Checklist & Task Coordinator Agent
6. Legal & Document Generation Agent
7. Escrow & Closing Coordinator Agent

ARE's target operating model currently identifies fourteen roles: Intake, Enrichment, Qualification, Property Analysis, Underwriting, Acquisition, Follow-Up, Offer, Transaction, Buyer, Capital, Closing, Relationship, and Executive.

The seven current source agents should therefore be treated as the implemented prototype roster, not evidence that the complete fourteen-role model is already implemented.

## Human authority

Agents may research, enrich, classify, calculate, draft, recommend, route, monitor, schedule, and execute approved administrative workflows.

Human leadership retains final authority over negotiations, binding offers, contracts/signatures, legal decisions, acquisition/disposition approval, capital commitments, funds movement, transaction approval, and closing.

No source-level `approvalPolicy` setting may override this rule.

## Prototype-data warning

The current UI source includes local DTOs, example properties, sample funding records, seed runs, approval tickets, run counts, success percentages, and other demonstration state.

Those objects are not production evidence and must not be presented as real ARE transactions, portfolio results, funding commitments, operating metrics, or completed agent executions unless separately backed by authoritative runtime records.

## Language standard

ARE is a Connecticut real-estate operating company. Production code and documentation must not imply governmental, sovereign, escrow, title, legal-professional, lending, regulatory, or other authority that ARE does not hold. Legacy prototype wording should be corrected as the runtime is hardened.

## Development

Current repository scripts:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The current stack includes React, TypeScript, Vite, Firebase libraries, Google GenAI libraries, Google Tasks integration code, and supporting UI dependencies.

## Architecture documentation

See `docs/ARCHITECTURE.md` and `SOURCE-REGISTRATION.json`.

The governing cross-platform architecture is also registered in the canonical ARE platform repository under `docs/ARE-AGENT-ENGINE-ARCHITECTURE.md` and `config/agent-engine-source.json`.
