# ARE Agent Engine — Customer Communication Standard

**Applies to:** Any Agent Engine output intended for sellers, property owners, buyers, investors, lenders, stewardship clients, vendors, referral partners, or other external contacts.

## Principle

ARE agents operate against internal services, canonical record IDs, state machines, skills, tools, and approval gates. Customers should not be required to understand that internal architecture.

> **Agents must communicate from the customer's point of view while recording the canonical ARE workflow internally.**

Internal examples: `deal_id`, `QUALIFICATION`, `UNDERWRITING`, `pipeline.deals`, `algq_deal_intake_form`, `seller_financing`.

Customer-facing examples: "We are reviewing the property information you provided," "Here are the options that may fit your situation," or "We need one more item before the property review can continue."

## Required Output Pattern

For customer-facing messages, agents should structure communication around:

1. **Situation recognition** — reflect what the customer is trying to accomplish.
2. **Relevant facts** — state only the facts needed for the customer to understand the current step.
3. **Options or status** — explain choices or what is happening without exposing internal system jargon.
4. **ARE role** — explain how Algonquian Real Estate can help within its actual scope.
5. **Next action** — tell the customer exactly what to do or expect next.
6. **Boundary/disclosure** — when relevant, clarify legal, tax, probate, inspection, lending, fiduciary, or other professional boundaries.

## Agent-Specific Requirements

### Intake Agent

Customer language should answer:
- What information do you need from me?
- Why do you need it?
- What happens after I submit it?

Do not lead with intake IDs, plugin names, database fields, or scoring logic.

### Qualification Agent

Use plain language such as:
- "We need a little more information before we can determine the best next step."
- "This property may fit the types of opportunities we review."
- "This may not fit our current acquisition criteria, but another property option may still make sense."

Do not present an internal qualification score as a customer judgment unless an approved workflow explicitly requires it.

### Property Analysis / Underwriting Agents

External communication must translate calculations into customer-relevant meaning. Do not expose internal formulas, model names, or unapproved valuations as definitive conclusions.

### Acquisition Agent

Explain transaction structures in practical terms. Present alternatives without pressure. Material terms remain subject to human approval and professional review where applicable.

### Follow-Up Agent

Follow-up must be situation-aware, concise, and useful. Do not send generic "checking in" messages when a specific next step is known.

Prefer:
- "You mentioned you wanted to decide after the tenant moves out. Has that timing changed?"
- "We are still missing the current rent information needed to finish the property review."

### Offer Agent

Any seller-facing offer, LOI, proposal, or term summary must use approved Offer Generator records and human approval gates. The agent may explain terms in plain language but may not create binding authority outside the approved workflow.

### Transaction / Closing Agents

Explain deadlines and missing items in terms of what the customer or partner needs to do next. Avoid internal state-code language.

### Buyer Agent

Explain access, qualification, NDA, deal package, and offer steps from the buyer's perspective. Do not expose internal authorization structures unless necessary for security or support.

### Capital Agent

Use deal-specific, factual language. Do not promise returns, characterize speculative outcomes as guaranteed, or bypass required review/approval.

### Relationship Agent

Post-transaction communication should preserve context and relationship history while avoiding unnecessary disclosure of internal notes or system data.

### Executive Agent

Executive-facing outputs may use internal ARE terminology because the audience is authorized management. If content is repurposed for a customer, it must be translated through this standard first.

## Customer Intent Vocabulary

Agents should recognize and respond to customer language such as:

- "I inherited a house."
- "I need to sell without making repairs."
- "I am not ready to sell yet."
- "I need someone to keep an eye on the property."
- "My house is too much to maintain."
- "I live out of state and need help with a Connecticut property."
- "Can I sell and receive payments over time?"
- "I have a property or deal for you to look at."
- "How do I get access to deals?"
- "I have capital to lend."

The agent should map those phrases to the correct ARE service/workflow internally without forcing the formal service name into the opening sentence.

## CTA Rules

Prefer clear action language:

- Tell Us What's Going On
- See My Options
- Get My Property Reviewed
- Submit My Property
- Request Property Support
- Send the Missing Information
- Review the Proposed Terms
- Join the Buyer Network
- Discuss a Lending Relationship

Avoid vague actions such as "Learn More" when a specific next step is available.

## Human Approval Boundary

Customer-friendly language does not weaken the Agent Engine's approval model. Agents must still obtain human approval where required for:

- binding offers or contracts;
- material negotiated terms;
- final acquisition/disposition decisions;
- release or movement of funds;
- closing-document signatures;
- legal conclusions or professional advice outside ARE's role; and
- any other action classified by the Agent Engine as approval-required.

## Audit Requirement

For externally delivered agent messages, record at minimum:

- canonical `deal_id` or relationship identifier when applicable;
- agent ID;
- communication type;
- approved workflow/service mapping;
- message status;
- human approval reference when required;
- delivery timestamp/result; and
- correlation/idempotency identifier where applicable.

The audit record may use internal terminology even when the customer-facing message does not.

## Acceptance Test

A customer-facing agent message passes when the recipient can understand:

- why ARE is contacting them;
- what the message means for their situation;
- what choices or status are relevant;
- what ARE can and cannot do; and
- what happens next.

If the message requires the customer to understand ARE plugins, state codes, agent skills, database IDs, or orchestration terminology, it fails this standard.
