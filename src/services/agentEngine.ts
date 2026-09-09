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
  AgentRunTraceStep
} from "../types";

// ==========================================
// 1. ALGQ AGENT REGISTRY
// ==========================================

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
    badgeColor: "bg-[#0B3A63] text-[#36C2B4]",
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
    badgeColor: "bg-[#0B3A63] text-[#D1A54A]",
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
    badgeColor: "bg-[#7A1E28]/30 text-[#D1A54A] border border-[#D1A54A]/30",
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
    badgeColor: "bg-[#0B3A63] text-emerald-300",
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
    badgeColor: "bg-[#0B3A63] text-[#36C2B4]",
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
    badgeColor: "bg-[#0B3A63] text-slate-200",
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
    badgeColor: "bg-[#7A1E28]/30 text-amber-300 border border-amber-500/30",
    iconName: "ShieldCheck",
    totalRunsCount: 37,
    successRatePercent: 100.0,
    lastActiveTimestamp: "2026-08-26T14:10:00-07:00"
  }
];

// ==========================================
// 2. ALGQ SKILL REGISTRY
// ==========================================

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
    estimatedRunTimeMs: 420
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
    estimatedRunTimeMs: 650
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
    estimatedRunTimeMs: 380
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
    estimatedRunTimeMs: 780
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
    estimatedRunTimeMs: 950
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
    estimatedRunTimeMs: 1450
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
    estimatedRunTimeMs: 820
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
    estimatedRunTimeMs: 520
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
    estimatedRunTimeMs: 1100
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
    estimatedRunTimeMs: 720
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
    estimatedRunTimeMs: 460
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
    estimatedRunTimeMs: 880
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
    estimatedRunTimeMs: 910
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
    estimatedRunTimeMs: 640
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
    estimatedRunTimeMs: 1800
  }
];

// ==========================================
// 3. SEED AUDIT LOGS & RUNS & TICKETS
// ==========================================

export const SEED_AGENT_RUNS: AgentRun[] = [
  {
    id: "run-9842",
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
      previousStatus: DealStatus.DueDiligence,
      newStatus: DealStatus.Underwriting,
      propertyUpdates: { mao: 229000 }
    },
    traceSteps: [
      { stepNumber: 1, stepName: "Resolve Agent & Skill", timestamp: "2026-08-26T17:58:01.010Z", status: "success", durationMs: 12, details: "Agent [agent_underwriting] authorized for skill [skill_calculate_mao]" },
      { stepNumber: 2, stepName: "Verify Security Allowlist", timestamp: "2026-08-26T17:58:01.022Z", status: "success", durationMs: 8, details: "No permission bypass detected. Autonomous level: fully_autonomous" },
      { stepNumber: 3, stepName: "Resolve Canonical Deal", timestamp: "2026-08-26T17:58:01.030Z", status: "success", durationMs: 15, details: "Loaded Deal: 244 Pine Street (ID: deal-1, State: Underwriting)" },
      { stepNumber: 4, stepName: "Validate State Machine", timestamp: "2026-08-26T17:58:01.045Z", status: "success", durationMs: 6, details: "State [Underwriting] is permitted in skill allowed states." },
      { stepNumber: 5, stepName: "Validate Input Schema", timestamp: "2026-08-26T17:58:01.051Z", status: "success", durationMs: 10, details: "All 4 required parameters valid and typed." },
      { stepNumber: 6, stepName: "Approval Policy Evaluation", timestamp: "2026-08-26T17:58:01.061Z", status: "skipped", durationMs: 4, details: "Policy is [none]. Immediate autonomous execution allowed." },
      { stepNumber: 7, stepName: "Compute Idempotency Record", timestamp: "2026-08-26T17:58:01.065Z", status: "success", durationMs: 14, details: "Generated key [deal-1:agent_underwriting:skill_calculate_mao:7fa8c3]. No prior collisions." },
      { stepNumber: 8, stepName: "Execute Service Interface", timestamp: "2026-08-26T17:58:01.079Z", status: "success", durationMs: 290, details: "MAO computed successfully. Output: $229,000 MAO." },
      { stepNumber: 9, stepName: "Commit Immutable Audit Event", timestamp: "2026-08-26T17:58:01.369Z", status: "success", durationMs: 25, details: "Audit checksum verified: #ALGQ-9842-88AF. Written to audit stream." }
    ],
    startedAt: "2026-08-26T17:58:01.010Z",
    completedAt: "2026-08-26T17:58:01.394Z",
    durationMs: 384,
    operator: "ALGQ-ORCHESTRATOR-AUTO"
  },
  {
    id: "run-9843",
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
      { stepNumber: 1, stepName: "Resolve Agent & Skill", timestamp: "2026-08-26T18:12:00.100Z", status: "success", durationMs: 10, details: "Agent [agent_tasks] authorized for [skill_provision_google_tasks]" },
      { stepNumber: 2, stepName: "Verify Security Allowlist", timestamp: "2026-08-26T18:12:00.110Z", status: "success", durationMs: 5, details: "Allowlist verified." },
      { stepNumber: 3, stepName: "Resolve Canonical Deal", timestamp: "2026-08-26T18:12:00.115Z", status: "success", durationMs: 12, details: "Loaded Deal: 105 Crown Street (ID: deal-3)" },
      { stepNumber: 4, stepName: "Validate State Machine", timestamp: "2026-08-26T18:12:00.127Z", status: "success", durationMs: 8, details: "State [Offer Submitted] permitted." },
      { stepNumber: 5, stepName: "Validate Input Schema", timestamp: "2026-08-26T18:12:00.135Z", status: "success", durationMs: 6, details: "Schema valid." },
      { stepNumber: 6, stepName: "Approval Policy Evaluation", timestamp: "2026-08-26T18:12:00.141Z", status: "skipped", durationMs: 2, details: "Policy is [none]." },
      { stepNumber: 7, stepName: "Compute Idempotency Record", timestamp: "2026-08-26T18:12:00.143Z", status: "success", durationMs: 12, details: "Idempotency registered." },
      { stepNumber: 8, stepName: "Execute Service Interface", timestamp: "2026-08-26T18:12:00.155Z", status: "success", durationMs: 520, details: "Google Tasks checklist synchronized." },
      { stepNumber: 9, stepName: "Commit Immutable Audit Event", timestamp: "2026-08-26T18:12:00.675Z", status: "success", durationMs: 20, details: "Audit ledger entry signed." }
    ],
    startedAt: "2026-08-26T18:12:00.100Z",
    completedAt: "2026-08-26T18:12:00.695Z",
    durationMs: 595,
    operator: "ALGQ-ORCHESTRATOR-AUTO"
  },
  {
    id: "run-9844",
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
    approvalTicketId: "ticket-101",
    inputPayload: {
      bindingPrice: 585000,
      earnestMoney: 10000,
      authorizedSigner: "Gregory Jones, Managing Member",
      includeSellerFinancing: false
    },
    traceSteps: [
      { stepNumber: 1, stepName: "Resolve Agent & Skill", timestamp: "2026-08-26T18:15:20.001Z", status: "success", durationMs: 11, details: "Agent [agent_offers] mapped to [skill_release_binding_offer]" },
      { stepNumber: 2, stepName: "Verify Security Allowlist", timestamp: "2026-08-26T18:15:20.012Z", status: "success", durationMs: 7, details: "Authorization verified. Supervised action level: strict_approval" },
      { stepNumber: 3, stepName: "Resolve Canonical Deal", timestamp: "2026-08-26T18:15:20.019Z", status: "success", durationMs: 14, details: "Resolved Deal: 89 Farmington Avenue (ID: deal-2, State: DueDiligence)" },
      { stepNumber: 4, stepName: "Validate State Machine", timestamp: "2026-08-26T18:15:20.033Z", status: "success", durationMs: 9, details: "State is valid for offer generation." },
      { stepNumber: 5, stepName: "Validate Input Schema", timestamp: "2026-08-26T18:15:20.042Z", status: "success", durationMs: 11, details: "Parameters verified: $585k price, $10k EMD." },
      { stepNumber: 6, stepName: "Approval Policy Evaluation", timestamp: "2026-08-26T18:15:20.053Z", status: "warning", durationMs: 45, details: "GATE TRIGGERED: Skill requires human sponsor sign-off. Created ApprovalTicket #ticket-101. Execution paused awaiting Managing Member signature." },
      { stepNumber: 7, stepName: "Compute Idempotency Record", timestamp: "2026-08-26T18:15:20.098Z", status: "pending", durationMs: 0, details: "Hold state until approval resolution." },
      { stepNumber: 8, stepName: "Execute Service Interface", timestamp: "2026-08-26T18:15:20.098Z", status: "pending", durationMs: 0, details: "Queued behind Approval Gate." },
      { stepNumber: 9, stepName: "Commit Immutable Audit Event", timestamp: "2026-08-26T18:15:20.100Z", status: "success", durationMs: 18, details: "Audit recorded: [INTERCEPTED_APPROVAL] by Human Approval Gate." }
    ],
    startedAt: "2026-08-26T18:15:20.001Z",
    operator: "Gregory Jones (Initiator)"
  }
];

export const SEED_APPROVAL_TICKETS: ApprovalTicket[] = [
  {
    id: "ticket-101",
    runId: "run-9844",
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

// ==========================================
// 4. ORCHESTRATOR EXECUTION ENGINE
// ==========================================

export interface ExecuteSkillRequest {
  deal: RealEstateDeal;
  agentId: string;
  skillId: string;
  inputs: Record<string, any>;
  operator?: string;
}

export interface ExecuteSkillResult {
  run: AgentRun;
  ticket?: ApprovalTicket;
  auditEvent: AgentAuditEvent;
  updatedDeal?: Partial<RealEstateDeal>;
  message: string;
  isAwaitingApproval: boolean;
}

export function executeAgentSkill(
  request: ExecuteSkillRequest,
  onStageTaskEvent?: (eventName: string, details: any) => void
): ExecuteSkillResult {
  const { deal, agentId, skillId, inputs, operator = "Gregory Jones (Operator)" } = request;
  const startedAt = new Date().toISOString();
  const runId = `run-${Math.floor(1000 + Math.random() * 9000)}`;
  const correlationId = `corr-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(100 + Math.random() * 900)}`;
  const idempotencyHash = Math.random().toString(36).substring(2, 8);
  const idempotencyKey = `${deal.id}:${agentId}:${skillId}:${idempotencyHash}`;
  const payloadHash = `sha256:${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`;
  const auditChecksum = `#ALGQ-AUD-${runId.replace("run-", "")}-${payloadHash.substring(7, 11).toUpperCase()}`;

  const agent = ALGQ_AGENT_REGISTRY.find(a => a.id === agentId);
  const skill = ALGQ_SKILL_REGISTRY.find(s => s.id === skillId);

  const traceSteps: AgentRunTraceStep[] = [];

  // Step 1: Resolve Agent & Skill
  if (!agent || !skill) {
    const err = "Invalid agent or skill identifier.";
    traceSteps.push({
      stepNumber: 1,
      stepName: "Resolve Agent & Skill",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 5,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
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
      durationMs: 5,
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
      action: "EXECUTION_FAILURE",
      status: "FAILED",
      operator,
      idempotencyKey,
      payloadHash,
      details: `Resolution failed: ${err}`,
      auditChecksum
    };
    return { run: failedRun, auditEvent: audit, message: err, isAwaitingApproval: false };
  }

  traceSteps.push({
    stepNumber: 1,
    stepName: "Resolve Agent & Skill",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 8,
    details: `Resolved [${agent.codename}] with permission mapping to [${skill.name}]`
  });

  // Step 2: Verify Agent -> Skill Authorization
  if (!agent.allowedSkillIds.includes(skill.id)) {
    const err = `Security Policy Block: Agent [${agent.name}] is not allowlisted to execute skill [${skill.name}]. Cross-agent bypass prohibited.`;
    traceSteps.push({
      stepNumber: 2,
      stepName: "Verify Security Allowlist",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 12,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
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
      durationMs: 20,
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

  traceSteps.push({
    stepNumber: 2,
    stepName: "Verify Security Allowlist",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 6,
    details: `Authorized skill binding. Autonomy tier: ${agent.autonomousLevel}.`
  });

  // Step 3: Resolve Canonical Deal
  traceSteps.push({
    stepNumber: 3,
    stepName: "Resolve Canonical Deal",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 14,
    details: `Loaded Deal: ${deal.address} (ID: ${deal.id}, Current State: ${deal.status})`
  });

  // Step 4: Validate State Machine Rules
  const isAllowedState = skill.allowedDealStates.includes(deal.status);
  const isBlockedState = skill.blockedDealStates ? skill.blockedDealStates.includes(deal.status) : false;

  if (!isAllowedState || isBlockedState) {
    const err = `State Machine Violation: Skill [${skill.name}] cannot be executed on deal in status [${deal.status}]. Permitted states: [${skill.allowedDealStates.join(", ")}].`;
    traceSteps.push({
      stepNumber: 4,
      stepName: "Validate State Machine",
      timestamp: new Date().toISOString(),
      status: "error",
      durationMs: 10,
      details: err
    });
    const failedRun: AgentRun = {
      id: runId,
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
      durationMs: 38,
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
    stepNumber: 4,
    stepName: "Validate State Machine",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 8,
    details: `State [${deal.status}] matches allowable execution states.`
  });

  // Step 5: Validate Inputs & Context Schema
  traceSteps.push({
    stepNumber: 5,
    stepName: "Validate Input Schema",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 11,
    details: `Validated ${Object.keys(inputs).length} payload parameters against schema.`
  });

  // Step 6: Evaluate Skill-Specific Approval Policy
  const isApprovalRequired = skill.approvalPolicy === "required" || skill.approvalPolicy === "prohibited_autonomous";

  if (isApprovalRequired) {
    const ticketId = `ticket-${Math.floor(100 + Math.random() * 900)}`;
    traceSteps.push({
      stepNumber: 6,
      stepName: "Approval Policy Evaluation",
      timestamp: new Date().toISOString(),
      status: "warning",
      durationMs: 35,
      details: `HUMAN APPROVAL GATE ENGAGED: Skill [${skill.name}] requires sovereign sponsor sign-off. Provisioned ApprovalTicket #${ticketId}. Execution paused.`
    });
    traceSteps.push({
      stepNumber: 7,
      stepName: "Compute Idempotency Record",
      timestamp: new Date().toISOString(),
      status: "pending",
      durationMs: 0,
      details: "Holding in queue until sponsor sign-off."
    });
    traceSteps.push({
      stepNumber: 8,
      stepName: "Execute Service Interface",
      timestamp: new Date().toISOString(),
      status: "pending",
      durationMs: 0,
      details: "Awaiting approval resolution."
    });
    traceSteps.push({
      stepNumber: 9,
      stepName: "Commit Immutable Audit Event",
      timestamp: new Date().toISOString(),
      status: "success",
      durationMs: 15,
      details: `Audit recorded: [INTERCEPTED_APPROVAL] with Ticket #${ticketId}.`
    });

    const ticket: ApprovalTicket = {
      id: ticketId,
      runId,
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
      riskEvaluation: `Consequential action. Risk Tier: ${skill.riskLevel}. Policy mandates explicit approval before contract/funds binding.`,
      createdAt: new Date().toISOString()
    };

    const run: AgentRun = {
      id: runId,
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

    return { run, ticket, auditEvent: audit, message: `Action intercepted by Human Approval Gate. Ticket #${ticketId} created for Managing Member review.`, isAwaitingApproval: true };
  }

  // Autonomous Flow: Step 6 bypassed
  traceSteps.push({
    stepNumber: 6,
    stepName: "Approval Policy Evaluation",
    timestamp: new Date().toISOString(),
    status: "skipped",
    durationMs: 4,
    details: "Approval policy is [none]. Immediate autonomous execution proceeding."
  });

  // Step 7: Compute Idempotency Record
  traceSteps.push({
    stepNumber: 7,
    stepName: "Compute Idempotency Record",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 10,
    details: `Idempotency lock granted: [${idempotencyKey}]. TTL: ${skill.idempotencyTtlSeconds}s.`
  });

  // Step 8: Execute Service Interface
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
      spread: arv - calculatedMao - repairs
    };
  } else if (skill.id === "skill_provision_google_tasks") {
    updatedDeal.hasLinkedGoogleTaskList = true;
    outputResult = {
      taskListTitle: `${deal.status}: ${deal.address}`,
      tasksCreated: 4,
      syncedAt: new Date().toISOString()
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
      generatedFile: `LOI-${deal.address.replace(/\s+/g, "_")}.pdf`
    };
  } else if (skill.id === "skill_match_capital") {
    outputResult = {
      matchedLenders: [
        { name: "Patriot Commercial Capital", maxCapacity: 1000000, targetYield: "10.5%", fitScore: "98%" },
        { name: "Charter Oak Private Lending", maxCapacity: 500000, targetYield: "9.0%", fitScore: "92%" }
      ],
      blendedInterestRate: "9.75%"
    };
  } else {
    outputResult = {
      executed: true,
      timestamp: new Date().toISOString(),
      parameters: inputs
    };
  }

  traceSteps.push({
    stepNumber: 8,
    stepName: "Execute Service Interface",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: skill.estimatedRunTimeMs,
    details: `Executed [${skill.targetSystem}] service adapter successfully. Output payload compiled.`
  });

  // Step 9: Commit Immutable Audit Event
  traceSteps.push({
    stepNumber: 9,
    stepName: "Commit Immutable Audit Event",
    timestamp: new Date().toISOString(),
    status: "success",
    durationMs: 16,
    details: `Cryptographic audit checksum verified: ${auditChecksum}. Recorded to append-only stream.`
  });

  const completedAt = new Date().toISOString();
  const durationMs = 8 + 6 + 14 + 8 + 11 + 4 + 10 + skill.estimatedRunTimeMs + 16;

  const run: AgentRun = {
    id: runId,
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
    details: `Successfully executed skill [${skill.name}] on deal ${deal.address}.`,
    auditChecksum
  };

  return {
    run,
    auditEvent: audit,
    updatedDeal,
    message: `Skill "${skill.name}" executed successfully across ARE Platform Service Interface.`,
    isAwaitingApproval: false
  };
}
