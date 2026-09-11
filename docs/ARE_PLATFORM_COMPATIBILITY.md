# ARE Platform Compatibility

## Current integration target

- Algonquian Real Estate Platform source target: **3.1.0**
- Algonquian Pipeline CRM source target: **2.2.1**
- Canonical external gateway: `https://api.algonquianrealestate.com/v1`

This document records the Agent Engine integration boundary. It does **not** represent the API gateway, Platform 3.1.0, or Pipeline CRM 2.2.1 as deployed or production-certified on the live WordPress environment.

## Authority model

The Agent Engine is an orchestration system. It must not create a second authoritative copy of business records owned by ARE operational systems.

| Domain | Authoritative system |
|---|---|
| Seller/property intake | Deal Intake |
| Canonical Deal and lifecycle | Pipeline CRM |
| Underwriting | MAO Engine |
| Offers/proposals | Offer Generator |
| Controlled document records | Document Library |
| PDF/signature workflows | PDF & Signature Engine |
| Funding/capital records | Funding Tracker |
| Buyer accounts/access | Buyer Portal |
| Opportunity distribution | Deal Marketplace |
| Automation rules/execution | Automation Engine |
| Executive oversight | Command Center |

## Agent Engine rule

Agents may research, classify, recommend, request, coordinate, monitor and execute previously authorized administrative workflows. Consequential actions remain approval-gated. The Agent Engine must route mutations through the ARE API/Platform service boundary rather than reaching into WordPress plugin tables directly.

The canonical cross-system identity is `deal_id`; callers should treat it as a string-compatible identifier rather than assuming a WordPress numeric row ID.

## Request controls

Agent-originated requests should carry, when available:

- correlation ID;
- idempotency key;
- canonical `deal_id`;
- agent ID;
- authenticated user/service identity;
- approval state for consequential actions.

`src/services/arePlatformClient.ts` implements the initial transport boundary. It intentionally performs no live call unless `VITE_ARE_API_BASE_URL` is configured.

## Production gate

Do not enable autonomous live mutations until all of the following are verified:

1. API Bridge authentication and authorization;
2. request signing/service credentials where applicable;
3. idempotency enforcement;
4. correlation-aware audit events;
5. human approval gates for offers, contracts, negotiations, funds movement and closing actions;
6. canonical Deal lookup through Pipeline CRM;
7. synthetic browser/API/WordPress end-to-end transaction test.
