# ARE Branded Plugin UI Standard

## Mandatory requirement

Every user-facing Algonquian Real Estate software interface must present a unified ARE application experience. The Agent Engine adopts this standard as a release requirement, not as optional styling guidance.

The controlling architectural rule is:

> **Centralize the design system; specialize the workflow.**

The Agent Engine may extend the ARE design system for agent orchestration, approvals, run history, health, and executive controls, but it must not create a visually incompatible application framework or fall back to unstyled WordPress presentation for primary workflows.

## Canonical visual identity

```css
--are-navy: #0b1f33;
--are-blue: #0b3a63;
--are-gold: #d1a54a;
--are-gold-dark: #b4882f;
--are-gold-light: #e2bf70;
--are-teal: #167c80;
--are-teal-bright: #6de3db;
--are-bg: #f4f6f8;
--are-surface: #ffffff;
--are-surface-alt: #f5f7f9;
--are-text: #53616d;
--are-text-muted: #667481;
--are-border: #dfe4e8;
--are-success: #2e7d62;
--are-warning: #b4882f;
--are-danger: #b54b4b;
```

Dark panels should use navy/blue. Gold is reserved for hierarchy and premium emphasis. Teal is used for operational/status accents. Status meaning must never depend on color alone.

## Shared application namespace

The Agent Engine uses the shared ARE component namespace where practical:

```text
are-app
are-shell
are-header
are-nav
are-toolbar
are-grid
are-card
are-widget
are-table
are-form
are-field
are-btn
are-badge
are-alert
are-modal
are-tabs
are-chart
are-timeline
are-empty
are-loading
```

PHP, WordPress hooks, options, database identifiers, and internal implementation identifiers continue to use the `algq` namespace.

## Agent Engine application shell

The WordPress workstation should follow this hierarchy:

```text
ARE / Algonquian ARE Agent Engine                         Status
----------------------------------------------------------------
Overview | Agents | Approvals | Runs | Deployment
----------------------------------------------------------------
KPI / status widgets
Agent registry / operational workspace
Approval queue / next decisions
Execution history / audit-oriented run status
Deployment / integration state
```

The interface must answer:

- What needs attention?
- What changed?
- What is next?
- What can an authorized user act on?

## Truthful widgets only

Every widget must do one of three things:

1. display authoritative/persisted system data;
2. display an explicit legitimate empty/loading/failure state; or
3. be omitted.

Never invent revenue, deal counts, buyer counts, document counts, pipeline metrics, health scores, conversion rates, approval counts, or AgentRun totals.

The Agent Engine currently sources its visible operational counts from the registered agent registry, persistent approval records, and persistent AgentRun records.

## Cards and metrics

Standard card treatment:

```css
.are-card {
    background: #fff;
    border: 1px solid #dfe4e8;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 12px 32px rgba(11,31,51,.07);
}
```

Supported semantic variants may include:

```text
are-card--metric
are-card--action
are-card--warning
are-card--dark
are-card--deal
are-card--health
are-card--agent
```

Metric labels should be concise, uppercase, and derived from actual system state.

## Tables

Operational tables should support clear headers, status badges, responsive/mobile transformation, legitimate empty states, and permission-aware actions.

For Agent Engine tables, typical columns include:

```text
Run | Deal | Agent | Skill | Status | Started
Deal | Agent | Skill | Requested | Decision
```

## Status vocabulary

Use shared platform language where applicable:

```text
New
Active
Under Review
Qualified
Needs Action
Pending
Approved
Declined
Closed
Archived
Failed
Healthy
Warning
Restricted
Awaiting Approval
Completed
Running
```

Equivalent states must not receive unrelated visual treatments between ARE products.

## Buttons and actions

The Agent Engine uses the shared button family:

```text
Primary
Secondary
Outline
Danger
Text/link
Icon action
```

Approval and rejection actions must preserve WordPress capability and nonce enforcement regardless of visual treatment.

## Empty, loading, and failure states

No blank operational panels.

Examples:

```text
No actions are awaiting approval.
Consequential Agent Engine requests will appear here when human authorization is required.
```

```text
No agent runs have been recorded yet.
Completed, failed, paused, and replay-protected executions will appear here once orchestration begins.
```

Future asynchronous surfaces must show explicit loading and failure messages rather than silently rendering empty containers.

## Responsive behavior

The workstation must support desktop, laptop, tablet, and practical mobile widths. Tables must collapse into readable row cards rather than overflow as the only mobile strategy.

## Accessibility

All Agent Engine UI must support:

- keyboard navigation;
- visible focus states;
- semantic labels and headings;
- adequate contrast;
- ARIA where appropriate;
- non-color-only status meaning;
- readable font sizes;
- touch-safe controls;
- logical tab order.

## WordPress integration

ARE branding is layered on WordPress infrastructure rather than replacing platform controls. The Agent Engine must retain:

- WordPress capabilities;
- nonces;
- REST authentication where applicable;
- admin routing;
- secure lifecycle conventions;
- sanitization and escaping.

## Mandatory release gate

> **ARE UI Compliance:** All user-facing Agent Engine interfaces must conform to the current Algonquian Real Estate UI design system, including shared colors, typography, cards, controls, forms, data tables, status badges, responsive behavior, accessibility requirements, application navigation, and branded operational widgets.

A release is not production-complete merely because orchestration logic works. Applicable admin, workspace, dashboard, portal, and public interfaces must also meet the ARE UI standard.

## Source standard

This file operationalizes the approved ARE Branded Plugin UI Standard for the dedicated Algonquian ARE Agent Engine repository. Where a centralized ARE Platform stylesheet/component library becomes available as a stable integration dependency, the Agent Engine should consume that shared layer and keep `assets/admin.css` limited to Agent Engine-specific extensions.
