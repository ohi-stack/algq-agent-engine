export type ARESkillRisk = "low" | "medium" | "high" | "critical";
export type ARESkillApproval = "none" | "review_required" | "human_required" | "human_only";
export type ARESkillEffect = "read_only" | "draft" | "operational_write" | "binding_commitment" | "funds_movement";
export type ARESkillServiceStatus = "available" | "candidate" | "planned" | "external";
export type ARESkillExecutionMode = "research" | "recommend" | "draft" | "service_call" | "human_only";

export interface ARESkillParameter {
  name: string;
  type: "string" | "number" | "boolean" | "string[]" | "object";
  required: boolean;
  description: string;
}

export interface ARESkillDefinition {
  id: string;
  version: string;
  name: string;
  agentId: string;
  description: string;
  objective: string;
  serviceId: string;
  operation: string;
  serviceStatus: ARESkillServiceStatus;
  executionMode: ARESkillExecutionMode;
  effect: ARESkillEffect;
  approval: ARESkillApproval;
  risk: ARESkillRisk;
  idempotencyTtlSeconds: number;
  requiredScopes: string[];
  requiredInputs: ARESkillParameter[];
  outputs: string[];
  guardrails: string[];
  successEvent: string;
  failureEvent: string;
}

export interface ARESkillExecutionContext {
  requestId: string;
  correlationId: string;
  dealId?: string;
  relationshipId?: string;
  actorUserId?: string;
  agentId: string;
  skillId: string;
  approvedByUserId?: string;
  approvalId?: string;
}
