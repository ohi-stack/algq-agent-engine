/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  RealEstateDeal, 
  AgentDefinition, 
  SkillDefinition, 
  AgentRun, 
  ApprovalTicket, 
  AgentAuditEvent, 
  DealStatus,
  TargetSystem
} from "../types";
import { 
  ALGQ_AGENT_REGISTRY, 
  ALGQ_SKILL_REGISTRY, 
  executeAgentSkill 
} from "../services/agentEngine";
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Play, 
  RefreshCw, 
  Search, 
  Filter, 
  FileText, 
  AlertTriangle, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  Hash, 
  ExternalLink, 
  Building2, 
  Landmark, 
  FolderKanban, 
  Calculator, 
  FileSignature, 
  CheckSquare, 
  BookOpen, 
  Check, 
  ArrowRight, 
  Download, 
  Copy, 
  Activity
} from "lucide-react";

interface AgentEngineSectionProps {
  deals: RealEstateDeal[];
  onUpdateDealStatus: (id: string, newStatus: DealStatus) => void;
  onUpdateDealDetails: (id: string, updatedFields: Partial<RealEstateDeal>) => void;
  triggerSystemEvent?: (eventName: string, details: any) => void;
}

export const AgentEngineSection: React.FC<AgentEngineSectionProps> = ({
  deals,
  onUpdateDealStatus,
  onUpdateDealDetails,
  triggerSystemEvent
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "dispatch" | "approvals" | "runs" | "skills" | "agents" | "audit">("dispatch");

  // Stateful registries and repositories
  const [agents, setAgents] = useState<AgentDefinition[]>(ALGQ_AGENT_REGISTRY);
  const [skills] = useState<SkillDefinition[]>(ALGQ_SKILL_REGISTRY);
  const [runs, setRuns] = useState<AgentRun[]>(() => {
    // Initial runs
    return [
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
          formula: "($420,000 * 0.70) - $45,000 - $20,000 = $229,000"
        },
        stateDelta: {
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
        inputPayload: { syncDueDates: true, priorityLevel: "High" },
        outputResult: { taskListTitle: "Offer Submitted: 105 Crown Street", tasksCreated: 4 },
        traceSteps: [
          { stepNumber: 1, stepName: "Resolve Agent & Skill", timestamp: "2026-08-26T18:12:00.100Z", status: "success", durationMs: 10, details: "Agent [agent_tasks] authorized" },
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
  });

  const [approvalTickets, setApprovalTickets] = useState<ApprovalTicket[]>([
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
  ]);

  const [auditLogs, setAuditLogs] = useState<AgentAuditEvent[]>([
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
  ]);

  // Dispatch Workbench State
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(ALGQ_AGENT_REGISTRY[1]?.id || "");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("skill_calculate_mao");
  const [dispatchInputs, setDispatchInputs] = useState<Record<string, any>>({
    arv: 420000,
    estimatedRepairs: 45000,
    rulePercentage: 70,
    wholesaleFee: 20000
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<{ text: string; type: "success" | "warning" | "error" } | null>(null);

  // Inspector States
  const [selectedRunForTrace, setSelectedRunForTrace] = useState<AgentRun | null>(null);
  const [selectedTicketForReview, setSelectedTicketForReview] = useState<ApprovalTicket | null>(null);
  const [searchRunQuery, setSearchRunQuery] = useState("");
  const [filterRunStatus, setFilterRunStatus] = useState<string>("all");

  const selectedDeal = deals.find(d => d.id === selectedDealId) || deals[0];
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  const pendingApprovalsCount = approvalTickets.filter(t => t.status === "pending").length;

  // Handle Agent Selection Change -> filter skill options
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent && agent.allowedSkillIds.length > 0) {
      const firstSkillId = agent.allowedSkillIds[0];
      setSelectedSkillId(firstSkillId);
      const skillDef = skills.find(s => s.id === firstSkillId);
      if (skillDef) {
        initSkillInputs(skillDef, selectedDeal);
      }
    }
  };

  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    const skillDef = skills.find(s => s.id === skillId);
    if (skillDef) {
      initSkillInputs(skillDef, selectedDeal);
    }
  };

  const initSkillInputs = (skillDef: SkillDefinition, deal?: RealEstateDeal) => {
    const initial: Record<string, any> = {};
    skillDef.requiredInputs.forEach(input => {
      if (input.name === "arv" && deal) initial[input.name] = deal.arv || 420000;
      else if (input.name === "estimatedRepairs" && deal) initial[input.name] = deal.estimatedRepairs || 45000;
      else if (input.name === "askingPrice" && deal) initial[input.name] = deal.askingPrice || 250000;
      else if (input.name === "offerPrice" && deal) initial[input.name] = deal.mao || 229000;
      else if (input.name === "bindingPrice" && deal) initial[input.name] = deal.mao || 229000;
      else if (input.name === "address" && deal) initial[input.name] = deal.address;
      else if (input.defaultValue !== undefined) initial[input.name] = input.defaultValue;
      else initial[input.name] = input.type === "number" ? 0 : input.type === "boolean" ? false : "";
    });
    setDispatchInputs(initial);
  };

  // Dispatch Action
  const handleDispatchRun = () => {
    if (!selectedDeal || !selectedAgent || !selectedSkill) return;

    setIsExecuting(true);
    setExecutionMessage(null);

    setTimeout(() => {
      const result = executeAgentSkill({
        deal: selectedDeal,
        agentId: selectedAgent.id,
        skillId: selectedSkill.id,
        inputs: dispatchInputs,
        operator: "Gregory Jones (Managing Member)"
      }, triggerSystemEvent);

      setRuns(prev => [result.run, ...prev]);
      setAuditLogs(prev => [result.auditEvent, ...prev]);

      if (result.ticket) {
        setApprovalTickets(prev => [result.ticket!, ...prev]);
        setExecutionMessage({
          text: result.message,
          type: "warning"
        });
      } else {
        if (result.updatedDeal) {
          onUpdateDealDetails(selectedDeal.id, result.updatedDeal);
        }
        setExecutionMessage({
          text: result.message,
          type: "success"
        });
      }

      // Update agent stats
      setAgents(prev => prev.map(a => {
        if (a.id === selectedAgent.id) {
          return {
            ...a,
            totalRunsCount: a.totalRunsCount + 1,
            lastActiveTimestamp: new Date().toISOString()
          };
        }
        return a;
      }));

      setSelectedRunForTrace(result.run);
      setIsExecuting(false);
    }, 450);
  };

  // Handle Approval Action
  const handleApproveTicket = (ticket: ApprovalTicket) => {
    const updatedTicket: ApprovalTicket = {
      ...ticket,
      status: "approved",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Gregory Jones, Managing Member",
      notes: "Executed under sovereign authority."
    };

    setApprovalTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));

    // Update target run
    const targetRun = runs.find(r => r.id === ticket.runId);
    if (targetRun) {
      const completedSteps = targetRun.traceSteps.map(step => {
        if (step.status === "pending" || step.status === "warning") {
          return {
            ...step,
            status: "success" as const,
            details: `Approved by Gregory Jones: ${step.details}`
          };
        }
        return step;
      });

      const updatedRun: AgentRun = {
        ...targetRun,
        status: "completed",
        completedAt: new Date().toISOString(),
        durationMs: (targetRun.durationMs || 100) + 1200,
        outputResult: {
          authorized: true,
          authorizedBy: "Gregory Jones",
          contractStatus: "TRANSMITTED_SIGNED",
          timestamp: new Date().toISOString()
        },
        traceSteps: completedSteps
      };

      setRuns(prev => prev.map(r => r.id === targetRun.id ? updatedRun : r));
    }

    // Add Audit Record
    const audit: AgentAuditEvent = {
      id: `aud-${ticket.id}-APPRV`,
      timestamp: new Date().toISOString(),
      dealId: ticket.dealId,
      dealAddress: ticket.dealAddress,
      agentId: ticket.agentId,
      agentName: ticket.agentName,
      skillId: ticket.skillId,
      skillName: ticket.skillName,
      action: "APPROVAL_GRANTED",
      status: "APPROVAL_GRANTED",
      operator: "Gregory Jones (Managing Member)",
      idempotencyKey: `apprv:${ticket.id}:${Date.now()}`,
      payloadHash: `sha256:apprv_${ticket.id}`,
      details: `Managing Member approved and executed ticket #${ticket.id} (${ticket.summary}).`,
      auditChecksum: `#ALGQ-SIGN-GJONES-${ticket.id.toUpperCase()}`
    };

    setAuditLogs(prev => [audit, ...prev]);

    if (triggerSystemEvent) {
      triggerSystemEvent("ON_AGENT_APPROVAL_GRANTED", {
        ticketId: ticket.id,
        skillName: ticket.skillName,
        dealAddress: ticket.dealAddress
      });
    }

    setSelectedTicketForReview(null);
  };

  const handleRejectTicket = (ticket: ApprovalTicket, reason: string) => {
    const updatedTicket: ApprovalTicket = {
      ...ticket,
      status: "rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Gregory Jones, Managing Member",
      rejectionReason: reason || "Sponsor rejected terms after risk assessment."
    };

    setApprovalTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));

    // Update target run
    const targetRun = runs.find(r => r.id === ticket.runId);
    if (targetRun) {
      const updatedRun: AgentRun = {
        ...targetRun,
        status: "rejected",
        errorMessage: `Rejected by Managing Member: ${reason || "Sponsor rejected terms."}`,
        completedAt: new Date().toISOString()
      };
      setRuns(prev => prev.map(r => r.id === targetRun.id ? updatedRun : r));
    }

    const audit: AgentAuditEvent = {
      id: `aud-${ticket.id}-REJ`,
      timestamp: new Date().toISOString(),
      dealId: ticket.dealId,
      dealAddress: ticket.dealAddress,
      agentId: ticket.agentId,
      agentName: ticket.agentName,
      skillId: ticket.skillId,
      skillName: ticket.skillName,
      action: "APPROVAL_DENIED",
      status: "APPROVAL_DENIED",
      operator: "Gregory Jones (Managing Member)",
      idempotencyKey: `rej:${ticket.id}:${Date.now()}`,
      payloadHash: `sha256:rej_${ticket.id}`,
      details: `Rejected ticket #${ticket.id}. Stated Reason: ${reason || "Terms rejected."}`,
      auditChecksum: `#ALGQ-REJ-GJONES-${ticket.id.toUpperCase()}`
    };

    setAuditLogs(prev => [audit, ...prev]);
    setSelectedTicketForReview(null);
  };

  // Filtered runs
  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.dealAddress.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.agentName.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.skillName.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchRunQuery.toLowerCase());

    const matchesStatus = filterRunStatus === "all" || run.status === filterRunStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="algq-agent-engine-section">
      {/* 1. Header & System Status HUD */}
      <div className="bg-[#0B1F33] text-white rounded-xl p-6 border border-[#071522] shadow-xl relative overflow-hidden" id="agent-engine-header">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#0B3A63]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#0B3A63] border border-[#D1A54A]/40 flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 text-[#D1A54A]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  Algonquian ARE Agent Engine
                  <span className="text-[10px] font-mono uppercase bg-[#0B3A63] text-[#36C2B4] px-2 py-0.5 rounded border border-[#36C2B4]/30 font-bold">
                    v2.5 Enterprise
                  </span>
                </h1>
                <p className="text-xs text-[#5E6B78]">
                  Autonomous & Supervised Multi-Agent Real Estate Orchestration Infrastructure
                </p>
              </div>
            </div>
          </div>

          {/* HUD KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0E192D] p-3 rounded-lg border border-slate-800">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#5E6B78] block">Agents Online</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-[#36C2B4] animate-pulse" />
                <span className="text-lg font-mono font-bold text-white">{agents.length} Active</span>
              </div>
            </div>

            <div className="bg-[#0E192D] p-3 rounded-lg border border-slate-800">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#5E6B78] block">Skill Registry</span>
              <span className="text-lg font-mono font-bold text-white">{skills.length} Allowlisted</span>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${
              pendingApprovalsCount > 0 
                ? "bg-[#7A1E28]/30 border-[#D1A54A]/50 text-[#D1A54A]" 
                : "bg-[#0E192D] border-slate-800 text-white"
            }`}>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#5E6B78] block">Approval Gate</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-lg font-mono font-bold text-[#D1A54A]">
                  {pendingApprovalsCount} Pending
                </span>
                {pendingApprovalsCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-[#D1A54A] animate-ping" />
                )}
              </div>
            </div>

            <div className="bg-[#0E192D] p-3 rounded-lg border border-slate-800">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#5E6B78] block">Audit Integrity</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-4 w-4 text-[#36C2B4]" />
                <span className="text-xs font-mono font-bold text-[#36C2B4]">Signed & Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engine Navigation Subtabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "dispatch"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Interactive Dispatch Console</span>
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "approvals"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Human Approval Gate</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#7A1E28] text-white text-[10px] font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("runs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "runs"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Live Run Repository ({runs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "agents"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Agent Registry</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "skills"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Skill Matrix & State Rules</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0E192D] text-[#5E6B78] hover:text-white hover:bg-[#0B3A63]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Immutable Audit Stream</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTAB: INTERACTIVE DISPATCH WORKBENCH */}
      {activeTab === "dispatch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dispatch-workbench-view">
          {/* Left Column: Target Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-[#071522] flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#0B3A63]" />
                  Orchestrator Execution Dispatcher
                </h3>
                <span className="text-[10px] font-mono text-[#5E6B78] bg-slate-100 px-2 py-0.5 rounded">
                  9-Step Safe Pipeline
                </span>
              </div>

              {/* 1. Target Deal Selection */}
              <div>
                <label className="text-xs font-bold text-[#071522] block mb-1.5">
                  1. Select Target Property from Pipeline CRM
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => {
                    setSelectedDealId(e.target.value);
                    const deal = deals.find(d => d.id === e.target.value);
                    if (deal && selectedSkill) {
                      initSkillInputs(selectedSkill, deal);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-[#071522] font-medium focus:ring-2 focus:ring-[#0B3A63] focus:bg-white outline-none"
                >
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.address} — {deal.city}, {deal.state} [{deal.status}] (Asking: ${deal.askingPrice.toLocaleString()})
                    </option>
                  ))}
                </select>
                {selectedDeal && (
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#5E6B78] text-[10px] uppercase font-mono block">Current State</span>
                      <span className="font-bold text-[#0B3A63]">{selectedDeal.status}</span>
                    </div>
                    <div>
                      <span className="text-[#5E6B78] text-[10px] uppercase font-mono block">Target ARV</span>
                      <span className="font-bold text-[#071522]">${selectedDeal.arv.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#5E6B78] text-[10px] uppercase font-mono block">Repairs</span>
                      <span className="font-bold text-[#071522]">${selectedDeal.estimatedRepairs.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#5E6B78] text-[10px] uppercase font-mono block">Active MAO</span>
                      <span className="font-bold text-emerald-700">${selectedDeal.mao.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Select Authorized Agent */}
              <div>
                <label className="text-xs font-bold text-[#071522] block mb-1.5">
                  2. Select Authorized Autonomous Agent
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agents.map(agent => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleAgentSelect(agent.id)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#0B3A63] text-white border-[#0B3A63] shadow-md ring-2 ring-[#D1A54A]"
                            : "bg-slate-50 border-slate-200 text-[#071522] hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{agent.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                            {agent.codename}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? "text-slate-200" : "text-[#5E6B78]"}`}>
                          {agent.role}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Select Allowlisted Skill */}
              {selectedAgent && (
                <div>
                  <label className="text-xs font-bold text-[#071522] block mb-1.5">
                    3. Select Allowlisted Skill for [{selectedAgent.name}]
                  </label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => handleSkillSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-[#071522] font-medium focus:ring-2 focus:ring-[#0B3A63] focus:bg-white outline-none"
                  >
                    {skills
                      .filter(s => selectedAgent.allowedSkillIds.includes(s.id))
                      .map(skill => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name} → Target: {skill.targetSystem} [{skill.approvalPolicy === "none" ? "Autonomous" : "Approval Gate Required"}]
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* 4. Dynamic Parameter Schema Inputs */}
              {selectedSkill && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-[#071522]">
                      Payload Input Parameters ({selectedSkill.requiredInputs.length})
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      selectedSkill.riskLevel === "Critical" ? "bg-red-100 text-red-700 border border-red-200" :
                      selectedSkill.riskLevel === "High" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      Risk Tier: {selectedSkill.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-[#5E6B78]">{selectedSkill.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {selectedSkill.requiredInputs.map(param => (
                      <div key={param.name}>
                        <label className="text-[11px] font-semibold text-[#071522] block mb-1">
                          {param.label} {param.required && <span className="text-red-500">*</span>}
                        </label>
                        {param.type === "select" ? (
                          <select
                            value={dispatchInputs[param.name] ?? param.defaultValue}
                            onChange={(e) => setDispatchInputs(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-[#071522]"
                          >
                            {param.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : param.type === "boolean" ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="checkbox"
                              id={`param-${param.name}`}
                              checked={!!dispatchInputs[param.name]}
                              onChange={(e) => setDispatchInputs(prev => ({ ...prev, [param.name]: e.target.checked }))}
                              className="h-4 w-4 text-[#0B3A63] rounded border-slate-300"
                            />
                            <label htmlFor={`param-${param.name}`} className="text-xs text-[#5E6B78]">
                              Enable verification
                            </label>
                          </div>
                        ) : (
                          <input
                            type={param.type === "number" ? "number" : "text"}
                            value={dispatchInputs[param.name] ?? ""}
                            onChange={(e) => setDispatchInputs(prev => ({
                              ...prev,
                              [param.name]: param.type === "number" ? Number(e.target.value) : e.target.value
                            }))}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-[#071522]"
                          />
                        )}
                        <span className="text-[10px] text-[#5E6B78] block mt-0.5">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execution Feedback Notification */}
              {executionMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  executionMessage.type === "success" 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                    : executionMessage.type === "warning"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {executionMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                  <span>{executionMessage.text}</span>
                </div>
              )}

              {/* Primary Trigger Button */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={handleDispatchRun}
                className="w-full bg-[#0B3A63] hover:bg-[#071522] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#D1A54A]" />
                    <span>Executing 9-Step Orchestrator Lifecycle...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 text-[#D1A54A]" />
                    <span>Dispatch Agent Skill Execution ({selectedSkill?.name})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: 9-Step Orchestrator LifeCycle Visualizer & Recent Trace */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B1F33] text-white rounded-xl p-6 border border-[#071522] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#36C2B4]" />
                  Orchestrator 9-Step Control Flow
                </h3>
                <span className="text-[10px] font-mono text-[#D1A54A] bg-[#0E192D] px-2 py-0.5 rounded border border-[#D1A54A]/30">
                  ALGQ Standard
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { n: 1, name: "Resolve Agent & Skill", desc: "Maps identity & verified permissions" },
                  { n: 2, name: "Verify Security Allowlist", desc: "Guarantees no cross-agent bypass" },
                  { n: 3, name: "Resolve Canonical Deal", desc: "Loads deal from CRM by UUID" },
                  { n: 4, name: "Validate State Machine", desc: "Checks allowed vs blocked states" },
                  { n: 5, name: "Validate Input Schema", desc: "Strict type & parameter checks" },
                  { n: 6, name: "Evaluate Approval Policy", desc: "Intercepts high-risk actions to Gate" },
                  { n: 7, name: "Compute Idempotency Record", desc: "Guarantees duplicate-safe execution" },
                  { n: 8, name: "Execute Service Interface", desc: "Calls CRM, MAO, Offers, Tasks, Docs" },
                  { n: 9, name: "Commit Immutable Audit Event", desc: "Signs cryptographic audit ledger" }
                ].map(step => (
                  <div 
                    key={step.n}
                    className="p-2.5 rounded-lg bg-[#0E192D] border border-slate-800 flex items-start gap-3"
                  >
                    <span className="h-5 w-5 rounded bg-[#0B3A63] text-[#D1A54A] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-white block text-xs">{step.name}</span>
                      <span className="text-[10px] text-[#5E6B78]">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trace Inspector */}
            {selectedRunForTrace && (
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs text-[#071522] flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#0B3A63]" />
                    Latest Execution Trace (#{selectedRunForTrace.id})
                  </h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedRunForTrace.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                    selectedRunForTrace.status === "awaiting_approval" ? "bg-amber-100 text-amber-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {selectedRunForTrace.status}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {selectedRunForTrace.traceSteps.map((step) => (
                    <div key={step.stepNumber} className="text-xs p-2 rounded bg-slate-50 border border-slate-200 flex items-start gap-2">
                      {step.status === "success" && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                      {step.status === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />}
                      {step.status === "error" && <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />}
                      {step.status === "skipped" && <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />}
                      {step.status === "pending" && <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#071522] text-[11px]">{step.stepNumber}. {step.stepName}</span>
                          <span className="text-[9px] font-mono text-[#5E6B78]">{step.durationMs}ms</span>
                        </div>
                        <p className="text-[10px] text-[#5E6B78] mt-0.5">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: HUMAN APPROVAL GATE */}
      {activeTab === "approvals" && (
        <div className="space-y-6" id="approvals-gate-view">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-sm text-[#071522] flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#D1A54A]" />
                  Human-in-the-Loop Sponsor Approval Queue
                </h3>
                <p className="text-xs text-[#5E6B78]">
                  High-consequence real estate actions intercepted for Managing Member sign-off
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs rounded-full">
                {approvalTickets.filter(t => t.status === "pending").length} Actionable Tickets
              </span>
            </div>

            {approvalTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-[#5E6B78] font-medium">No pending tickets in the approval gate.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {approvalTickets.map((ticket) => {
                  const isPending = ticket.status === "pending";
                  return (
                    <div 
                      key={ticket.id}
                      className={`rounded-xl p-5 border transition-all ${
                        isPending 
                          ? "bg-white border-[#D1A54A]/60 shadow-md ring-1 ring-[#D1A54A]/30" 
                          : "bg-slate-50 border-slate-200 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#0B3A63] text-white font-mono text-[10px] font-bold rounded">
                              {ticket.id}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              ticket.severity === "Critical" ? "bg-red-100 text-red-800 border border-red-200" :
                              "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {ticket.severity} Severity
                            </span>
                            <span className="text-xs font-bold text-[#071522]">
                              {ticket.skillName}
                            </span>
                            <span className="text-xs text-[#5E6B78]">
                              on <strong className="text-[#071522]">{ticket.dealAddress}</strong>
                            </span>
                          </div>

                          <p className="text-xs text-[#071522] font-semibold">{ticket.summary}</p>
                          <p className="text-xs text-[#5E6B78] bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                            {ticket.proposedAction}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#5E6B78]">
                            <span>Agent: <strong className="text-[#071522]">{ticket.agentName}</strong></span>
                            <span>Created: <strong className="text-[#071522]">{new Date(ticket.createdAt).toLocaleTimeString()}</strong></span>
                            {ticket.reviewedBy && (
                              <span>Reviewed By: <strong className="text-[#0B3A63]">{ticket.reviewedBy}</strong></span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                          {isPending ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveTicket(ticket)}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve & Sign</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectTicket(ticket, "Managing Member terms mismatch")}
                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-center uppercase ${
                              ticket.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {ticket.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SUBTAB: LIVE RUN REPOSITORY */}
      {activeTab === "runs" && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4" id="runs-repository-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-sm text-[#071522] flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#0B3A63]" />
                Live Agent Run Repository
              </h3>
              <p className="text-xs text-[#5E6B78]">
                Deterministic execution logs with correlation tracking and millisecond-level step traces
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by deal, agent, skill..."
                  value={searchRunQuery}
                  onChange={(e) => setSearchRunQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#071522] outline-none focus:ring-1 focus:ring-[#0B3A63]"
                />
              </div>

              <select
                value={filterRunStatus}
                onChange={(e) => setFilterRunStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-[#071522] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="awaiting_approval">Awaiting Approval</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[#5E6B78] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Run ID / Correlation</th>
                  <th className="py-2.5 px-3">Target Deal</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Skill & System</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-[#0B3A63] block">{run.id}</span>
                      <span className="text-[10px] text-[#5E6B78]">{run.correlationId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#071522] block">{run.dealAddress}</span>
                      <span className="text-[10px] text-[#5E6B78]">ID: {run.dealId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-[#071522]">{run.agentName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#071522] block">{run.skillName}</span>
                      <span className="text-[10px] text-[#5E6B78] font-mono">{run.targetSystem}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        run.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                        run.status === "awaiting_approval" ? "bg-amber-100 text-amber-800" :
                        run.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#5E6B78]">
                      {run.durationMs ? `${run.durationMs}ms` : "—"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRunForTrace(run)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#0B3A63] hover:text-white rounded text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        Inspect Trace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: AGENT REGISTRY */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="agent-registry-view">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-mono font-bold text-[#5E6B78] bg-slate-100 px-2 py-0.5 rounded">
                    {agent.codename}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-[#071522]">{agent.name}</h4>
                <p className="text-xs text-[#5E6B78]">{agent.description}</p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-mono text-[#5E6B78] block font-bold">
                    Allowlisted Skills ({agent.allowedSkillIds.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agent.allowedSkillIds.map(skId => {
                      const sk = skills.find(s => s.id === skId);
                      return (
                        <span key={skId} className="text-[10px] bg-slate-100 text-[#0B3A63] font-mono px-2 py-0.5 rounded">
                          {sk?.name || skId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-[#5E6B78] uppercase font-mono block">Total Runs</span>
                  <span className="font-bold text-[#071522] font-mono">{agent.totalRunsCount}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#5E6B78] uppercase font-mono block">Success Rate</span>
                  <span className="font-bold text-emerald-700 font-mono">{agent.successRatePercent}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#5E6B78] uppercase font-mono block">Autonomy</span>
                  <span className="font-mono text-[10px] text-[#0B3A63] font-bold">
                    {agent.autonomousLevel === "strict_approval" ? "SUPERVISED" : "AUTONOMOUS"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. SUBTAB: SKILL MATRIX & STATE RULES */}
      {activeTab === "skills" && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4" id="skill-matrix-view">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#071522]">
              Algonquian ARE Skill Registry & State Machine Matrix
            </h3>
            <p className="text-xs text-[#5E6B78]">
              Authorized skill execution rules, target application adapters, allowed deal states, and approval policies
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[#5E6B78] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Skill Identifier</th>
                  <th className="py-2.5 px-3">Target System</th>
                  <th className="py-2.5 px-3">Allowed Deal States</th>
                  <th className="py-2.5 px-3">Approval Policy</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Idempotency TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#071522] block">{skill.name}</span>
                      <span className="text-[10px] text-[#5E6B78] font-mono">{skill.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#0B3A63]">{skill.targetSystem}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {skill.allowedDealStates.map(state => (
                          <span key={state} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] rounded font-medium">
                            {state}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        skill.approvalPolicy === "required" 
                          ? "bg-amber-100 text-amber-900 border border-amber-200" 
                          : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      }`}>
                        {skill.approvalPolicy === "required" ? "Gate Sign-Off" : "Autonomous"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] font-bold ${
                        skill.riskLevel === "Critical" ? "text-red-700" :
                        skill.riskLevel === "High" ? "text-amber-700" : "text-emerald-700"
                      }`}>
                        {skill.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#5E6B78]">
                      {skill.idempotencyTtlSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SUBTAB: IMMUTABLE AUDIT STREAM */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4" id="immutable-audit-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-sm text-[#071522] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0B3A63]" />
                Immutable Append-Only Audit Stream (`algq_agent_audit_log`)
              </h3>
              <p className="text-xs text-[#5E6B78]">
                Cryptographically checksummed log of all agent runs, security checks, state updates, and human approvals
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `algq_agent_audit_stream_${Date.now()}.json`;
                a.click();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-[#0B3A63] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Ledger</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] bg-[#0B3A63] text-white px-2 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      log.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" :
                      log.status === "INTERCEPTED_APPROVAL" ? "bg-amber-100 text-amber-800" :
                      log.status === "APPROVAL_GRANTED" ? "bg-emerald-100 text-emerald-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-semibold text-[#071522]">
                      {log.dealAddress}
                    </span>
                  </div>

                  <p className="text-xs text-[#071522]">{log.details}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-[#5E6B78]">
                    <span>Agent: {log.agentName}</span>
                    <span>Operator: {log.operator}</span>
                    <span>Checksum: <strong className="text-[#0B3A63]">{log.auditChecksum}</strong></span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-[#5E6B78] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
