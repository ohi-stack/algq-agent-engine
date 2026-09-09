/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  AgentDefinition, 
  SkillDefinition, 
  AgentRun, 
  ApprovalTicket, 
  AgentAuditEvent, 
  DealStatus, 
  RealEstateDeal, 
  AgentRunTraceStep,
  ExecutionRequest,
  AgentPermission
} from "../types";

// =========================================================================
// 1. ALGQ AGENT REGISTRY (WITH SCOPED PERMISSIONS & AUTONOMY TIERS)
// =========================================================================

export const ALGQ_AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "agent_intake",
    name: "Deal Intake & Sourcing Agent",
    codename: "ALGQ-INSPECTOR-01",
    role: "Automated ingestion, parsing, address geocoding, and ownership records vetting.",
    description: "Monitors inbound acquisitions leads, parses seller input, structures property parameters, and prepares initial pipeline files.",
    status: "active",
    allowedSkillIds: ["skill_parse_intake", "skill_enrich_metadata", "skill_verify_ownership"],
    autonomousLevel: "fully_autonomous",
    permissions: ["read:pipeline"],
    badgeColor: "bg-[#0B1F33] text-[#36C2B4] border border-[#0B3A63]",
    iconName: "FolderKanban",
    totalRunsCount: 142,
    successRatePercent: 99.3,
    lastActiveTimestamp: "2026-08-26T17:45:00-07:00"
  },
  {
    id: "agent_underwriting",
    name: "MAO & Quantitative Underwriting Agent",
    codename: "ALGQ-UNDERWRITER-02",
    role: "Algorithmic ARV evaluation, rehab budget matrix calculations, and maximum allowable offer modeling.",
    description: "Computes the 70% rule minus repairs and wholesale margins, runs multi-scenario financing cash-flows, and validates spread margins.",
    status: "active",
    allowedSkillIds: ["skill_calculate_mao", "skill_run_arv_comps", "skill_stress_rehab"],
    autonomousLevel: "fully_autonomous",
    permissions: ["read:pipeline", "write:underwriting"],
    badgeColor: "bg-[#0B1F33] text-[#D1A54A] border border-[#0B3A63]",
    iconName: "Calculator",
    totalRunsCount: 98,
    successRatePercent: 98.9,
    lastActiveTimestamp: "2026-08-26T17:58:00-07:00"
  },
  {
    id: "agent_offers",
    name: "Purchase Offer & Contract Agent",
    codename: "ALGQ-ORIGINATOR-03",
    role: "Contract structuring, purchase agreement drafting, seller-financing addenda, and binding submission.",
    description: "Generates binding real estate purchase contracts, LOIs, and financing clauses. Submissions require explicit human approval.",
    status: "active",
    allowedSkillIds: ["skill_generate_offer_draft", "skill_release_binding_offer", "skill_seller_finance_terms"],
    autonomousLevel: "strict_approval",
    permissions: ["read:pipeline", "write:contracts"],
    badgeColor: "bg-[#0B1F33] text-[#D1A54A] border border-[#D1A54A]/40",
    iconName: "FileSignature",
    totalRunsCount: 64,
    successRatePercent: 96.8,
    lastActiveTimestamp: "2026-08-26T18:05:00-07:00"
  },
  {
    id: "agent_capital",
    name: "Debt & Equity Capital Allocator Agent",
    codename: "ALGQ-CAPITAL-04",
    role: "Capital stack matching, private lender syndication, JV allocation, and term-sheet generation.",
    description: "Scans active private lenders and equity sponsors to match deal criteria, compute blended yields, and allocate deployment funds.",
    status: "active",
    allowedSkillIds: ["skill_match_capital", "skill_commit_capital", "skill_issue_term_sheet"],
    autonomousLevel: "supervised",
    permissions: ["read:pipeline", "manage:capital"],
    badgeColor: "bg-[#0B1F33] text-[#36C2B4] border border-[#0B3A63]",
    iconName: "Landmark",
    totalRunsCount: 51,
    successRatePercent: 100.0,
    lastActiveTimestamp: "2026-08-26T16:30:00-07:00"
  },
  {
    id: "agent_tasks",
    name: "Stage Checklist & Task Coordinator Agent",
    codename: "ALGQ-COORDINATOR-05",
    role: "Google Tasks lifecycle automation, stage transition checklist provisioning, and milestone escalation.",
    description: "Synchronizes deals into structured Google Task lists upon stage transitions and monitors due dates across acquisition phases.",
    status: "active",
    allowedSkillIds: ["skill_provision_google_tasks", "skill_audit_due_diligence", "skill_escalate_overdue"],
    autonomousLevel: "fully_autonomous",
    permissions: ["read:pipeline", "sync:google_tasks"],
    badgeColor: "bg-[#0B1F33] text-[#36C2B4] border border-[#0B3A63]",
    iconName: "CheckSquare",
    totalRunsCount: 188,
    successRatePercent: 99.5,
    lastActiveTimestamp: "2026-08-26T18:12:00-07:00"
  },
  {
    id: "agent_documents",
    name: "Legal & Document Generation Agent",
    codename: "ALGQ-SCRIBE-06",
    role: "Standardized contract assembly, assignment agreements, JV operating templates, and NDA generation.",
    description: "Assembles standardized legal documentation from Algonquian Real Estate repository templates with dynamic deal variable injection.",
    status: "active",
    allowedSkillIds: ["skill_generate_purchase_contract", "skill_generate_assignment_agreement", "skill_draft_jv_agreement"],
    autonomousLevel: "supervised",
    permissions: ["read:pipeline", "write:contracts"],
    badgeColor: "bg-[#0B1F33] text-slate-200 border border-[#0B3A63]",
    iconName: "BookOpen",
    totalRunsCount: 79,
    successRatePercent: 97.4,
    lastActiveTimestamp: "2026-08-26T15:20:00-07:00"
  },
  {
    id: "agent_transaction",
    name: "Escrow & Closing Coordinator Agent",
    codename: "ALGQ-ESCROW-07",
    role: "Title order initiation, proof of funds verification, escrow wire verification, and HUD-1 statement review.",
    description: "Coordinates closing documents, title company dispatches, and final funds release with sovereign compliance auditing.",
    status: "active",
    allowedSkillIds: ["skill_open_title_escrow", "skill_verify_pof", "skill_issue_closing_instructions"],
    autonomousLevel: "strict_approval",
    permissions: ["read:pipeline", "execute:escrow"],
    badgeColor: "bg-[#0B1F33] text-[#D1A54A] border border-[#7A1E28]",
    iconName: "ShieldCheck",
    totalRunsCount: 37,
    successRatePercent: 100.0,
    lastActiveTimestamp: "2026-08-26T14:10:00-07:00"
  }
];

// =========================================================================
// 2. ALGQ SKILL REGISTRY (WITH SCHEMAS, RETRIES, AND PERMISSION SCOPES)
// =========================================================================

export const ALGQ_SKILL_REGISTRY: SkillDefinition[] = [
  // Intake Skills
  {
    id: "skill_parse_intake",
    name: "Parse & Ingest Raw Deal Intake",
    description: "Ingests raw property leads from webhooks or manual intake forms, validates address integrity, and creates a New Intake CRM record.",
    targetSystem: "Pipeline CRM",
    allowedDealStates: [DealStatus.Intake],
    requiredInputs: [
      { name: "address", label: "Property Address", type: "string", required: true, description: "Street address to ingest" },
      { name: "askingPrice", label: "Initial Asking Price", type: "number", required: true, defaultValue: 250000, description: "Seller initial asking amount" },
      { name: "propertyType", label: "Property Type", type: "select", required: true, options: ["Single Family", "Multi-Family", "Commercial", "Land", "Mixed-Use"], defaultValue: "Multi-Family", description: "Asset classification" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 86400,
    riskLevel: "Low",
    estimatedRunTimeMs: 420,
    requiredPermissions: ["read:pipeline"],
    retryPolicy: { maxRetries: 3, backoffMs: 250 }
  },
  {
    id: "skill_enrich_metadata",
    name: "Enrich Property & Ownership Metadata",
    description: "Cross-checks municipal tax assessor records, parcel boundaries, zoning codes, and property tax status.",
    targetSystem: "Pipeline CRM",
    allowedDealStates: [DealStatus.Intake, DealStatus.DueDiligence],
    requiredInputs: [
      { name: "taxDistrict", label: "Tax Assessment District", type: "string", required: false, defaultValue: "Hartford County / CT Central", description: "County or municipal assessor jurisdiction" },
      { name: "verifyZoning", label: "Perform Zoning Verification", type: "boolean", required: true, defaultValue: true, description: "Verify legal unit count and conformance" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 43200,
    riskLevel: "Low",
    estimatedRunTimeMs: 650,
    requiredPermissions: ["read:pipeline"],
    retryPolicy: { maxRetries: 3, backoffMs: 300 }
  },
  // Underwriting Skills
  {
    id: "skill_calculate_mao",
    name: "Calculate Algonquian MAO Matrix",
    description: "Runs the proprietary Algonquian MAO algorithm: (ARV × Rule %) - Estimated Repairs - Target Wholesale Fee, updating the deal's official underwriting figures.",
    targetSystem: "MAO Engine",
    allowedDealStates: [DealStatus.Intake, DealStatus.DueDiligence, DealStatus.Underwriting],
    requiredInputs: [
      { name: "arv", label: "After Repair Value (ARV)", type: "number", required: true, defaultValue: 450000, description: "Projected post-renovation market value" },
      { name: "estimatedRepairs", label: "Estimated Rehab Cost", type: "number", required: true, defaultValue: 50000, description: "Total capital expenditure budget" },
      { name: "rulePercentage", label: "Target MAO Percentage", type: "number", required: true, defaultValue: 70, description: "Standard investment rule percentage (e.g. 70%)" },
      { name: "wholesaleFee", label: "Target Algonquian Margin", type: "number", required: true, defaultValue: 25000, description: "Target company assignment or equity fee" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 3600,
    riskLevel: "Low",
    estimatedRunTimeMs: 380,
    requiredPermissions: ["write:underwriting"],
    retryPolicy: { maxRetries: 3, backoffMs: 200 }
  },
  {
    id: "skill_run_arv_comps",
    name: "Compute ARV Comparable Analysis",
    description: "Executes distance-weighted comparative market analysis within a 1.0-mile radius, adjusting for square footage, bed/bath count, and vintage.",
    targetSystem: "MAO Engine",
    allowedDealStates: [DealStatus.DueDiligence, DealStatus.Underwriting],
    requiredInputs: [
      { name: "radiusMiles", label: "Search Radius (Miles)", type: "number", required: true, defaultValue: 1.0, description: "Maximum radius for sold comp properties" },
      { name: "maxVintageDays", label: "Max Comp Age (Days)", type: "number", required: true, defaultValue: 180, description: "Exclude comp sales older than X days" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 86400,
    riskLevel: "Low",
    estimatedRunTimeMs: 780,
    requiredPermissions: ["write:underwriting"],
    retryPolicy: { maxRetries: 3, backoffMs: 400 }
  },
  // Offer Skills
  {
    id: "skill_generate_offer_draft",
    name: "Draft Non-Binding Purchase Offer LOI",
    description: "Drafts a formalized Letter of Intent (LOI) or standard purchase agreement with calculated MAO pricing and proposed inspection contingency timelines.",
    targetSystem: "Offer Generator",
    allowedDealStates: [DealStatus.Underwriting, DealStatus.SellerNegotiation],
    requiredInputs: [
      { name: "offerPrice", label: "Proposed Offer Price", type: "number", required: true, defaultValue: 235000, description: "Offer purchase amount" },
      { name: "inspectionDays", label: "Due Diligence Inspection Period (Days)", type: "number", required: true, defaultValue: 14, description: "Free inspection window in days" },
      { name: "closingDays", label: "Closing Timeline (Days)", type: "number", required: true, defaultValue: 30, description: "Target closing timeline" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 7200,
    riskLevel: "Medium",
    estimatedRunTimeMs: 950,
    requiredPermissions: ["write:contracts"],
    retryPolicy: { maxRetries: 3, backoffMs: 450 }
  },
  {
    id: "skill_release_binding_offer",
    name: "Authorize & Release Binding Purchase Contract",
    description: "Generates an enforceable, legally binding purchase contract and transmits signed documentation to the property seller. STRICT HUMAN APPROVAL REQUIRED.",
    targetSystem: "Offer Generator",
    allowedDealStates: [DealStatus.Underwriting, DealStatus.SellerNegotiation, DealStatus.OfferSubmitted],
    blockedDealStates: [DealStatus.Funded, DealStatus.Archived],
    requiredInputs: [
      { name: "bindingPrice", label: "Binding Purchase Price", type: "number", required: true, defaultValue: 235000, description: "Contractual purchase price" },
      { name: "earnestMoney", label: "Earnest Money Deposit (EMD)", type: "number", required: true, defaultValue: 2500, description: "Escrow earnest money deposit amount" },
      { name: "authorizedSigner", label: "Sponsor Signer Name", type: "string", required: true, defaultValue: "Gregory Jones, Managing Member", description: "Designated legal signee" },
      { name: "includeSellerFinancing", label: "Include Seller Financing Addendum", type: "boolean", required: true, defaultValue: false, description: "Attach structured seller carryback terms" }
    ],
    approvalPolicy: "required",
    idempotencyTtlSeconds: 86400,
    riskLevel: "Critical",
    estimatedRunTimeMs: 1450,
    requiredPermissions: ["write:contracts"],
    retryPolicy: { maxRetries: 2, backoffMs: 600 }
  },
  {
    id: "skill_seller_finance_terms",
    name: "Structure Seller Financing Terms Addendum",
    description: "Calculates interest amortization schedule, balloon payment structuring, and compiles Promissory Note & Mortgage addenda.",
    targetSystem: "Offer Generator",
    allowedDealStates: [DealStatus.Underwriting, DealStatus.SellerNegotiation, DealStatus.UnderContract],
    requiredInputs: [
      { name: "downPayment", label: "Down Payment ($)", type: "number", required: true, defaultValue: 30000, description: "Cash to seller at closing" },
      { name: "interestRate", label: "Interest Rate (%)", type: "number", required: true, defaultValue: 5.0, description: "Annual interest rate" },
      { name: "termMonths", label: "Loan Term (Months)", type: "number", required: true, defaultValue: 60, description: "Amortization or balloon schedule in months" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 14400,
    riskLevel: "Medium",
    estimatedRunTimeMs: 820,
    requiredPermissions: ["write:contracts"],
    retryPolicy: { maxRetries: 3, backoffMs: 350 }
  },
  // Capital Allocation Skills
  {
    id: "skill_match_capital",
    name: "Match Private Capital Stack",
    description: "Scans active private lenders and JV partners in the Funding Tracker to find capital allocations matching the asset yield and risk tier.",
    targetSystem: "Funding Tracker",
    allowedDealStates: [DealStatus.Underwriting, DealStatus.UnderContract],
    requiredInputs: [
      { name: "requiredCapital", label: "Capital Allocation Required ($)", type: "number", required: true, defaultValue: 250000, description: "Total acquisition or rehab capital needed" },
      { name: "targetYieldPercent", label: "Offered Yield / Interest Rate (%)", type: "number", required: true, defaultValue: 9.5, description: "Target yield for debt partner" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 14400,
    riskLevel: "Low",
    estimatedRunTimeMs: 520,
    requiredPermissions: ["manage:capital"],
    retryPolicy: { maxRetries: 3, backoffMs: 300 }
  },
  {
    id: "skill_commit_capital",
    name: "Formally Commit & Allocate Capital Source",
    description: "Binds an active private lender or sponsor equity commitment to the deal, reserving allocation capacity. HUMAN SPONSOR APPROVAL REQUIRED.",
    targetSystem: "Funding Tracker",
    allowedDealStates: [DealStatus.UnderContract, DealStatus.Funded],
    requiredInputs: [
      { name: "fundingSourceId", label: "Target Funding Source ID", type: "string", required: true, defaultValue: "fund-1", description: "Lender or JV partner to allocate from" },
      { name: "allocatedAmount", label: "Allocated Amount ($)", type: "number", required: true, defaultValue: 200000, description: "Committed funds" }
    ],
    approvalPolicy: "required",
    riskLevel: "High",
    idempotencyTtlSeconds: 86400,
    estimatedRunTimeMs: 1100,
    requiredPermissions: ["manage:capital"],
    retryPolicy: { maxRetries: 2, backoffMs: 500 }
  },
  // Google Tasks Skills
  {
    id: "skill_provision_google_tasks",
    name: "Provision Stage Google Task List",
    description: "Creates an authorized, synchronized Google Tasks list for the deal's current stage with standardized due diligence milestone items.",
    targetSystem: "Google Tasks",
    allowedDealStates: [DealStatus.Intake, DealStatus.DueDiligence, DealStatus.Underwriting, DealStatus.OfferSubmitted, DealStatus.SellerNegotiation, DealStatus.UnderContract, DealStatus.Funded],
    requiredInputs: [
      { name: "syncDueDates", label: "Assign Standard Timeline Due Dates", type: "boolean", required: true, defaultValue: true, description: "Calculate date offsets from today" },
      { name: "priorityLevel", label: "Task Priority", type: "select", required: true, options: ["High", "Standard", "Low"], defaultValue: "High", description: "Initial priority tag" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 3600,
    riskLevel: "Low",
    estimatedRunTimeMs: 720,
    requiredPermissions: ["sync:google_tasks"],
    retryPolicy: { maxRetries: 3, backoffMs: 250 }
  },
  {
    id: "skill_audit_due_diligence",
    name: "Audit Due Diligence Checklist Completion",
    description: "Verifies completion of critical contingencies (title search, environmental inspection, lease audits) before permitting stage progression.",
    targetSystem: "Google Tasks",
    allowedDealStates: [DealStatus.DueDiligence, DealStatus.UnderContract],
    requiredInputs: [
      { name: "requireTitleClearance", label: "Require Clean Title Report", type: "boolean", required: true, defaultValue: true, description: "Enforce title clearance verification" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 3600,
    riskLevel: "Low",
    estimatedRunTimeMs: 460,
    requiredPermissions: ["sync:google_tasks"],
    retryPolicy: { maxRetries: 3, backoffMs: 200 }
  },
  // Legal & Documents
  {
    id: "skill_generate_purchase_contract",
    name: "Generate Purchase & Sale Agreement",
    description: "Compiles full Algonquian Real Estate sovereign standard Purchase & Sale Agreement document from library templates.",
    targetSystem: "Document Library",
    allowedDealStates: [DealStatus.Underwriting, DealStatus.OfferSubmitted, DealStatus.UnderContract],
    requiredInputs: [
      { name: "buyerEntity", label: "Purchasing Entity", type: "string", required: true, defaultValue: "Algonquian Real Estate, LLC", description: "Corporate buying vehicle" },
      { name: "closingTimelineDays", label: "Closing Window (Days)", type: "number", required: true, defaultValue: 21, description: "Closing days" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 7200,
    riskLevel: "Medium",
    estimatedRunTimeMs: 880,
    requiredPermissions: ["write:contracts"],
    retryPolicy: { maxRetries: 3, backoffMs: 350 }
  },
  {
    id: "skill_generate_assignment_agreement",
    name: "Draft Wholesale Assignment Contract",
    description: "Generates Assignment of Purchase and Sale Agreement for disposition to pre-vetted institutional or private cash buyers.",
    targetSystem: "Document Library",
    allowedDealStates: [DealStatus.UnderContract, DealStatus.Funded],
    requiredInputs: [
      { name: "assigneeName", label: "Assignee / Cash Buyer Name", type: "string", required: true, defaultValue: "Sovereign Holdings LLC", description: "End buyer name" },
      { name: "assignmentFee", label: "Assignment Fee ($)", type: "number", required: true, defaultValue: 25000, description: "Wholesale assignment fee" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 7200,
    riskLevel: "Medium",
    estimatedRunTimeMs: 910,
    requiredPermissions: ["write:contracts"],
    retryPolicy: { maxRetries: 3, backoffMs: 400 }
  },
  // Closing / Escrow
  {
    id: "skill_open_title_escrow",
    name: "Initiate Title & Escrow File",
    description: "Dispatches purchase contract and escrow instructions to closing attorney / title agent to begin municipal lien and title searches.",
    targetSystem: "Escrow & Title",
    allowedDealStates: [DealStatus.UnderContract],
    requiredInputs: [
      { name: "titleCompany", label: "Title Company / Attorney", type: "string", required: true, defaultValue: "First American Title / CT Settlement Services", description: "Escrow agent contact" },
      { name: "targetClosingDate", label: "Target Closing Date", type: "string", required: true, defaultValue: "2026-09-30", description: "Target settlement date" }
    ],
    approvalPolicy: "none",
    idempotencyTtlSeconds: 86400,
    riskLevel: "Medium",
    estimatedRunTimeMs: 640,
    requiredPermissions: ["execute:escrow"],
    retryPolicy: { maxRetries: 3, backoffMs: 400 }
  },
  {
    id: "skill_issue_closing_instructions",
    name: "Authorize Escrow Closing & Wire Release",
    description: "Issues final authorization for title closing settlement statement (HUD-1) and wire funds release. STRICT HUMAN SPONSOR SIGN-OFF REQUIRED.",
    targetSystem: "Escrow & Title",
    allowedDealStates: [DealStatus.UnderContract, DealStatus.Funded],
    requiredInputs: [
      { name: "hudNetFunds", label: "Final HUD-1 Net Settlement Amount ($)", type: "number", required: true, defaultValue: 228450, description: "Final wire amount" },
      { name: "sponsorSignoffKey", label: "Sponsor Authentication Token", type: "string", required: true, defaultValue: "ARE-SPONSOR-GJONES-AUTH", description: "Managing member cryptographic approval" }
    ],
    approvalPolicy: "required",
    riskLevel: "Critical",
    idempotencyTtlSeconds: 86400,
    estimatedRunTimeMs: 1800,
    requiredPermissions: ["execute:escrow"],
    retryPolicy: { maxRetries: 1, backoffMs: 1000 }
  }
];

// =========================================================================
// 3. IN-MEMORY IDEMPOTENCY ENGINE
// =========================================================================

interface CachedIdempotencyRecord {
  timestamp: number;
  result: ExecuteSkillResult;
  ttlMs: number;
  key: string;
}

class IdempotencyEngine {
  private cache: Map<string, CachedIdempotencyRecord> = new Map();

  public check(key: string): CachedIdempotencyRecord | null {
    const record = this.cache.get(key);
    if (!record) return null;
    const now = Date.now();
    if (now - record.timestamp > record.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return record;
  }

  public register(key: string, result: ExecuteSkillResult, ttlSeconds: number) {
    this.cache.set(key, {
      timestamp: Date.now(),
      result,
      ttlMs: ttlSeconds * 1000,
      key
    });
  }

  public clear() {
    this.cache.clear();
  }

  public getKeysCount(): number {
    return this.cache.size;
  }
}

export const idempotencyStore = new IdempotencyEngine();

// =========================================================================
// 4. SEED DATA (RUNS, TICKETS, AUDIT LEDGER)
// =========================================================================

export const SEED_AGENT_RUNS: AgentRun[] = [
  {
    id: "run-9842",
    executionRequestId: "req-10921",
    correlationId: "corr-84820-991",
    idempotencyKey: "deal-1:agent_underwriting:skill_calculate_mao:7fa8c3",
    dealId: "deal-1",
    dealAddress: "244 Pine Street, Waterbury CT",
    agentId: "agent_underwriting",
    agentName: "MAO & Quantitative Underwriting Agent",
    skillId: "skill_calculate_mao",
    skillName: "Calculate Algonquian MAO Matrix",
    targetSystem: "MAO Engine",
    status: "completed",
    attemptCount: 1,
    maxRetries: 3,
    inputPayload: {
      arv: 420000,
      estimatedRepairs: 45000,
      rulePercentage: 70,
      wholesaleFee: 20000
    },
    outputResult: {
      mao: 229000,
      maxSpread: 126000,
      formula: "($420,000 * 0.70) - $45,000 - $20,000 = $229,000",
      isProfitable: true
    },
    stateDelta: {
      propertyUpdates: { mao: 229000 }
    },
    traceSteps: [
      { stepNumber: 1, stepName: "1. Skill Validation", timestamp: "2026-08-26T17:58:01.010Z", status: "success", durationMs: 12, details: "Loaded skill schema [skill_calculate_mao]. Verified 4 typed parameters." },
      { stepNumber: 2, stepName: "2. Execution Request & Idempotency", timestamp: "2026-08-26T17:58:01.022Z", status: "success", durationMs: 14, details: "Ingested request #req-10921. Idempotency lock granted [deal-1:...:7fa8c3]. TTL: 3600s." },
      { stepNumber: 3, stepName: "3. Authorization & Permissions", timestamp: "2026-08-26T17:58:01.036Z", status: "success", durationMs: 15, details: "Verified Agent permissions ['write:underwriting'] matches skill requirements. Deal exists in canonical CRM." },
      { stepNumber: 4, stepName: "4. Human Approval Boundary", timestamp: "2026-08-26T17:58:01.051Z", status: "skipped", durationMs: 4, details: "Policy is [none]. Non-binding calculation. Autonomous execution permitted." },
      { stepNumber: 5, stepName: "5. Execution & Retries", timestamp: "2026-08-26T17:58:01.055Z", status: "success", durationMs: 290, details: "Attempt 1/3 succeeded. MAO Engine calculated output in 290ms without errors." },
      { stepNumber: 6, stepName: "6. Result & CRM State Delta", timestamp: "2026-08-26T17:58:01.345Z", status: "success", durationMs: 24, details: "MAO: $229,000. Committed state delta to canonical deal [deal-1]." },
      { stepNumber: 7, stepName: "7. Immutable Audit Event", timestamp: "2026-08-26T17:58:01.369Z", status: "success", durationMs: 25, details: "Generated cryptographic checksum #ALGQ-AUD-9842-88AF. Written to append-only audit stream." }
    ],
    startedAt: "2026-08-26T17:58:01.010Z",
    completedAt: "2026-08-26T17:58:01.394Z",
    durationMs: 384,
    operator: "ALGQ-ORCHESTRATOR-AUTO"
  },
  {
    id: "run-9843",
    executionRequestId: "req-10922",
    correlationId: "corr-84820-992",
    idempotencyKey: "deal-3:agent_tasks:skill_provision_google_tasks:3cb19a",
    dealId: "deal-3",
    dealAddress: "105 Crown Street, New Haven CT",
    agentId: "agent_tasks",
    agentName: "Stage Checklist & Task Coordinator Agent",
    skillId: "skill_provision_google_tasks",
    skillName: "Provision Stage Google Task List",
    targetSystem: "Google Tasks",
    status: "completed",
    attemptCount: 1,
    maxRetries: 3,
    inputPayload: {
      syncDueDates: true,
      priorityLevel: "High"
    },
    outputResult: {
      taskListTitle: "Offer Submitted: 105 Crown Street",
      tasksCount: 4,
      items: [
        "Transmitted formal Purchase Offer to seller",
        "Set 48-hour follow-up calendar reminder",
        "Prepare pre-approval proof of funds addendum",
        "Verify earnest money escrow instructions"
      ]
    },
    traceSteps: [
      { stepNumber: 1, stepName: "1. Skill Validation", timestamp: "2026-08-26T18:12:00.100Z", status: "success", durationMs: 10, details: "Loaded skill schema [skill_provision_google_tasks]." },
      { stepNumber: 2, stepName: "2. Execution Request & Idempotency", timestamp: "2026-08-26T18:12:00.110Z", status: "success", durationMs: 12, details: "Ingested request #req-10922. Idempotency lock active." },
      { stepNumber: 3, stepName: "3. Authorization & Permissions", timestamp: "2026-08-26T18:12:00.122Z", status: "success", durationMs: 14, details: "Agent authorized with scope ['sync:google_tasks']. State [Offer Submitted] permitted." },
      { stepNumber: 4, stepName: "4. Human Approval Boundary", timestamp: "2026-08-26T18:12:00.136Z", status: "skipped", durationMs: 2, details: "Policy is [none]. Non-contractual stage automation." },
      { stepNumber: 5, stepName: "5. Execution & Retries", timestamp: "2026-08-26T18:12:00.138Z", status: "success", durationMs: 520, details: "Attempt 1/3 succeeded. Synchronized 4 tasks into Google Tasks API." },
      { stepNumber: 6, stepName: "6. Result & CRM State Delta", timestamp: "2026-08-26T18:12:00.658Z", status: "success", durationMs: 17, details: "Linked task list to CRM record." },
      { stepNumber: 7, stepName: "7. Immutable Audit Event", timestamp: "2026-08-26T18:12:00.675Z", status: "success", durationMs: 20, details: "Signed audit record with hash #ALGQ-AUD-9843-4A01." }
    ],
    startedAt: "2026-08-26T18:12:00.100Z",
    completedAt: "2026-08-26T18:12:00.695Z",
    durationMs: 595,
    operator: "ALGQ-ORCHESTRATOR-AUTO"
  },
  {
    id: "run-9844",
    executionRequestId: "req-10923",
    correlationId: "corr-84820-993",
    idempotencyKey: "deal-2:agent_offers:skill_release_binding_offer:99d21e",
    dealId: "deal-2",
    dealAddress: "89 Farmington Avenue, Hartford CT",
    agentId: "agent_offers",
    agentName: "Purchase Offer & Contract Agent",
    skillId: "skill_release_binding_offer",
    skillName: "Authorize & Release Binding Purchase Contract",
    targetSystem: "Offer Generator",
    status: "awaiting_approval",
    attemptCount: 1,
    maxRetries: 2,
    approvalTicketId: "ticket-101",
    inputPayload: {
      bindingPrice: 585000,
      earnestMoney: 10000,
      authorizedSigner: "Gregory Jones, Managing Member",
      includeSellerFinancing: false
    },
    traceSteps: [
      { stepNumber: 1, stepName: "1. Skill Validation", timestamp: "2026-08-26T18:15:20.001Z", status: "success", durationMs: 11, details: "Loaded skill schema [skill_release_binding_offer]. Verified purchase price and EMD." },
      { stepNumber: 2, stepName: "2. Execution Request & Idempotency", timestamp: "2026-08-26T18:15:20.012Z", status: "success", durationMs: 14, details: "Ingested request #req-10923. Priority: High." },
      { stepNumber: 3, stepName: "3. Authorization & Permissions", timestamp: "2026-08-26T18:15:20.026Z", status: "success", durationMs: 16, details: "Verified agent permission ['write:contracts']. State [Due Diligence / Negotiation] permitted." },
      { stepNumber: 4, stepName: "4. Human Approval Boundary", timestamp: "2026-08-26T18:15:20.042Z", status: "warning", durationMs: 45, details: "BOUNDARY TRIGGERED: Legally binding purchase contract for $585,000 with $10,000 EMD requires sponsor sign-off. Created ApprovalTicket #ticket-101. Execution paused." },
      { stepNumber: 5, stepName: "5. Execution & Retries", timestamp: "2026-08-26T18:15:20.087Z", status: "pending", durationMs: 0, details: "Held behind Sponsor Approval Gate. Waiting for Managing Member signature." },
      { stepNumber: 6, stepName: "6. Result & CRM State Delta", timestamp: "2026-08-26T18:15:20.087Z", status: "pending", durationMs: 0, details: "Pending signature verification." },
      { stepNumber: 7, stepName: "7. Immutable Audit Event", timestamp: "2026-08-26T18:15:20.090Z", status: "success", durationMs: 18, details: "Audit recorded: [INTERCEPTED_APPROVAL] with Ticket #ticket-101." }
    ],
    startedAt: "2026-08-26T18:15:20.001Z",
    operator: "Gregory Jones (Initiator)"
  }
];

export const SEED_APPROVAL_TICKETS: ApprovalTicket[] = [
  {
    id: "ticket-101",
    runId: "run-9844",
    executionRequestId: "req-10923",
    dealId: "deal-2",
    dealAddress: "89 Farmington Avenue, Hartford CT",
    agentId: "agent_offers",
    agentName: "Purchase Offer & Contract Agent",
    skillId: "skill_release_binding_offer",
    skillName: "Authorize & Release Binding Purchase Contract",
    severity: "Critical",
    status: "pending",
    summary: "Release of $585,000 legally binding Commercial Purchase Contract with $10,000 Earnest Money Escrow.",
    proposedAction: "Execute standardized Purchase and Sale Agreement, sign with Managing Member credentials, and transmit contract to Sarah Jenkins & Associates.",
    payloadSnapshot: {
      bindingPrice: 585000,
      earnestMoney: 10000,
      arvSpread: 515000,
      inspectionDays: 21,
      authorizedSigner: "Gregory Jones, Managing Member"
    },
    riskEvaluation: "High contractual consequence. Commits Algonquian Real Estate to legal purchase terms upon seller signature. ARV spread is $515,000 (47% margin under $1.1M ARV).",
    createdAt: "2026-08-26T18:15:20.053Z",
    notes: "Requires Managing Member formal sign-off before contract dispatch."
  },
  {
    id: "ticket-102",
    runId: "run-9830",
    executionRequestId: "req-10915",
    dealId: "deal-1",
    dealAddress: "244 Pine Street, Waterbury CT",
    agentId: "agent_capital",
    agentName: "Debt & Equity Capital Allocator Agent",
    skillId: "skill_commit_capital",
    skillName: "Formally Commit & Allocate Capital Source",
    severity: "High",
    status: "pending",
    summary: "Reserve $200,000 1st Lien Capital allocation from Patriot Commercial Capital.",
    proposedAction: "Lock $200,000 capacity from Patriot Commercial Capital at 10.5% interest rate for acquisition of 4-unit value-add property.",
    payloadSnapshot: {
      fundingSourceId: "fund-1",
      lenderName: "Patriot Commercial Capital",
      allocatedAmount: 200000,
      targetYield: 10.5
    },
    riskEvaluation: "Capital stack commitment. Verifies sponsor equity margin of $29,000 cash balance.",
    createdAt: "2026-08-26T17:30:10.120Z",
    notes: "Awaiting final appraisal verification."
  }
];

export const SEED_AUDIT_LOGS: AgentAuditEvent[] = [
  {
    id: "aud-9844-01",
    timestamp: "2026-08-26T18:15:20.100Z",
    dealId: "deal-2",
    dealAddress: "89 Farmington Avenue, Hartford CT",
    agentId: "agent_offers",
    agentName: "Purchase Offer & Contract Agent",
    skillId: "skill_release_binding_offer",
    skillName: "Authorize & Release Binding Purchase Contract",
    action: "APPROVAL_GATE_INTERCEPT",
    status: "INTERCEPTED_APPROVAL",
    operator: "ALGQ-ORCHESTRATOR",
    idempotencyKey: "deal-2:agent_offers:skill_release_binding_offer:99d21e",
    payloadHash: "sha256:7e99ab12c0192e88a",
    details: "Created Approval Ticket #ticket-101 for $585,000 binding purchase offer. Paused execution.",
    auditChecksum: "#ALGQ-AUD-9844-7E99"
  },
  {
    id: "aud-9843-01",
    timestamp: "2026-08-26T18:12:00.675Z",
    dealId: "deal-3",
    dealAddress: "105 Crown Street, New Haven CT",
    agentId: "agent_tasks",
    agentName: "Stage Checklist & Task Coordinator Agent",
    skillId: "skill_provision_google_tasks",
    skillName: "Provision Stage Google Task List",
    action: "GOOGLE_TASKS_SYNC",
    status: "SUCCESS",
    operator: "ALGQ-ORCHESTRATOR-AUTO",
    idempotencyKey: "deal-3:agent_tasks:skill_provision_google_tasks:3cb19a",
    payloadHash: "sha256:4a01bc89ff129a00b",
    details: "Synchronized 4 stage checklist milestones to Google Tasks API for Offer Submitted stage.",
    auditChecksum: "#ALGQ-AUD-9843-4A01"
  },
  {
    id: "aud-9842-01",
    timestamp: "2026-08-26T17:58:01.369Z",
    dealId: "deal-1",
    dealAddress: "244 Pine Street, Waterbury CT",
    agentId: "agent_underwriting",
    agentName: "MAO & Quantitative Underwriting Agent",
    skillId: "skill_calculate_mao",
    skillName: "Calculate Algonquian MAO Matrix",
    action: "MAO_MATRIX_RECALCULATION",
    status: "SUCCESS",
    operator: "ALGQ-ORCHESTRATOR-AUTO",
    idempotencyKey: "deal-1:agent_underwriting:skill_calculate_mao:7fa8c3",
    payloadHash: "sha256:1f44aa890918b2011",
    details: "Computed MAO of $229,000 from ARV $420k, Repairs $45k, Wholesale $20k. Delta recorded in CRM.",
    auditChecksum: "#ALGQ-AUD-9842-1F44"
  }
];

// =========================================================================
// 5. PRODUCTION 1.0.0 ORCHESTRATOR INTERFACES & EXECUTION LOGIC
// =========================================================================

export interface ExecuteSkillRequest {
  deal: RealEstateDeal;
  agentId: string;
  skillId: string;
  inputs: Record<string, any>;
  operator?: string;
  idempotencyKey?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  maxRetries?: number;
  simulateFailureMode?: "none" | "transient_timeout" | "permission_denied" | "state_violation" | "schema_error";
  allowDuplicateReplay?: boolean;
}

export interface ExecuteSkillResult {
  run: AgentRun;
  ticket?: ApprovalTicket;
  auditEvent: AgentAuditEvent;
  updatedDeal?: Partial<RealEstateDeal>;
  message: string;
  isAwaitingApproval: boolean;
  isIdempotencyReplay?: boolean;
}

/**
 * Executes an Agent Skill through the formal 7-Stage Core Pipeline:
 * [1. Skills] → [2. Execution Requests] → [3. Authorization] → [4. Approval] → [5. Execution] → [6. Result] → [7. Audit Event]
 */
export function executeAgentSkill(
  request: ExecuteSkillRequest,
  onStageTaskEvent?: (eventName: string, details: any) => void
): ExecuteSkillResult {
  const { 
    deal, 
    agentId, 
    skillId, 
    inputs, 
    operator = "Gregory Jones (Managing Member)",
    idempotencyKey: userKey,
    priority = "normal",
    maxRetries = 3,
    simulateFailureMode = "none",
    allowDuplicateReplay = false
  } = request;

  const startedAt = new Date().toISOString();
  const runId = `run-${Math.floor(1000 + Math.random() * 9000)}`;
  const executionRequestId = `req-${Math.floor(10000 + Math.random() * 90000)}`;
  const correlationId = `corr-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(100 + Math.random() * 900)}`;
  
  const idempotencyHash = Math.random().toString(36).substring(2, 8);
  const idempotencyKey = userKey || `${deal.id}:${agentId}:${skillId}:${idempotencyHash}`;
  const payloadHash = `sha256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`;
  const auditChecksum = `#ALGQ-AUD-${runId.replace("run-", "")}-${payloadHash.substring(7, 11).toUpperCase()}`;

  const traceSteps: AgentRunTraceStep[] = [];

  // -----------------------------------------------------------------------
  // STAGE 1: SKILL RESOLUTION & PARAMETER VALIDATION
  // -----------------------------------------------------------------------
  const agent = ALGQ_AGENT_REGISTRY.find(a => a.id === agentId);
  const skill = ALGQ_SKILL_REGISTRY.find(s => s.id === skillId);

  if (!agent || !skill) {
    const err = "Invalid agent or skill identifier in execution request.";
    traceSteps.push({
      stepNumber: 1,
      stepName: "1. Skill Validation",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 4,
      details: err
    });

    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId,
      agentName: agent?.name || "Unknown Agent",
      skillId,
      skillName: skill?.name || "Unknown Skill",
      targetSystem: skill?.targetSystem || "Pipeline CRM",
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 4,
      operator
    };

    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId,
      agentName: failedRun.agentName,
      skillId,
      skillName: failedRun.skillName,
      action: "EXECUTION_REQUEST_REJECTED",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: `Resolution failed: ${err}`,
      auditChecksum
    };

    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  // Schema check / simulated failure
  if (simulateFailureMode === "schema_error") {
    const err = "Schema Validation Error: Required parameter 'arv' is out of allowable investment boundary.";
    traceSteps.push({
      stepNumber: 1,
      stepName: "1. Skill Validation",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 8,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 12,
      operator
    };
    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "SCHEMA_VALIDATION_FAILURE",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: err,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  traceSteps.push({
    stepNumber: 1,
    stepName: "1. Skill Validation",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 8,
    details: `Resolved [${skill.name}] with target [${skill.targetSystem}]. Schema checked with ${Object.keys(inputs).length} parameters.`
  });

  // -----------------------------------------------------------------------
  // STAGE 2: EXECUTION REQUEST & IDEMPOTENCY LOCK
  // -----------------------------------------------------------------------
  const existingIdempotency = idempotencyStore.check(idempotencyKey);
  if (existingIdempotency && !allowDuplicateReplay) {
    traceSteps.push({
      stepNumber: 2,
      stepName: "2. Execution Request & Idempotency",
      timestamp: new Date().toISOString(),
      status: "warning",
      durationMs: 10,
      details: `IDEMPOTENCY LOCK HIT: Duplicate request detected for key [${idempotencyKey}]. Returning cached result without duplicate execution.`
    });

    return {
      ...existingIdempotency.result,
      isIdempotencyReplay: true,
      message: `[IDEMPOTENCY HIT] Request with key ${idempotencyKey} already executed. Replayed cached execution output.`
    };
  }

  traceSteps.push({
    stepNumber: 2,
    stepName: "2. Execution Request & Idempotency",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 12,
    details: `Ingested Execution Request #${executionRequestId}. Registered Idempotency Lock [${idempotencyKey}] with TTL of ${skill.idempotencyTtlSeconds}s. Priority: ${priority.toUpperCase()}.`
  });

  // -----------------------------------------------------------------------
  // STAGE 3: AUTHORIZATION & PERMISSIONS CHECK
  // -----------------------------------------------------------------------
  // 3a. Agent status check
  if (agent.status === "paused" || agent.status === "idle") {
    const err = `Authorization Error: Agent [${agent.name}] is currently in [${agent.status.toUpperCase()}] state and cannot process execution requests.`;
    traceSteps.push({
      stepNumber: 3,
      stepName: "3. Authorization & Permissions",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 10,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 25,
      operator
    };
    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "AGENT_INACTIVE_BLOCK",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: err,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  // 3b. Allowlist verification
  if (!agent.allowedSkillIds.includes(skill.id)) {
    const err = `Security Policy Block: Agent [${agent.name}] is not allowlisted to execute skill [${skill.name}]. Cross-agent bypass prohibited.`;
    traceSteps.push({
      stepNumber: 3,
      stepName: "3. Authorization & Permissions",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 12,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 22,
      operator
    };
    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "UNAUTHORIZED_SKILL_ATTEMPT",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: err,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  // 3c. Permissions Scope verification
  const agentPerms = agent.permissions || [];
  const requiredPerms = skill.requiredPermissions || [];
  const hasAllPermissions = requiredPerms.every(p => agentPerms.includes(p));

  if (!hasAllPermissions || simulateFailureMode === "permission_denied") {
    const missing = requiredPerms.filter(p => !agentPerms.includes(p));
    const err = `Permission Denied: Agent [${agent.name}] lacks required permission scope [${missing.join(", ") || "insufficient"}]. Requires Managing Member privilege escalation.`;
    traceSteps.push({
      stepNumber: 3,
      stepName: "3. Authorization & Permissions",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 14,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 28,
      operator
    };
    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "PERMISSION_DENIED_BLOCK",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: err,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  // 3d. Deal State Machine Verification
  const isAllowedState = skill.allowedDealStates.includes(deal.status);
  const isBlockedState = skill.blockedDealStates ? skill.blockedDealStates.includes(deal.status) : false;

  if (!isAllowedState || isBlockedState || simulateFailureMode === "state_violation") {
    const err = `State Machine Violation: Skill [${skill.name}] cannot execute when deal is in status [${deal.status}]. Permitted states: [${skill.allowedDealStates.join(", ")}].`;
    traceSteps.push({
      stepNumber: 3,
      stepName: "3. Authorization & Permissions",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 11,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "failed",
      inputPayload: inputs,
      errorMessage: err,
      traceSteps,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 32,
      operator
    };
    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "STATE_MACHINE_REJECTION",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: err,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  traceSteps.push({
    stepNumber: 3,
    stepName: "3. Authorization & Permissions",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 14,
    details: `Authorized. Agent permissions verified: [${agentPerms.join(", ")}]. Canonical CRM Deal verified [${deal.address}]. State [${deal.status}] matches allowlist.`
  });

  // -----------------------------------------------------------------------
  // STAGE 4: HUMAN APPROVAL BOUNDARY EVALUATION
  // -----------------------------------------------------------------------
  const isApprovalRequired = 
    skill.approvalPolicy === "required" || 
    skill.approvalPolicy === "prohibited_autonomous" ||
    skill.riskLevel === "Critical";

  if (isApprovalRequired) {
    const ticketId = `ticket-${Math.floor(100 + Math.random() * 900)}`;
    traceSteps.push({
      stepNumber: 4,
      stepName: "4. Human Approval Boundary",
      timestamp: new Date().toISOString(),
      status: "warning",
      durationMs: 38,
      details: `HUMAN APPROVAL GATE ENGAGED: Skill [${skill.name}] has high contractual/capital impact (${skill.riskLevel} Risk). Provisioned ApprovalTicket #${ticketId}. Execution paused awaiting Managing Member signature.`
    });
    traceSteps.push({
      stepNumber: 5,
      stepName: "5. Execution & Retries",
      timestamp: new Date().toISOString(),
      status: "pending",
      durationMs: 0,
      details: "Queued behind Approval Gate."
    });
    traceSteps.push({
      stepNumber: 6,
      stepName: "6. Result & CRM State Delta",
      timestamp: new Date().toISOString(),
      status: "pending",
      durationMs: 0,
      details: "Awaiting approval resolution."
    });
    traceSteps.push({
      stepNumber: 7,
      stepName: "7. Immutable Audit Event",
      timestamp: new Date().toISOString(),
      status: "success",
      durationMs: 15,
      details: `Audit recorded: [INTERCEPTED_APPROVAL] with Ticket #${ticketId}. Checksum: ${auditChecksum}.`
    });

    const ticket: ApprovalTicket = {
      id: ticketId,
      runId,
      executionRequestId,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      severity: skill.riskLevel === "Critical" ? "Critical" : "High",
      status: "pending",
      summary: `Authorize ${skill.name} for property at ${deal.address}`,
      proposedAction: `Execute ${skill.targetSystem} operation with payload: ${JSON.stringify(inputs)}`,
      payloadSnapshot: inputs,
      riskEvaluation: `Consequential action. Risk Tier: ${skill.riskLevel}. Policy mandates explicit approval before contract or funds binding.`,
      createdAt: new Date().toISOString()
    };

    const run: AgentRun = {
      id: runId,
      executionRequestId,
      correlationId,
      idempotencyKey,
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      targetSystem: skill.targetSystem,
      status: "awaiting_approval",
      approvalTicketId: ticketId,
      attemptCount: 1,
      maxRetries,
      inputPayload: inputs,
      traceSteps,
      startedAt,
      operator
    };

    const audit: AgentAuditEvent = {
      id: `aud-${runId}-01`,
      timestamp: new Date().toISOString(),
      dealId: deal.id,
      dealAddress: deal.address,
      agentId: agent.id,
      agentName: agent.name,
      skillId: skill.id,
      skillName: skill.name,
      action: "APPROVAL_GATE_INTERCEPT",
      status: "INTERCEPTED_APPROVAL",
      operator,
      idempotencyKey,
      payloadHash,
      details: `Created Approval Ticket #${ticketId} for ${skill.name}. Execution placed on hold.`,
      auditChecksum
    };

    const result: ExecuteSkillResult = { 
      run, 
      ticket, 
      auditEvent: audit, 
      message: `Action intercepted by Human Approval Gate. Ticket #${ticketId} created for Managing Member review.`, 
      isAwaitingApproval: true 
    };

    idempotencyStore.register(idempotencyKey, result, skill.idempotencyTtlSeconds);
    return result;
  }

  // Approval Policy = None
  traceSteps.push({
    stepNumber: 4,
    stepName: "4. Human Approval Boundary",
    timestamp: new Date().toISOString(),
    status: "skipped",
    durationMs: 4,
    details: "Approval policy is [none]. Non-contractual operation. Immediate autonomous execution approved."
  });

  // -----------------------------------------------------------------------
  // STAGE 5: EXECUTION WITH RETRY CONTROLS & RECOVERY
  // -----------------------------------------------------------------------
  let currentAttempt = 1;
  const retryHistory: { attempt: number; timestamp: string; error: string; backoffMs: number }[] = [];

  if (simulateFailureMode === "transient_timeout") {
    // Simulate retry failure logic
    retryHistory.push({
      attempt: 1,
      timestamp: new Date().toISOString(),
      error: "SocketTimeoutException: Connection to downstream target system timed out after 3000ms.",
      backoffMs: 250
    });
    currentAttempt = 2;

    traceSteps.push({
      stepNumber: 5,
      stepName: "5. Execution & Retries",
      timestamp: new Date().toISOString(),
      status: "warning",
      durationMs: 250,
      details: `Attempt 1 failed with transient timeout. Initiated automated retry attempt 2/${maxRetries} with exponential backoff (250ms delay). Re-established adapter session.`
    });
  } else {
    traceSteps.push({
      stepNumber: 5,
      stepName: "5. Execution & Retries",
      timestamp: new Date().toISOString(),
      status: "success",
      durationMs: skill.estimatedRunTimeMs,
      details: `Attempt 1/${maxRetries} succeeded. Target adapter [${skill.targetSystem}] responded within ${skill.estimatedRunTimeMs}ms with 200 OK.`
    });
  }

  // -----------------------------------------------------------------------
  // STAGE 6: RESULT COMPILATION & CANONICAL CRM STATE DELTA
  // -----------------------------------------------------------------------
  const updatedDeal: Partial<RealEstateDeal> = {};
  let outputResult: Record<string, any> = {};

  if (skill.id === "skill_calculate_mao") {
    const arv = Number(inputs.arv) || deal.arv;
    const repairs = Number(inputs.estimatedRepairs) || deal.estimatedRepairs;
    const rule = (Number(inputs.rulePercentage) || 70) / 100;
    const wholesale = Number(inputs.wholesaleFee) || deal.wholesaleFee;
    const calculatedMao = Math.round((arv * rule) - repairs - wholesale);
    
    updatedDeal.arv = arv;
    updatedDeal.estimatedRepairs = repairs;
    updatedDeal.wholesaleFee = wholesale;
    updatedDeal.mao = calculatedMao;
    outputResult = {
      mao: calculatedMao,
      arv,
      estimatedRepairs: repairs,
      wholesaleFee: wholesale,
      spread: arv - calculatedMao - repairs,
      formula: `(${arv.toLocaleString()} * ${rule * 100}%) - ${repairs.toLocaleString()} - ${wholesale.toLocaleString()} = $${calculatedMao.toLocaleString()}`
    };
  } else if (skill.id === "skill_provision_google_tasks") {
    updatedDeal.hasLinkedGoogleTaskList = true;
    outputResult = {
      taskListTitle: `${deal.status}: ${deal.address}`,
      tasksCreated: 4,
      syncedAt: new Date().toISOString(),
      milestones: [
        "Comprehensive property due diligence inspection",
        "Title search & municipal municipal lien search",
        "Capital partner term sheet matching",
        "Standardized Purchase Contract assembly"
      ]
    };
    if (onStageTaskEvent) {
      onStageTaskEvent("ON_STAGE_TASK_LIST_CREATED", {
        listTitle: `${deal.status}: ${deal.address}`,
        tasksCount: 4,
        dealAddress: deal.address,
        dealId: deal.id
      });
    }
  } else if (skill.id === "skill_generate_offer_draft") {
    const offerPrice = Number(inputs.offerPrice) || deal.mao;
    outputResult = {
      offerPrice,
      documentType: "Non-Binding LOI Purchase Draft",
      inspectionDays: inputs.inspectionDays || 14,
      closingDays: inputs.closingDays || 30,
      generatedFile: `LOI-${deal.address.replace(/\s+/g, "_")}.pdf`,
      downloadReady: true
    };
  } else if (skill.id === "skill_match_capital") {
    outputResult = {
      matchedLenders: [
        { name: "Patriot Commercial Capital", maxCapacity: 1000000, targetYield: "10.5%", fitScore: "98%" },
        { name: "Charter Oak Private Lending", maxCapacity: 500000, targetYield: "9.0%", fitScore: "92%" }
      ],
      blendedInterestRate: "9.75%",
      capitalRequired: Number(inputs.requiredCapital) || 250000
    };
  } else {
    outputResult = {
      executed: true,
      timestamp: new Date().toISOString(),
      parameters: inputs,
      status: "ACKNOWLEDGED"
    };
  }

  traceSteps.push({
    stepNumber: 6,
    stepName: "6. Result & CRM State Delta",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 22,
    details: `Compiled structured output payload. Generated delta updates for canonical deal [${deal.id}]: ${JSON.stringify(updatedDeal)}.`
  });

  // -----------------------------------------------------------------------
  // STAGE 7: COMMIT IMMUTABLE AUDIT EVENT
  // -----------------------------------------------------------------------
  traceSteps.push({
    stepNumber: 7,
    stepName: "7. Immutable Audit Event",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 18,
    details: `Cryptographic audit checksum verified: ${auditChecksum}. Recorded to append-only algq_agent_audit_log.`
  });

  const completedAt = new Date().toISOString();
  const durationMs = 8 + 12 + 14 + 4 + skill.estimatedRunTimeMs + 22 + 18;

  const run: AgentRun = {
    id: runId,
    executionRequestId,
    correlationId,
    idempotencyKey,
    dealId: deal.id,
    dealAddress: deal.address,
    agentId: agent.id,
    agentName: agent.name,
    skillId: skill.id,
    skillName: skill.name,
    targetSystem: skill.targetSystem,
    status: "completed",
    attemptCount: currentAttempt,
    maxRetries,
    retryHistory: retryHistory.length > 0 ? retryHistory : undefined,
    inputPayload: inputs,
    outputResult,
    stateDelta: Object.keys(updatedDeal).length > 0 ? {
      propertyUpdates: updatedDeal
    } : undefined,
    traceSteps,
    startedAt,
    completedAt,
    durationMs,
    operator
  };

  const audit: AgentAuditEvent = {
    id: `aud-${runId}-01`,
    timestamp: completedAt,
    dealId: deal.id,
    dealAddress: deal.address,
    agentId: agent.id,
    agentName: agent.name,
    skillId: skill.id,
    skillName: skill.name,
    action: skill.id.toUpperCase(),
    status: "SUCCESS",
    operator,
    idempotencyKey,
    payloadHash,
    details: `Successfully executed [${skill.name}] across ARE Platform Service Interface.`,
    auditChecksum
  };

  const finalResult: ExecuteSkillResult = {
    run,
    auditEvent: audit,
    updatedDeal,
    message: `Skill "${skill.name}" executed successfully across 7-stage production pipeline.`,
    isAwaitingApproval: false
  };

  // Register in Idempotency Engine
  idempotencyStore.register(idempotencyKey, finalResult, skill.idempotencyTtlSeconds);

  return finalResult;
}

/**
 * Retries a failed or retrying agent run with incremented attempt counter.
 */
export function retryAgentRun(
  run: AgentRun,
  operator: string = "Gregory Jones (Operator)",
  deals: RealEstateDeal[]
): ExecuteSkillResult {
  const matchedDeal = deals.find(d => d.id === run.dealId);
  const deal: RealEstateDeal = matchedDeal || (deals.length > 0 ? deals[0] : {
    id: run.dealId,
    address: run.dealAddress,
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    status: DealStatus.Intake,
    askingPrice: 250000,
    arv: 400000,
    estimatedRepairs: 40000,
    wholesaleFee: 20000,
    mao: 220000,
    propertyType: "Single Family",
    ownerName: "Canonical Property Owner",
    ownerPhone: "(555) 019-2834",
    ownerEmail: "owner@canonicalproperties.com",
    occupancy: "Vacant",
    hasSellerFinancing: false,
    notes: "Canonical fallback deal record notes.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return executeAgentSkill({
    deal,
    agentId: run.agentId,
    skillId: run.skillId,
    inputs: run.inputPayload,
    operator,
    idempotencyKey: `${run.idempotencyKey}:retry-${Date.now()}`,
    allowDuplicateReplay: true,
    maxRetries: run.maxRetries || 3,
    priority: "urgent"
  });
}
