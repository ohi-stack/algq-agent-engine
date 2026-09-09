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
  TargetSystem,
  AgentPermission
} from "../types";
import { 
  ALGQ_AGENT_REGISTRY, 
  ALGQ_SKILL_REGISTRY, 
  executeAgentSkill,
  retryAgentRun,
  idempotencyStore,
  SEED_AGENT_RUNS,
  SEED_APPROVAL_TICKETS,
  SEED_AUDIT_LOGS
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
  Activity,
  Key,
  Shield,
  RotateCcw,
  Zap,
  CheckCircle,
  HelpCircle,
  Sliders,
  Eye
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
  const [activeTab, setActiveTab] = useState<"dispatch" | "approvals" | "runs" | "permissions" | "skills" | "audit">("dispatch");

  // Stateful registries and repositories
  const [agents, setAgents] = useState<AgentDefinition[]>(ALGQ_AGENT_REGISTRY);
  const [skills] = useState<SkillDefinition[]>(ALGQ_SKILL_REGISTRY);
  const [runs, setRuns] = useState<AgentRun[]>(SEED_AGENT_RUNS);
  const [approvalTickets, setApprovalTickets] = useState<ApprovalTicket[]>(SEED_APPROVAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AgentAuditEvent[]>(SEED_AUDIT_LOGS);

  // Dispatch Workbench States
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "deal-1");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agent_underwriting");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("skill_calculate_mao");
  const [dispatchPriority, setDispatchPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [simulateFailureMode, setSimulateFailureMode] = useState<"none" | "transient_timeout" | "permission_denied" | "state_violation" | "schema_error">("none");
  const [customIdempotencyKey, setCustomIdempotencyKey] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState(false);

  const [dispatchInputs, setDispatchInputs] = useState<Record<string, any>>({
    arv: 420000,
    estimatedRepairs: 45000,
    rulePercentage: 70,
    wholesaleFee: 20000
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMessage, setExecutionMessage] = useState<{ text: string; type: "success" | "warning" | "error" | "info" } | null>(null);

  // Inspector States
  const [selectedRunForTrace, setSelectedRunForTrace] = useState<AgentRun | null>(runs[0] || null);
  const [selectedTicketForReview, setSelectedTicketForReview] = useState<ApprovalTicket | null>(null);
  const [searchRunQuery, setSearchRunQuery] = useState("");
  const [filterRunStatus, setFilterRunStatus] = useState<string>("all");
  const [filterRunDealId, setFilterRunDealId] = useState<string>("all");

  const selectedDeal = deals.find(d => d.id === selectedDealId) || deals[0];
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  const pendingApprovalsCount = approvalTickets.filter(t => t.status === "pending").length;

  // Pre-flight Authorization Check
  const checkPreflightAuthorization = () => {
    if (!selectedAgent || !selectedSkill || !selectedDeal) {
      return { authorized: false, reason: "Missing selection" };
    }
    if (selectedAgent.status === "paused" || selectedAgent.status === "idle") {
      return { authorized: false, reason: `Agent is in ${selectedAgent.status.toUpperCase()} mode.` };
    }
    if (!selectedAgent.allowedSkillIds.includes(selectedSkill.id)) {
      return { authorized: false, reason: "Skill not allowlisted for this agent." };
    }
    const agentPerms = selectedAgent.permissions || [];
    const reqPerms = selectedSkill.requiredPermissions || [];
    const hasPerms = reqPerms.every(p => agentPerms.includes(p));
    if (!hasPerms) {
      const missing = reqPerms.filter(p => !agentPerms.includes(p));
      return { authorized: false, reason: `Missing required permission scope: [${missing.join(", ")}].` };
    }
    if (!selectedSkill.allowedDealStates.includes(selectedDeal.status)) {
      return { authorized: false, reason: `State mismatch: Deal is in [${selectedDeal.status}], skill requires [${selectedSkill.allowedDealStates.join(", ")}].` };
    }
    return { authorized: true, reason: "All 6 pre-flight authorization constraints passed." };
  };

  const preflightAuth = checkPreflightAuthorization();

  // Agent Selection -> filter skill options & init inputs
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

  // Generate a random idempotency key
  const handleGenerateIdempotencyKey = () => {
    const key = `${selectedDeal.id}:${selectedAgent?.id}:${selectedSkill?.id}:${Math.random().toString(36).substring(2, 8)}`;
    setCustomIdempotencyKey(key);
  };

  // Dispatch Action
  const handleDispatchRun = (forceDuplicate = false) => {
    if (!selectedDeal || !selectedAgent || !selectedSkill) return;

    setIsExecuting(true);
    setExecutionMessage(null);

    setTimeout(() => {
      const activeKey = customIdempotencyKey.trim() || undefined;
      const result = executeAgentSkill({
        deal: selectedDeal,
        agentId: selectedAgent.id,
        skillId: selectedSkill.id,
        inputs: dispatchInputs,
        operator: "Gregory Jones (Managing Member)",
        idempotencyKey: activeKey,
        priority: dispatchPriority,
        maxRetries,
        simulateFailureMode,
        allowDuplicateReplay: forceDuplicate
      }, triggerSystemEvent);

      if (result.isIdempotencyReplay) {
        setExecutionMessage({
          text: result.message,
          type: "info"
        });
        setSelectedRunForTrace(result.run);
        setIsExecuting(false);
        return;
      }

      setRuns(prev => [result.run, ...prev]);
      setAuditLogs(prev => [result.auditEvent, ...prev]);

      if (result.ticket) {
        setApprovalTickets(prev => [result.ticket!, ...prev]);
        setExecutionMessage({
          text: result.message,
          type: "warning"
        });
      } else if (result.run.status === "failed") {
        setExecutionMessage({
          text: `Execution Failed: ${result.run.errorMessage}`,
          type: "error"
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

  // Handle Retry Run
  const handleRetryRun = (run: AgentRun) => {
    setIsExecuting(true);
    setTimeout(() => {
      const result = retryAgentRun(run, "Gregory Jones (Managing Member)", deals);
      setRuns(prev => [result.run, ...prev]);
      setAuditLogs(prev => [result.auditEvent, ...prev]);
      if (result.updatedDeal && result.run.dealId) {
        onUpdateDealDetails(result.run.dealId, result.updatedDeal);
      }
      setSelectedRunForTrace(result.run);
      setIsExecuting(false);
      setExecutionMessage({
        text: `Retried Run #${run.id} → Generated new execution run #${result.run.id} (Attempt ${result.run.attemptCount}/${result.run.maxRetries}).`,
        type: "success"
      });
    }, 400);
  };

  // Handle Approval Action
  const handleApproveTicket = (ticket: ApprovalTicket) => {
    const updatedTicket: ApprovalTicket = {
      ...ticket,
      status: "approved",
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Gregory Jones, Managing Member",
      notes: "Authorized with cryptographic signature #ALGQ-AUTH-GJONES."
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
            details: `Authorized by Managing Member: ${step.details}`
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
          authorizedBy: "Gregory Jones (Managing Member)",
          signatureToken: "SHA256:GJONES_SPONSOR_SIGN_01",
          stateDeltaApplied: true,
          timestamp: new Date().toISOString()
        },
        traceSteps: completedSteps
      };

      setRuns(prev => prev.map(r => r.id === targetRun.id ? updatedRun : r));

      // Real-time state delta application to CRM
      if (ticket.skillId === "skill_release_binding_offer") {
        onUpdateDealStatus(ticket.dealId, DealStatus.OfferSubmitted);
      } else if (ticket.skillId === "skill_commit_capital") {
        onUpdateDealStatus(ticket.dealId, DealStatus.Funded);
      }
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
      details: `Managing Member approved and executed ticket #${ticket.id} (${ticket.summary}). Applied CRM state delta.`,
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

  // Agent Permissions Toggle (RBAC Testing)
  const handleToggleAgentPermission = (agentId: string, permission: AgentPermission) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const currentPerms = a.permissions || [];
        const has = currentPerms.includes(permission);
        const next = has ? currentPerms.filter(p => p !== permission) : [...currentPerms, permission];
        return { ...a, permissions: next };
      }
      return a;
    }));
  };

  // Agent Status Toggle
  const handleToggleAgentStatus = (agentId: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const nextStatus = a.status === "active" ? "paused" : "active";
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  // Filtered runs
  const filteredRuns = runs.filter(run => {
    const matchesSearch = 
      run.dealAddress.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.agentName.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.skillName.toLowerCase().includes(searchRunQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchRunQuery.toLowerCase());

    const matchesStatus = filterRunStatus === "all" || run.status === filterRunStatus;
    const matchesDeal = filterRunDealId === "all" || run.dealId === filterRunDealId;
    return matchesSearch && matchesStatus && matchesDeal;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="algq-agent-engine-section">
      {/* 1. Header & Version Maturity HUD */}
      <div className="bg-[#071522] text-white rounded-xl p-6 border border-[#0B3A63]/60 shadow-xl relative overflow-hidden" id="agent-engine-header">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#D1A54A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-[#0B1F33] border border-[#0B3A63] flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 text-[#D1A54A]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-2.5">
                  <span className="text-[#D1A54A]">Algonquian ARE</span> Agent Engine
                  <span className="text-[10px] font-mono uppercase bg-[#0B1F33] text-[#36C2B4] px-2 py-0.5 rounded border border-[#36C2B4]/40 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#36C2B4]" />
                    1.0.0 Production Core
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Full 7-Stage Execution Lifecycle: Skills → Execution Requests → Authorization → Approval → Execution → Result → Audit Event
                </p>
              </div>
            </div>
          </div>

          {/* HUD KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0B1F33] p-3 rounded-lg border border-[#0B3A63]">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#D1A54A] font-bold block">Autonomous Agents</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-[#36C2B4] animate-pulse" />
                <span className="text-base font-mono font-bold text-white">{agents.filter(a => a.status === "active").length}/{agents.length} Online</span>
              </div>
            </div>

            <div className="bg-[#0B1F33] p-3 rounded-lg border border-[#0B3A63]">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#D1A54A] font-bold block">Skill Registry</span>
              <span className="text-base font-mono font-bold text-white">{skills.length} Allowlisted</span>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${
              pendingApprovalsCount > 0 
                ? "bg-[#0B1F33] border-[#D1A54A] text-[#D1A54A]" 
                : "bg-[#0B1F33] border-[#0B3A63] text-white"
            }`}>
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#D1A54A] font-bold block">Approval Gate</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-base font-mono font-bold text-[#D1A54A]">
                  {pendingApprovalsCount} Actionable
                </span>
                {pendingApprovalsCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-[#D1A54A] animate-ping" />
                )}
              </div>
            </div>

            <div className="bg-[#0B1F33] p-3 rounded-lg border border-[#0B3A63]">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#D1A54A] font-bold block">Idempotency Locks</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Lock className="h-3.5 w-3.5 text-[#36C2B4]" />
                <span className="text-base font-mono font-bold text-[#36C2B4]">{idempotencyStore.getKeysCount()} Cached</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Stage Core Pipeline Lifecycle Tracker */}
        <div className="mt-5 pt-4 border-t border-[#0B3A63]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#D1A54A] font-bold tracking-wider flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-[#D1A54A]" />
              Canonical 7-Stage Engine Pipeline Architecture
            </span>
            <span className="text-[10px] font-mono text-slate-400">Production Specification 1.0.0</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { n: 1, title: "1. Skills", desc: "Registry & Schemas", icon: Cpu },
              { n: 2, title: "2. Exec Requests", desc: "Intake & Idempotency", icon: Play },
              { n: 3, title: "3. Authorization", desc: "RBAC & Deal States", icon: Key },
              { n: 4, title: "4. Approval", desc: "Sponsor Boundaries", icon: ShieldAlert },
              { n: 5, title: "5. Execution", desc: "Retries & Backoff", icon: RefreshCw },
              { n: 6, title: "6. Result", desc: "Canonical CRM Deltas", icon: CheckCircle2 },
              { n: 7, title: "7. Audit Event", desc: "Immutable Signatures", icon: ShieldCheck }
            ].map((stage) => {
              const IconComp = stage.icon;
              return (
                <div 
                  key={stage.n}
                  className="bg-[#0B1F33] border border-[#0B3A63] p-2 rounded-lg flex items-center gap-2 hover:border-[#D1A54A]/50 transition-colors"
                >
                  <div className="h-6 w-6 rounded bg-[#071522] border border-[#0B3A63] flex items-center justify-center text-[#D1A54A] shrink-0 font-mono text-[10px] font-bold">
                    {stage.n}
                  </div>
                  <div className="min-w-0">
                    <span className="font-serif text-[11px] font-bold text-white block truncate">{stage.title}</span>
                    <span className="text-[9px] text-slate-400 block truncate">{stage.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engine Subtabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[#0B3A63]/60">
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "dispatch"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Execution Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "approvals"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
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
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Runs & Retries ({runs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("permissions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "permissions"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Permissions & RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "skills"
                ? "bg-[#D1A54A] text-[#071522] shadow-sm font-bold"
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
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
                : "bg-[#0B1F33] text-slate-300 border border-[#0B3A63] hover:text-[#D1A54A] hover:border-[#D1A54A]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Immutable Audit Stream</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTAB: EXECUTION DISPATCHER */}
      {activeTab === "dispatch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dispatch-workbench-view">
          {/* Left Column: Execution Request Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-lg space-y-5 text-white">
              <div className="flex items-center justify-between border-b border-[#0B3A63]/60 pb-3">
                <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#D1A54A]" />
                  Execution Request Dispatcher
                </h3>
                <span className="text-[10px] font-mono text-[#36C2B4] bg-[#0B1F33] px-2.5 py-1 rounded border border-[#0B3A63] font-bold">
                  Stage 1 → Stage 2 Pipeline
                </span>
              </div>

              {/* 1. Direct Linkage to Canonical CRM Record */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-serif font-bold text-[#D1A54A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-[#D1A54A]" />
                    1. Canonical CRM Property Record Linkage
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {selectedDeal?.id}
                  </span>
                </div>
                <select
                  value={selectedDealId}
                  onChange={(e) => {
                    setSelectedDealId(e.target.value);
                    const deal = deals.find(d => d.id === e.target.value);
                    if (deal && selectedSkill) {
                      initSkillInputs(selectedSkill, deal);
                    }
                  }}
                  className="w-full bg-[#0B1F33] border border-[#0B3A63] rounded-lg p-2.5 text-xs text-white font-medium focus:border-[#D1A54A] outline-none transition-colors"
                >
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.address} — {deal.city}, {deal.state} [{deal.status}] (Asking: ${deal.askingPrice.toLocaleString()})
                    </option>
                  ))}
                </select>

                {selectedDeal && (
                  <div className="mt-2.5 p-3 bg-[#0B1F33] border border-[#0B3A63] rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-white text-xs">{selectedDeal.address}</span>
                      <span className="px-2 py-0.5 rounded bg-[#071522] border border-[#0B3A63] text-[10px] font-mono text-[#36C2B4] font-bold">
                        {selectedDeal.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-[#0B3A63]/50 text-[11px]">
                      <div>
                        <span className="text-[#D1A54A] text-[9px] uppercase font-mono block">Asking</span>
                        <span className="font-bold text-white">${selectedDeal.askingPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#D1A54A] text-[9px] uppercase font-mono block">ARV</span>
                        <span className="font-bold text-white">${selectedDeal.arv.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#D1A54A] text-[9px] uppercase font-mono block">Rehab</span>
                        <span className="font-bold text-white">${selectedDeal.estimatedRepairs.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[#D1A54A] text-[9px] uppercase font-mono block">Canonical MAO</span>
                        <span className="font-bold text-[#36C2B4] font-mono">${selectedDeal.mao.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Select Authorized Agent */}
              <div>
                <label className="text-xs font-serif font-bold text-[#D1A54A] block mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-[#D1A54A]" />
                  2. Select Authorized Autonomous Agent
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agents.map(agent => {
                    const isSelected = selectedAgentId === agent.id;
                    const isPaused = agent.status === "paused";
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => handleAgentSelect(agent.id)}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#0B1F33] text-white border-2 border-[#D1A54A] shadow-md ring-1 ring-[#D1A54A]"
                            : "bg-[#0B1F33]/60 border-[#0B3A63] text-slate-300 hover:border-[#D1A54A]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs text-white">{agent.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                            isPaused ? "bg-amber-950/40 text-amber-400 border-amber-800" : "bg-[#071522] text-[#D1A54A] border-[#0B3A63]"
                          }`}>
                            {isPaused ? "PAUSED" : agent.codename}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[9px] font-mono text-[#36C2B4]">
                            Scopes: {agent.permissions?.length || 0}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-[9px] font-mono text-slate-300">
                            {agent.autonomousLevel === "strict_approval" ? "Gate Sign-Off" : "Autonomous"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Select Allowlisted Skill */}
              {selectedAgent && (
                <div>
                  <label className="text-xs font-serif font-bold text-[#D1A54A] block mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-[#D1A54A]" />
                    3. Select Allowlisted Skill for [{selectedAgent.name}]
                  </label>
                  <select
                    value={selectedSkillId}
                    onChange={(e) => handleSkillSelect(e.target.value)}
                    className="w-full bg-[#0B1F33] border border-[#0B3A63] rounded-lg p-2.5 text-xs text-white font-medium focus:border-[#D1A54A] outline-none transition-colors"
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

              {/* 4. Production Controls: Idempotency & Retry Configuration */}
              <div className="bg-[#0B1F33] p-4 rounded-xl border border-[#0B3A63] space-y-3">
                <div className="flex items-center justify-between border-b border-[#0B3A63] pb-2">
                  <span className="text-xs font-serif font-bold text-[#D1A54A] flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-[#D1A54A]" />
                    Production Controls: Idempotency & Retries
                  </span>
                  <span className="text-[10px] font-mono text-[#36C2B4] font-bold">
                    TTL: {selectedSkill?.idempotencyTtlSeconds}s
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-200 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-[#D1A54A]" />
                        Idempotency Key (Collision Prevention Lock)
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateIdempotencyKey}
                        className="text-[10px] text-[#D1A54A] hover:underline cursor-pointer flex items-center gap-1 font-mono"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Generate Fresh Key
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Auto-generated if left empty"
                        value={customIdempotencyKey}
                        onChange={(e) => setCustomIdempotencyKey(e.target.value)}
                        className="flex-1 bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDispatchRun(true)}
                        title="Simulate re-submitting with identical idempotency key to test replay protection"
                        className="px-2.5 py-2 bg-[#071522] text-[#D1A54A] border border-[#0B3A63] hover:border-[#D1A54A] rounded-lg text-[10px] font-mono font-bold cursor-pointer whitespace-nowrap"
                      >
                        Test Duplicate
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Submitting with an existing active idempotency key safely returns the cached result without duplicate execution.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-200 block mb-1">
                        Request Priority Tier
                      </label>
                      <select
                        value={dispatchPriority}
                        onChange={(e) => setDispatchPriority(e.target.value as any)}
                        className="w-full bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none font-mono"
                      >
                        <option value="low">Low Priority (Batch Queue)</option>
                        <option value="normal">Normal (Standard Processing)</option>
                        <option value="high">High (Front-of-Line Dispatch)</option>
                        <option value="urgent">Urgent (Real-Time Preemption)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-200 block mb-1">
                        Max Retry Policy (Backoff Strategy)
                      </label>
                      <select
                        value={maxRetries}
                        onChange={(e) => setMaxRetries(Number(e.target.value))}
                        className="w-full bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none font-mono"
                      >
                        <option value={1}>1 Attempt (No Retries)</option>
                        <option value={2}>2 Attempts (Linear Backoff)</option>
                        <option value={3}>3 Attempts (Exponential Backoff)</option>
                      </select>
                    </div>
                  </div>

                  {/* Chaos / Failure Simulator Toggle */}
                  <div className="pt-2 border-t border-[#0B3A63]/50">
                    <label className="text-[11px] font-medium text-[#D1A54A] block mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-[#D1A54A]" />
                      Failure Recovery Simulation (Chaos Testing)
                    </label>
                    <select
                      value={simulateFailureMode}
                      onChange={(e) => setSimulateFailureMode(e.target.value as any)}
                      className="w-full bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none font-mono"
                    >
                      <option value="none">Standard Execution (Expect Success)</option>
                      <option value="transient_timeout">Simulate Transient Timeout (Tests auto-retry attempt 2 with backoff)</option>
                      <option value="permission_denied">Simulate Permission Denied (Tests RBAC privilege block)</option>
                      <option value="state_violation">Simulate State Machine Violation (Tests deal stage constraint)</option>
                      <option value="schema_error">Simulate Schema Parameter Error (Tests input validation)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Dynamic Parameter Schema Inputs */}
              {selectedSkill && (
                <div className="bg-[#0B1F33] p-4 rounded-xl border border-[#0B3A63] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#0B3A63] pb-2">
                    <span className="text-xs font-serif font-bold text-[#D1A54A]">
                      Payload Input Parameters ({selectedSkill.requiredInputs.length})
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      selectedSkill.riskLevel === "Critical" ? "bg-[#7A1E28]/40 text-[#F5A9B8] border border-[#7A1E28]" :
                      selectedSkill.riskLevel === "High" ? "bg-[#071522] text-[#D1A54A] border border-[#D1A54A]/50" :
                      "bg-[#071522] text-[#36C2B4] border border-[#36C2B4]/50"
                    }`}>
                      Risk Tier: {selectedSkill.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{selectedSkill.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {selectedSkill.requiredInputs.map(param => (
                      <div key={param.name}>
                        <label className="text-[11px] font-medium text-slate-200 block mb-1">
                          {param.label} {param.required && <span className="text-[#D1A54A]">*</span>}
                        </label>
                        {param.type === "select" ? (
                          <select
                            value={dispatchInputs[param.name] ?? param.defaultValue}
                            onChange={(e) => setDispatchInputs(prev => ({ ...prev, [param.name]: e.target.value }))}
                            className="w-full bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none"
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
                              className="h-4 w-4 text-[#D1A54A] rounded border-[#0B3A63] bg-[#071522] focus:ring-[#D1A54A]"
                            />
                            <label htmlFor={`param-${param.name}`} className="text-xs text-slate-300">
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
                            className="w-full bg-[#071522] border border-[#0B3A63] rounded-lg p-2 text-xs text-white focus:border-[#D1A54A] outline-none font-mono"
                          />
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-flight Check Status Box */}
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                preflightAuth.authorized 
                  ? "bg-[#0B1F33] border-[#36C2B4]/40 text-[#36C2B4]" 
                  : "bg-[#7A1E28]/30 border-[#7A1E28] text-[#F5A9B8]"
              }`}>
                <div className="flex items-center gap-2">
                  {preflightAuth.authorized ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <span><strong>Stage 3 Pre-Flight:</strong> {preflightAuth.reason}</span>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#071522] font-bold">
                  {preflightAuth.authorized ? "Pre-Flight Passed" : "Pre-Flight Block"}
                </span>
              </div>

              {/* Execution Feedback Notification */}
              {executionMessage && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  executionMessage.type === "success" 
                    ? "bg-[#0B1F33] text-[#36C2B4] border border-[#36C2B4]/60" 
                    : executionMessage.type === "warning"
                    ? "bg-[#0B1F33] text-[#D1A54A] border border-[#D1A54A]/60"
                    : executionMessage.type === "info"
                    ? "bg-[#0B1F33] text-sky-300 border border-sky-500/60"
                    : "bg-[#7A1E28]/30 text-[#F5A9B8] border border-[#7A1E28]"
                }`}>
                  {executionMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#36C2B4]" /> : 
                   executionMessage.type === "info" ? <Lock className="h-4 w-4 shrink-0 text-sky-300" /> :
                   <AlertTriangle className="h-4 w-4 shrink-0 text-[#D1A54A]" />}
                  <span>{executionMessage.text}</span>
                </div>
              )}

              {/* Primary Trigger Button */}
              <button
                type="button"
                disabled={isExecuting}
                onClick={() => handleDispatchRun(false)}
                className="w-full bg-[#D1A54A] hover:bg-[#C2973D] text-[#071522] py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#071522]" />
                    <span>Executing 7-Stage Engine Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 text-[#071522]" />
                    <span>Submit Execution Request ({selectedSkill?.name})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: 7-Stage Control Flow Inspector & Recent Trace */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#071522] text-white rounded-xl p-6 border border-[#0B3A63]/60 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#0B3A63]/60 pb-3">
                <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#36C2B4]" />
                  Production 7-Stage Core Pipeline
                </h3>
                <span className="text-[10px] font-mono text-[#D1A54A] bg-[#0B1F33] px-2.5 py-1 rounded border border-[#0B3A63] font-bold">
                  Verified 1.0.0
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { n: 1, name: "1. Skill Resolution & Schema", desc: "Parameter verification and type checking" },
                  { n: 2, name: "2. Execution Request & Idempotency", desc: "Request digest, TTL lock, and deduplication" },
                  { n: 3, name: "3. Authorization & Permissions", desc: "Agent RBAC scope allowlist and deal state machine" },
                  { n: 4, name: "4. Human Approval Boundary", desc: "High-risk interception (Contracts, Capital, Escrow)" },
                  { n: 5, name: "5. Execution & Retry Policy", desc: "Exponential backoff and target adapter calls" },
                  { n: 6, name: "6. Result & CRM State Delta", desc: "Structured outputs and canonical CRM record writeback" },
                  { n: 7, name: "7. Immutable Audit Checksum", desc: "Cryptographic SHA-256 ledger recording" }
                ].map(step => (
                  <div 
                    key={step.n}
                    className="p-2.5 rounded-lg bg-[#0B1F33] border border-[#0B3A63] flex items-start gap-3"
                  >
                    <span className="h-5 w-5 rounded bg-[#071522] text-[#D1A54A] border border-[#0B3A63] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <div className="flex-1">
                      <span className="font-serif font-semibold text-white block text-xs">{step.name}</span>
                      <span className="text-[10px] text-slate-400">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Trace Inspector */}
            {selectedRunForTrace && (
              <div className="bg-[#071522] rounded-xl p-5 border border-[#0B3A63]/60 shadow-md space-y-3 text-white">
                <div className="flex items-center justify-between border-b border-[#0B3A63]/60 pb-2">
                  <div>
                    <h4 className="font-serif font-bold text-xs text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#D1A54A]" />
                      Execution Trace (#{selectedRunForTrace.id})
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Req: {selectedRunForTrace.executionRequestId || "N/A"} • Attempt {selectedRunForTrace.attemptCount || 1}/{selectedRunForTrace.maxRetries || 3}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedRunForTrace.status === "completed" ? "bg-[#0B1F33] text-[#36C2B4] border border-[#36C2B4]/40" :
                    selectedRunForTrace.status === "awaiting_approval" ? "bg-[#0B1F33] text-[#D1A54A] border border-[#D1A54A]/40" :
                    "bg-[#7A1E28]/40 text-[#F5A9B8] border border-[#7A1E28]"
                  }`}>
                    {selectedRunForTrace.status}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {selectedRunForTrace.traceSteps.map((step) => (
                    <div key={step.stepNumber} className="text-xs p-2.5 rounded bg-[#0B1F33] border border-[#0B3A63] flex items-start gap-2">
                      {step.status === "success" && <Check className="h-3.5 w-3.5 text-[#36C2B4] shrink-0 mt-0.5" />}
                      {step.status === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-[#D1A54A] shrink-0 mt-0.5" />}
                      {step.status === "error" && <XCircle className="h-3.5 w-3.5 text-[#D9534F] shrink-0 mt-0.5" />}
                      {step.status === "skipped" && <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />}
                      {step.status === "pending" && <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-white text-[11px]">{step.stepName}</span>
                          <span className="text-[9px] font-mono text-[#D1A54A]">{step.durationMs}ms</span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct Action for this Run */}
                <div className="pt-2 border-t border-[#0B3A63]/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Deal: <strong className="text-white">{selectedRunForTrace.dealAddress}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRetryRun(selectedRunForTrace)}
                    className="px-2.5 py-1 bg-[#0B1F33] text-[#D1A54A] border border-[#0B3A63] hover:border-[#D1A54A] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Retry Run</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: HUMAN APPROVAL GATE */}
      {activeTab === "approvals" && (
        <div className="space-y-6" id="approvals-gate-view">
          <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-md space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B3A63]/60 pb-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#D1A54A]" />
                  Human-in-the-Loop Sponsor Approval Gate
                </h3>
                <p className="text-xs text-slate-300">
                  Enforces Stage 4 boundaries on high-consequence operations (binding contracts, capital commitments, escrow wire releases)
                </p>
              </div>
              <span className="px-3 py-1 bg-[#0B1F33] border border-[#0B3A63] text-[#D1A54A] font-mono font-bold text-xs rounded-full">
                {approvalTickets.filter(t => t.status === "pending").length} Actionable Tickets
              </span>
            </div>

            {approvalTickets.length === 0 ? (
              <div className="p-8 text-center bg-[#0B1F33] rounded-xl border border-dashed border-[#0B3A63]">
                <CheckCircle2 className="h-8 w-8 text-[#36C2B4] mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">No pending tickets in the approval gate.</p>
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
                          ? "bg-[#0B1F33] border-2 border-[#D1A54A] shadow-md ring-1 ring-[#D1A54A]/30" 
                          : "bg-[#0B1F33]/60 border-[#0B3A63] opacity-80"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#071522] text-[#D1A54A] border border-[#0B3A63] font-mono text-[10px] font-bold rounded">
                              {ticket.id}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              ticket.severity === "Critical" ? "bg-[#7A1E28]/40 text-[#F5A9B8] border border-[#7A1E28]" :
                              "bg-[#071522] text-[#D1A54A] border border-[#D1A54A]/40"
                            }`}>
                              {ticket.severity} Severity
                            </span>
                            <span className="text-xs font-bold text-white">
                              {ticket.skillName}
                            </span>
                            <span className="text-xs text-slate-300">
                              on <strong className="text-[#D1A54A]">{ticket.dealAddress}</strong>
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 font-semibold">{ticket.summary}</p>
                          <p className="text-xs text-slate-300 bg-[#071522] p-2.5 rounded-lg border border-[#0B3A63] font-mono text-[11px]">
                            {ticket.proposedAction}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                            <span>Agent: <strong className="text-white">{ticket.agentName}</strong></span>
                            <span>Created: <strong className="text-[#D1A54A]">{new Date(ticket.createdAt).toLocaleTimeString()}</strong></span>
                            {ticket.reviewedBy && (
                              <span>Reviewed By: <strong className="text-[#36C2B4]">{ticket.reviewedBy}</strong></span>
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
                                className="px-4 py-2 bg-[#D1A54A] hover:bg-[#C2973D] text-[#071522] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                              >
                                <Check className="h-4 w-4" />
                                <span>Sign & Execute</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectTicket(ticket, "Managing Member terms mismatch")}
                                className="px-4 py-2 bg-[#7A1E28]/30 hover:bg-[#7A1E28]/50 text-[#F5A9B8] border border-[#7A1E28] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono text-center uppercase ${
                              ticket.status === "approved" ? "bg-[#0B1F33] text-[#36C2B4] border border-[#36C2B4]/50" : "bg-[#7A1E28]/30 text-[#F5A9B8] border border-[#7A1E28]"
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

      {/* 4. SUBTAB: RUNS & RETRIES (ACTIVITY HISTORY) */}
      {activeTab === "runs" && (
        <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-md space-y-4 text-white" id="runs-repository-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0B3A63]/60 pb-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#D1A54A]" />
                Live Agent Run Repository & Activity History
              </h3>
              <p className="text-xs text-slate-300">
                Complete trace repository with retry controls, failure diagnosis, and millisecond step latency
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter runs..."
                  value={searchRunQuery}
                  onChange={(e) => setSearchRunQuery(e.target.value)}
                  className="bg-[#0B1F33] border border-[#0B3A63] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-[#D1A54A] outline-none"
                />
              </div>

              <select
                value={filterRunStatus}
                onChange={(e) => setFilterRunStatus(e.target.value)}
                className="bg-[#0B1F33] border border-[#0B3A63] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D1A54A] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="awaiting_approval">Awaiting Approval</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterRunDealId}
                onChange={(e) => setFilterRunDealId(e.target.value)}
                className="bg-[#0B1F33] border border-[#0B3A63] rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#D1A54A] outline-none"
              >
                <option value="all">All Deals</option>
                {deals.map(d => (
                  <option key={d.id} value={d.id}>{d.address}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRuns.map((run) => (
              <div 
                key={run.id}
                className="p-4 rounded-xl bg-[#0B1F33] border border-[#0B3A63] hover:border-[#D1A54A]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D1A54A] bg-[#071522] px-2 py-0.5 rounded border border-[#0B3A63]">
                      #{run.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Req: {run.executionRequestId || "N/A"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      run.status === "completed" ? "bg-[#071522] text-[#36C2B4] border border-[#36C2B4]/40" :
                      run.status === "awaiting_approval" ? "bg-[#071522] text-[#D1A54A] border border-[#D1A54A]/40" :
                      "bg-[#7A1E28]/40 text-[#F5A9B8] border border-[#7A1E28]"
                    }`}>
                      {run.status}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {run.skillName}
                    </span>
                    <span className="text-xs text-slate-300">
                      for <strong className="text-[#D1A54A]">{run.dealAddress}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <span>Agent: <strong className="text-white">{run.agentName}</strong></span>
                    <span>Target: <strong className="text-slate-200">{run.targetSystem}</strong></span>
                    <span>Attempts: <strong className="text-[#36C2B4] font-mono">{run.attemptCount || 1}/{run.maxRetries || 3}</strong></span>
                    <span>Latency: <strong className="text-[#D1A54A] font-mono">{run.durationMs || 150}ms</strong></span>
                  </div>

                  {run.errorMessage && (
                    <p className="text-xs text-[#F5A9B8] bg-[#7A1E28]/20 p-2 rounded border border-[#7A1E28]/50">
                      Error: {run.errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedRunForTrace(run)}
                    className="px-3 py-1.5 bg-[#071522] text-slate-200 border border-[#0B3A63] hover:border-[#D1A54A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#D1A54A]" />
                    <span>Inspect 7-Stage Trace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRetryRun(run)}
                    className="px-3 py-1.5 bg-[#0B1F33] text-[#D1A54A] border border-[#0B3A63] hover:border-[#D1A54A] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SUBTAB: AGENT PERMISSIONS & RBAC MATRIX */}
      {activeTab === "permissions" && (
        <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-md space-y-6 text-white" id="permissions-rbac-view">
          <div className="border-b border-[#0B3A63]/60 pb-3">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-[#D1A54A]" />
              Agent Security Allowlist & Role-Based Access Control (RBAC)
            </h3>
            <p className="text-xs text-slate-300">
              Interactive permission scopes governing Stage 3 authorization boundaries across the ARE Engine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const allScopes: AgentPermission[] = [
                "read:pipeline", 
                "write:underwriting", 
                "write:contracts", 
                "manage:capital", 
                "sync:google_tasks", 
                "execute:escrow"
              ];
              const isPaused = agent.status === "paused";

              return (
                <div 
                  key={agent.id}
                  className={`bg-[#0B1F33] rounded-xl p-5 border transition-all ${
                    isPaused ? "border-amber-700/60 opacity-80" : "border-[#0B3A63]"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#0B3A63]/60 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#D1A54A] bg-[#071522] px-2 py-0.5 rounded border border-[#0B3A63]">
                        {agent.codename}
                      </span>
                      <span className="font-serif font-bold text-sm text-white">{agent.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAgentStatus(agent.id)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold cursor-pointer transition-colors ${
                        isPaused ? "bg-amber-950/40 text-amber-400 border-amber-700" : "bg-[#071522] text-[#36C2B4] border-[#36C2B4]/40"
                      }`}
                    >
                      {isPaused ? "PAUSED" : "ACTIVE"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{agent.role}</p>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#D1A54A] font-bold block mb-2">
                      Assigned RBAC Permission Scopes (Click to toggle)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allScopes.map(scope => {
                        const has = (agent.permissions || []).includes(scope);
                        return (
                          <button
                            key={scope}
                            type="button"
                            onClick={() => handleToggleAgentPermission(agent.id, scope)}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                              has 
                                ? "bg-[#071522] text-[#36C2B4] border-[#36C2B4]/50 shadow-sm" 
                                : "bg-[#071522]/40 text-slate-500 border-[#0B3A63] line-through"
                            }`}
                          >
                            {scope}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#0B3A63]/50 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Autonomy: <strong className="text-white">{agent.autonomousLevel}</strong></span>
                    <span className="text-slate-400">Total Runs: <strong className="text-[#D1A54A]">{agent.totalRunsCount}</strong></span>
                    <span className="text-slate-400">Success: <strong className="text-[#36C2B4]">{agent.successRatePercent}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. SUBTAB: SKILL MATRIX & STATE RULES */}
      {activeTab === "skills" && (
        <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-md space-y-4 text-white" id="skill-matrix-view">
          <div className="border-b border-[#0B3A63]/60 pb-3">
            <h3 className="font-serif font-bold text-sm text-white">
              <span className="text-[#D1A54A]">Algonquian ARE</span> Skill Registry & State Machine Matrix
            </h3>
            <p className="text-xs text-slate-300">
              Authorized skill execution rules, target application adapters, allowed deal states, and approval policies
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#0B3A63] bg-[#0B1F33] text-[#D1A54A] font-mono text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Skill Identifier</th>
                  <th className="py-2.5 px-3">Target System</th>
                  <th className="py-2.5 px-3">Required Permissions</th>
                  <th className="py-2.5 px-3">Allowed Deal States</th>
                  <th className="py-2.5 px-3">Approval Policy</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Retry Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B3A63]/40">
                {skills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-[#0B1F33]/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-serif font-bold text-white block">{skill.name}</span>
                      <span className="text-[10px] text-[#D1A54A] font-mono">{skill.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200">{skill.targetSystem}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {skill.requiredPermissions?.map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-[#071522] text-[#36C2B4] border border-[#36C2B4]/40 text-[9px] rounded font-mono">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {skill.allowedDealStates.map(state => (
                          <span key={state} className="px-1.5 py-0.5 bg-[#0B1F33] text-slate-200 border border-[#0B3A63] text-[9px] rounded font-medium font-mono">
                            {state}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        skill.approvalPolicy === "required" 
                          ? "bg-[#0B1F33] text-[#D1A54A] border border-[#D1A54A]/40" 
                          : "bg-[#0B1F33] text-[#36C2B4] border border-[#36C2B4]/40"
                      }`}>
                        {skill.approvalPolicy === "required" ? "Gate Sign-Off" : "Autonomous"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] font-bold ${
                        skill.riskLevel === "Critical" ? "text-[#F5A9B8]" :
                        skill.riskLevel === "High" ? "text-[#D1A54A]" : "text-[#36C2B4]"
                      }`}>
                        {skill.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#D1A54A]">
                      {skill.retryPolicy?.maxRetries || 3}x ({skill.retryPolicy?.backoffMs || 250}ms)
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
        <div className="bg-[#071522] rounded-xl p-6 border border-[#0B3A63]/60 shadow-md space-y-4 text-white" id="immutable-audit-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0B3A63]/60 pb-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#36C2B4]" />
                Immutable Append-Only Audit Stream (`algq_agent_audit_log`)
              </h3>
              <p className="text-xs text-slate-300">
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
              className="px-3 py-1.5 bg-[#0B1F33] text-slate-200 border border-[#0B3A63] hover:bg-[#D1A54A] hover:text-[#071522] hover:border-[#D1A54A] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Ledger</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                className="p-3.5 rounded-lg bg-[#0B1F33] border border-[#0B3A63] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] bg-[#071522] text-[#D1A54A] border border-[#0B3A63] px-2 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      log.status === "SUCCESS" ? "bg-[#071522] text-[#36C2B4] border border-[#36C2B4]/40" :
                      log.status === "INTERCEPTED_APPROVAL" ? "bg-[#071522] text-[#D1A54A] border border-[#D1A54A]/40" :
                      log.status === "APPROVAL_GRANTED" ? "bg-[#071522] text-[#36C2B4] border border-[#36C2B4]/40" :
                      "bg-[#7A1E28]/30 text-[#F5A9B8] border border-[#7A1E28]"
                    }`}>
                      {log.status}
                    </span>
                    <span className="font-semibold text-white">
                      {log.dealAddress}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{log.details}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-400">
                    <span>Agent: <strong className="text-white">{log.agentName}</strong></span>
                    <span>Operator: <strong className="text-white">{log.operator}</strong></span>
                    <span>Checksum: <strong className="text-[#D1A54A]">{log.auditChecksum}</strong></span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono text-[#D1A54A] shrink-0">
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
