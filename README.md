# Algonquian ARE Agent Engine

The Algonquian ARE Agent Engine is the orchestration layer for Algonquian Real Estate agents and transaction-advancement workflows.

## Canonical architecture

The Agent Engine does not replace the ARE operational plugins and does not own canonical Deal, underwriting, offer, funding, document, buyer, signature, or closing records.

It operates through the Algonquian Real Estate API and platform service contracts:

```text
Algonquian ARE Agent Engine
            │
            ▼
https://api.algonquianrealestate.com/v1/
            │
            ▼
ARE API Bridge
            │
            ▼
ARE_Platform_Service_Interface
            │
            ├── Deal Intake
            ├── Pipeline CRM
            ├── MAO Engine
            ├── Offer Generator
            ├── Document Library
            ├── Funding Tracker
            ├── Buyer / Marketplace
            └── Automation / other ARE services
```

Pipeline CRM remains authoritative for the canonical `deal_id`.

## ACC deployment boundary

The Agent Command Console is a dedicated node at:

**`https://acc.algonquianrealestate.com`**

ACC is a control-plane surface for agent activity, approvals, next actions, exceptions, health, and commands. It consumes the canonical ARE API rather than connecting directly to WordPress plugin tables.

This repository may provide shared Agent Engine UI/components used by ACC, but the production domain boundary remains:

- `api.algonquianrealestate.com` — unified API/backend gateway
- `acc.algonquianrealestate.com` — dedicated ACC node

## Agent Engine responsibilities

The Agent Engine may own:

- agent registry;
- skills and tool registry;
- orchestration and execution runs;
- context and correlation metadata;
- human approval gates;
- escalation rules;
- agent run history;
- agent health/status;
- adapters to ARE API services.

It must not create competing authoritative business records.

## Human authority

Consequential actions require explicit human approval where applicable, including binding offers, contract execution, material negotiated commitments, movement or release of funds, final acquisition/disposition decisions, and other legally or financially operative actions.

## Environment

Use protected deployment secrets. Do not commit production credentials.

Recommended production variables include:

```text
NODE_ENV=production
ARE_API_BASE_URL=https://api.algonquianrealestate.com/v1
ACC_PUBLIC_URL=https://acc.algonquianrealestate.com
```

Model-provider credentials remain separate protected secrets.
