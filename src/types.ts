/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FolderCategory {
  Acquisition = "Acquisition Templates",
  Finance = "Finance & Seller-Direct",
  JointVenture = "JV & Capital Raising",
  Management = "Management & Due Diligence"
}

export enum DealStatus {
  Intake = "New Intake",
  DueDiligence = "Due Diligence",
  Underwriting = "Underwriting",
  OfferSubmitted = "Offer Submitted",
  SellerNegotiation = "Seller Negotiation",
  UnderContract = "Under Contract",
  Funded = "Funded & Closed",
  Archived = "Archived"
}

export interface RealEstateDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: "Single Family" | "Multi-Family" | "Commercial" | "Land" | "Mixed-Use";
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  askingPrice: number;
  arv: number; // After Repair Value
  estimatedRepairs: number;
  wholesaleFee: number;
  mao: number; // Maximum Allowable Offer
  status: DealStatus;
  occupancy: "Owner Occupied" | "Tenant Occupied" | "Vacant" | "Abandoned";
  hasSellerFinancing: boolean;
  hasLinkedGoogleTaskList?: boolean;
  sellerFinancingDetails?: {
    downPayment: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    balloonPayment: number;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingSource {
  id: string;
  name: string;
  type: "Private Lender" | "Joint Venture Partner" | "Sponsor Equity" | "Institutional Debt";
  contactPerson: string;
  maxAmount: number;
  targetYield: number;
  status: "Active" | "Inactive" | "Under Discussion";
  activeAllocated: number;
  notes: string;
}

export interface AutomationTrigger {
  id: string;
  title: string;
  event: string; // e.g., "ON_DEAL_INTAKE" or "ON_STATUS_CHANGE_UNDERWRITING"
  actionType: "Email Alert" | "SMS Alert" | "Document Draft" | "CRM Log" | "Webhook";
  recipient: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
}

export interface DocTemplate {
  id: string;
  title: string;
  category: FolderCategory;
  description: string;
  content: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
  completed?: string;
  updated?: string;
  parent?: string;
  position?: string;
  links?: Array<{
    type: string;
    description: string;
    link: string;
  }>;
}

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  due?: string;
  status?: "needsAction" | "completed";
}

export interface StageTaskItemTemplate {
  id: string;
  title: string;
  notesTemplate?: string;
  daysFromNow: number;
}

export interface StageMappingConfig {
  id: string;
  stage: DealStatus;
  enabled: boolean;
  listNamePattern: string; // e.g., "{stage}: {address}" or "{address} - {stage}"
  scope: "per_deal" | "shared_stage_list";
  tasks: StageTaskItemTemplate[];
}

// ==========================================
// ALGONQUIAN ARE AGENT ENGINE ARCHITECTURE
// ==========================================

export type TargetSystem = 
  | "Pipeline CRM" 
  | "MAO Engine" 
  | "Offer Generator" 
  | "Funding Tracker" 
  | "Google Tasks" 
  | "Document Library" 
  | "Escrow & Title";

export type ApprovalPolicy = "none" | "required" | "prohibited_autonomous";

export type AutonomousLevel = "fully_autonomous" | "supervised" | "strict_approval";

export interface SkillParameterSchema {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  targetSystem: TargetSystem;
  allowedDealStates: DealStatus[];
  blockedDealStates?: DealStatus[];
  requiredInputs: SkillParameterSchema[];
  approvalPolicy: ApprovalPolicy;
  idempotencyTtlSeconds: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  estimatedRunTimeMs: number;
}

export interface AgentDefinition {
  id: string;
  name: string;
  codename: string;
  role: string;
  description: string;
  status: "idle" | "active" | "standby" | "paused";
  allowedSkillIds: string[];
  autonomousLevel: AutonomousLevel;
  badgeColor: string;
  iconName: string;
  totalRunsCount: number;
  successRatePercent: number;
  lastActiveTimestamp?: string;
}

export type AgentRunStatus = 
  | "queued" 
  | "running" 
  | "awaiting_approval" 
  | "completed" 
  | "failed" 
  | "retrying" 
  | "rejected" 
  | "cancelled";

export interface AgentRunTraceStep {
  stepNumber: number;
  stepName: string;
  timestamp: string;
  status: "pending" | "success" | "warning" | "error" | "skipped";
  durationMs: number;
  details: string;
  metadata?: Record<string, any>;
}

export interface AgentRun {
  id: string;
  correlationId: string;
  idempotencyKey: string;
  dealId: string;
  dealAddress: string;
  agentId: string;
  agentName: string;
  skillId: string;
  skillName: string;
  targetSystem: TargetSystem;
  status: AgentRunStatus;
  inputPayload: Record<string, any>;
  outputResult?: Record<string, any>;
  errorMessage?: string;
  stateDelta?: {
    previousStatus?: DealStatus;
    newStatus?: DealStatus;
    propertyUpdates?: Record<string, any>;
    generatedAsset?: string;
  };
  approvalTicketId?: string;
  traceSteps: AgentRunTraceStep[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  operator: string;
}

export interface ApprovalTicket {
  id: string;
  runId: string;
  dealId: string;
  dealAddress: string;
  agentId: string;
  agentName: string;
  skillId: string;
  skillName: string;
  severity: "Normal" | "High" | "Critical";
  status: "pending" | "approved" | "rejected";
  summary: string;
  proposedAction: string;
  payloadSnapshot: Record<string, any>;
  riskEvaluation: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface AgentAuditEvent {
  id: string;
  timestamp: string;
  dealId: string;
  dealAddress: string;
  agentId: string;
  agentName: string;
  skillId: string;
  skillName: string;
  action: string;
  status: "SUCCESS" | "FAILED" | "INTERCEPTED_APPROVAL" | "APPROVAL_GRANTED" | "APPROVAL_DENIED" | "STATE_TRANSITION";
  operator: string;
  idempotencyKey: string;
  payloadHash: string;
  details: string;
  auditChecksum: string;
}


