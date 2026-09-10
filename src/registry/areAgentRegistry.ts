/**
 * Canonical ARE Agent Registry v1.
 *
 * This registry describes orchestration ownership only. Operational data stays
 * with the authoritative ARE plugin/service named in each definition.
 */

export interface CanonicalAREAgent {
  id: string;
  name: string;
  purpose: string;
  authoritativeServices: string[];
  humanGate: "none" | "conditional" | "mandatory";
  primaryOutput: string;
}

export const CANONICAL_ARE_AGENTS: CanonicalAREAgent[] = [
  {
    id: "intake",
    name: "Intake Agent",
    purpose: "Capture and normalize seller/property opportunities and route them through Deal Intake.",
    authoritativeServices: ["deal_intake"],
    humanGate: "none",
    primaryOutput: "Complete intake record",
  },
  {
    id: "enrichment",
    name: "Enrichment Agent",
    purpose: "Collect parcel, ownership, tax, zoning, and property facts without replacing source records.",
    authoritativeServices: ["deal_intake", "pipeline.deals"],
    humanGate: "none",
    primaryOutput: "Enriched property intelligence",
  },
  {
    id: "qualification",
    name: "Qualification Agent",
    purpose: "Assess motivation, timing, authority, fit, and missing information.",
    authoritativeServices: ["deal_intake", "pipeline.deals"],
    humanGate: "conditional",
    primaryOutput: "Qualification status and next action",
  },
  {
    id: "property_analysis",
    name: "Property Analysis Agent",
    purpose: "Organize comparable sales, rents, expenses, condition assumptions, and market context.",
    authoritativeServices: ["pipeline.deals", "underwriting"],
    humanGate: "none",
    primaryOutput: "Property analysis package",
  },
  {
    id: "underwriting",
    name: "Underwriting Agent",
    purpose: "Request and evaluate MAO, cash flow, DSCR, scenario, and seller-financing analysis.",
    authoritativeServices: ["underwriting"],
    humanGate: "conditional",
    primaryOutput: "Underwriting recommendation",
  },
  {
    id: "acquisition",
    name: "Acquisition Agent",
    purpose: "Recommend acquisition structure and negotiation strategy from approved analysis.",
    authoritativeServices: ["pipeline.deals", "underwriting", "funding"],
    humanGate: "mandatory",
    primaryOutput: "Acquisition strategy recommendation",
  },
  {
    id: "follow_up",
    name: "Follow-Up Agent",
    purpose: "Maintain seller communication cadence, reminders, nurture, and escalation.",
    authoritativeServices: ["pipeline.tasks", "pipeline.activity", "automation"],
    humanGate: "conditional",
    primaryOutput: "Recorded next communication/action",
  },
  {
    id: "offer",
    name: "Offer Agent",
    purpose: "Prepare offer packages from approved underwriting without independently recalculating the deal.",
    authoritativeServices: ["offers", "underwriting"],
    humanGate: "mandatory",
    primaryOutput: "Human-reviewable offer package",
  },
  {
    id: "transaction",
    name: "Transaction Agent",
    purpose: "Coordinate contract milestones, contingencies, title, inspections, financing, and due diligence.",
    authoritativeServices: ["pipeline.deals", "documents", "automation"],
    humanGate: "conditional",
    primaryOutput: "Transaction milestone status",
  },
  {
    id: "buyer",
    name: "Buyer Agent",
    purpose: "Match qualified buyers to authorized opportunities and track access/interest.",
    authoritativeServices: ["buyers", "marketplace"],
    humanGate: "conditional",
    primaryOutput: "Ranked qualified buyer matches",
  },
  {
    id: "capital",
    name: "Capital Agent",
    purpose: "Match lenders, equity/JV sources, and financing structures to capital requirements.",
    authoritativeServices: ["funding"],
    humanGate: "mandatory",
    primaryOutput: "Ranked funding candidates",
  },
  {
    id: "closing",
    name: "Closing Agent",
    purpose: "Monitor closing readiness, missing conditions, deadlines, and document completion.",
    authoritativeServices: ["pipeline.deals", "documents", "funding"],
    humanGate: "mandatory",
    primaryOutput: "Closing-readiness status",
  },
  {
    id: "relationship",
    name: "Relationship Agent",
    purpose: "Maintain post-transaction seller, buyer, lender, vendor, and partner follow-up.",
    authoritativeServices: ["pipeline.activity", "automation"],
    humanGate: "conditional",
    primaryOutput: "Relationship follow-up plan",
  },
  {
    id: "executive",
    name: "Executive Agent",
    purpose: "Assemble cross-platform priorities, approvals, risks, deadlines, and exceptions for leadership.",
    authoritativeServices: ["command_center", "pipeline.deals", "approvals", "events"],
    humanGate: "mandatory",
    primaryOutput: "Executive decision brief",
  },
];

export const CANONICAL_ARE_SERVICE_OWNERS: Record<string, string> = {
  deal_intake: "Algonquian Deal Intake",
  "pipeline.deals": "Algonquian Pipeline CRM",
  "pipeline.tasks": "Algonquian Pipeline CRM",
  "pipeline.activity": "Algonquian Pipeline CRM",
  underwriting: "Algonquian MAO Engine",
  offers: "Algonquian Offer Generator",
  documents: "Algonquian Document Library / PDF & Signature Engine",
  funding: "Algonquian Funding Tracker",
  buyers: "Algonquian Buyer Portal",
  marketplace: "Algonquian Deal Marketplace",
  automation: "Algonquian Automation Engine",
  command_center: "Algonquian Admin Command Center",
  approvals: "ARE Platform approval service",
  events: "ARE Platform event bus",
};
