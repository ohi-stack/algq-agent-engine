/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, FolderKanban, Calculator, FileSignature, 
  Landmark, ShieldAlert, Layers, BookOpen, Settings2, 
  Workflow, LogOut, Clock, Trees, UserCheck, ShieldCheck,
  CheckSquare, Bot, Cpu, Sparkles, User, Lock, ExternalLink,
  Menu, X, Home, ChevronRight
} from "lucide-react";

import { RealEstateDeal, FundingSource, AutomationTrigger, DealStatus } from "./types";
import { SEED_DEALS, SEED_FUNDS, SEED_AUTOMATIONS } from "./data";

// Component import sections
import { AlgonquianLogo, AlgonquianEmblem } from "./components/AlgonquianLogo";
import { AlgonquianNavigationMenu } from "./components/AlgonquianNavigationMenu";
import { OverviewSection } from "./components/OverviewSection";
import { DealIntakeSection } from "./components/DealIntakeSection";
import { PipelineCRMSection } from "./components/PipelineCRMSection";
import { MAOEngineSection } from "./components/MAOEngineSection";
import { OfferGeneratorSection } from "./components/OfferGeneratorSection";
import { FundingTrackerSection } from "./components/FundingTrackerSection";
import { BuyerPortalSection } from "./components/BuyerPortalSection";
import { DocumentLibrarySection } from "./components/DocumentLibrarySection";
import { AutomationSection } from "./components/AutomationSection";
import { AdminCenterSection } from "./components/AdminCenterSection";
import { GoogleTasksSection } from "./components/GoogleTasksSection";
import { AgentEngineSection } from "./components/AgentEngineSection";
import { DigitalProductsSection } from "./components/DigitalProductsSection";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Persistent Client State (with LocalStorage fallbacks)
  const [deals, setDeals] = useState<RealEstateDeal[]>(() => {
    const local = localStorage.getItem("algonquian_deals");
    return local ? JSON.parse(local) : SEED_DEALS;
  });

  const [funds, setFunds] = useState<FundingSource[]>(() => {
    const local = localStorage.getItem("algonquian_funds");
    return local ? JSON.parse(local) : SEED_FUNDS;
  });

  const [triggers, setTriggers] = useState<AutomationTrigger[]>(() => {
    const local = localStorage.getItem("algonquian_triggers");
    return local ? JSON.parse(local) : SEED_AUTOMATIONS;
  });

  const [automationLogs, setAutomationLogs] = useState<string[]>(() => {
    const local = localStorage.getItem("algonquian_logs");
    return local ? JSON.parse(local) : [
      "ARE Tech Automated Pipeline initialized.",
      "Sponsor equity constant configured to Principal Gregory Jones.",
      "Connecticut municipal underwriting parameters loaded (Waterbury, Hartford)."
    ];
  });

  // Direct persistence sync
  useEffect(() => {
    localStorage.setItem("algonquian_deals", JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem("algonquian_funds", JSON.stringify(funds));
  }, [funds]);

  useEffect(() => {
    localStorage.setItem("algonquian_triggers", JSON.stringify(triggers));
  }, [triggers]);

  useEffect(() => {
    localStorage.setItem("algonquian_logs", JSON.stringify(automationLogs));
  }, [automationLogs]);

  // Central Event Log trigger triggers with Idempotency Guard
  const triggerSystemEvent = (eventName: string, details: any = {}) => {
    // 1. Resolve Deal ID (from details.dealId, details.id, or matched address)
    const resolvedDealId: string | undefined = 
      details?.dealId || 
      details?.id || 
      (details?.address && deals.find(d => d.address === details.address)?.id) ||
      (details?.dealAddress && deals.find(d => d.address === details.dealAddress)?.id);

    // 2. Idempotency Check: Verify against current automationLogs
    // Before logging or triggering side effects like Google Tasks or email alerts,
    // verify against current automationLogs to prevent duplicate execution of the same event for a given deal ID.
    if (resolvedDealId) {
      const idempotencyKey = `[IDEMPOTENCY:${eventName}:${resolvedDealId}]`;
      
      const isDuplicate = automationLogs.some(log => {
        if (log.includes(idempotencyKey)) return true;
        
        // Also check signature patterns for historical logs
        if (eventName === "ON_STATUS_CHANGE" && details.newStatus && details.address) {
          return log.includes(`[CRM Pipeline Swing] Property "${details.address}" moved -> "${details.newStatus}"`);
        }
        if (eventName === "ON_DEAL_INTAKE" && details.address) {
          return log.includes(`[Deal Intake Hook] Sourced off-market lead "${details.address}"`);
        }
        if (eventName === "ON_OFFER_SUBMITTED" && details.address) {
          return log.includes(`[Signature Engine] Digital e-signature verified!`) && log.includes(details.address);
        }
        if (eventName === "ON_STAGE_TASK_LIST_CREATED" && details.dealAddress) {
          return log.includes(`[Google Tasks Sync] Authorized new linked checklist`) && log.includes(details.dealAddress);
        }
        if (eventName === "ON_DEAL_TASKS_SYNCED" && details.address) {
          return log.includes(`[Google Tasks Sync] Synchronized`) && log.includes(details.address);
        }
        return false;
      });

      if (isDuplicate) {
        console.warn(`[Idempotency Guard] Duplicate execution suppressed: event "${eventName}" for deal ID "${resolvedDealId}" has already been processed.`);
        return;
      }
    }

    // 3. Execution of Event Logic and Side Effects
    let message = `[Event Raised] ${eventName}`;
    const sideEffectLogs: string[] = [];

    if (eventName === "ON_DEAL_INTAKE") {
      message = `[Deal Intake Hook] Sourced off-market lead "${details.address}" (${details.city}, CT). Computed MAO is $${details.mao?.toLocaleString() || "0"}. Added to Pipeline.`;
      
      // Trigger correlated automations
      triggers.filter(t => t.event === "ON_DEAL_INTAKE" && t.isActive).forEach(t => {
        sideEffectLogs.push(
          `[Webhook Executed] SMS Alert successfully dispatched to ${t.recipient} : "New Deal Lead at ${details.address}. Asking: $${details.askingPrice?.toLocaleString() || "0"}."`
        );
      });
    } 
    else if (eventName === "ON_OFFER_SUBMITTED") {
      message = `[Signature Engine] Digital e-signature verified! Signatory "${details.signatory}" authorized "${details.documentType}" document for ${details.address || "deal"}.`;
    }
    else if (eventName === "ON_STATUS_CHANGE") {
      message = `[CRM Pipeline Swing] Property "${details.address}" moved -> "${details.newStatus}".`;
      
      // Check for Underwriting Automation
      if (details.newStatus === DealStatus.Underwriting) {
        triggers.filter(t => t.event === "ON_STATUS_CHANGE_UNDERWRITING" && t.isActive).forEach(t => {
          sideEffectLogs.push(
            `[Webhook Executed] Document compilation queued: LOI draft generated for ${details.address}, Owner: ${details.ownerName || "Seller"}.`
          );
        });
      }
      // Check for Offer Submitted
      if (details.newStatus === DealStatus.OfferSubmitted) {
        triggers.filter(t => t.event === "ON_OFFER_SUBMITTED" && t.isActive).forEach(t => {
          sideEffectLogs.push(
            `[Webhook Executed] Partner Alert: Email dispatched to ${t.recipient} with underwriting parameters for ${details.address}.`
          );
        });
      }
    }
    else if (eventName === "ON_STAGE_TASK_LIST_CREATED") {
      message = `[Google Tasks Sync] Authorized new linked checklist "${details.listTitle}" (${details.tasksCount} tasks) for ${details.dealAddress}.`;
      setDeals(prev => prev.map(d => d.address === details.dealAddress || d.id === (details.dealId || resolvedDealId) ? { ...d, hasLinkedGoogleTaskList: true } : d));
    }
    else if (eventName === "ON_DEAL_TASKS_SYNCED") {
      message = `[Google Tasks Sync] Synchronized ${details.count} tasks for deal "${details.address}".`;
      setDeals(prev => prev.map(d => d.address === details.address || d.id === (details.dealId || resolvedDealId) ? { ...d, hasLinkedGoogleTaskList: true } : d));
    }
    else if (eventName === "ON_BATCH_INTAKE") {
      message = `[Batch Ingestion Engine] Batch imported ${details.count} off-market leads into Pipeline CRM (Total asking volume: $${details.totalVolume?.toLocaleString() || "0"}).`;
    }
    else if (eventName === "ON_AGENT_APPROVAL_GRANTED") {
      message = `[Agent Approval Gate] Executed authorized ticket #${details.ticketId} on ${details.dealAddress || "deal"}.`;
    }

    const primaryLogWithToken = resolvedDealId 
      ? `${message} [IDEMPOTENCY:${eventName}:${resolvedDealId}]`
      : message;

    setAutomationLogs(prev => [primaryLogWithToken, ...sideEffectLogs, ...prev]);
  };

  // State Adjustments
  const handleAddDeal = (deal: RealEstateDeal) => {
    setDeals(prev => [deal, ...prev]);
  };

  const handleBatchAddDeals = (newDeals: RealEstateDeal[]) => {
    setDeals(prev => [...newDeals, ...prev]);
    const totalVolume = newDeals.reduce((sum, d) => sum + d.askingPrice, 0);
    triggerSystemEvent("ON_BATCH_INTAKE", { count: newDeals.length, totalVolume });
  };

  const handleUpdateDealStatus = (id: string, newStatus: DealStatus) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d));
    triggerSystemEvent("ON_STATUS_CHANGE", { dealId: deal.id, address: deal.address, newStatus, ownerName: deal.ownerName });
  };

  const handleUpdateDealDetails = (id: string, updatedFields: Partial<RealEstateDeal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields, updatedAt: new Date().toISOString() } : d));
    setAutomationLogs(prev => [`[CRM Log] Manually adjusted financials or notes for deal ID ${id.slice(-4)}.`, ...prev]);
  };

  const handleDeleteDeal = (id: string) => {
    const deal = deals.find(d => d.id === id);
    if (deal && window.confirm(`Archiving deal at ${deal.address} from current pipeline registers?`)) {
      setDeals(prev => prev.filter(d => d.id !== id));
      setAutomationLogs(prev => [`[CRM Log] Removed deal at "${deal.address}" from memory registers.`, ...prev]);
    }
  };

  const handleResetDeals = () => {
    if (window.confirm("Verify: Re-seed memory databases with initial Connecticut assets? (Custom edits will reset)")) {
      setDeals(SEED_DEALS);
      setFunds(SEED_FUNDS);
      setTriggers(SEED_AUTOMATIONS);
      setAutomationLogs([
        "Memory registers refreshed. Original preloaded Connecticut assets restored."
      ]);
    }
  };

  const handleAddFund = (fund: FundingSource) => {
    setFunds(prev => [...prev, fund]);
    setAutomationLogs(prev => [`[Capital stack Registered] Configured new source "${fund.name}" at a target yield of ${fund.targetYield}%.`, ...prev]);
  };

  const handleUpdateFundState = (id: string, updatedFields: Partial<FundingSource>) => {
    setFunds(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));
  };

  const handleToggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    const trig = triggers.find(t => t.id === id);
    if (trig) {
      setAutomationLogs(prev => [`[Automation System] Trigger "${trig.title}" has been ${trig.isActive ? "PAUSED" : "RESUMED"}.`, ...prev]);
    }
  };

  const handleAddTrigger = (trig: AutomationTrigger) => {
    setTriggers(prev => [...prev, trig]);
    setAutomationLogs(prev => [`[Automation System] Mounted new conditional rule: "${trig.title}" on event ${trig.event}.`, ...prev]);
  };

  const handleClearLogs = () => {
    setAutomationLogs([]);
  };

  // Render Section Selector
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection 
            onNavigateToProducts={() => setActiveTab("digital-products")}
            onNavigateToIntake={() => setActiveTab("intake")}
          />
        );
      case "digital-products":
        return <DigitalProductsSection onNavigateToIntake={() => setActiveTab("intake")} />;
      case "intake":
        return <DealIntakeSection onAddDeal={handleAddDeal} triggerSystemEvent={triggerSystemEvent} />;
      case "pipeline":
        return (
          <PipelineCRMSection 
            deals={deals} 
            onUpdateDealStatus={handleUpdateDealStatus} 
            onUpdateDealDetails={handleUpdateDealDetails}
            onDeleteDeal={handleDeleteDeal}
            onResetDeals={handleResetDeals}
            onBatchAddDeals={handleBatchAddDeals}
          />
        );
      case "underwriting":
        return <MAOEngineSection />;
      case "offers":
        return <OfferGeneratorSection deals={deals} triggerSystemEvent={triggerSystemEvent} />;
      case "capital":
        return <FundingTrackerSection funds={funds} onAddFund={handleAddFund} onUpdateFundState={handleUpdateFundState} />;
      case "buyer":
        return <BuyerPortalSection deals={deals} />;
      case "documents":
        return <DocumentLibrarySection />;
      case "tasks":
        return <GoogleTasksSection deals={deals} triggerSystemEvent={triggerSystemEvent} />;
      case "automations":
        return (
          <AutomationSection 
            triggers={triggers} 
            logs={automationLogs} 
            onToggleTrigger={handleToggleTrigger}
            onAddTrigger={handleAddTrigger}
            onClearLogs={handleClearLogs}
          />
        );
      case "admin":
        return <AdminCenterSection deals={deals} funds={funds} />;
      case "agent-engine":
        return (
          <AgentEngineSection
            deals={deals}
            onUpdateDealStatus={handleUpdateDealStatus}
            onUpdateDealDetails={handleUpdateDealDetails}
            triggerSystemEvent={triggerSystemEvent}
          />
        );
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col md:flex-row font-sans antialiased text-[#071522]" id="main-application-frame">
      {/* 1. Left Side Admin Navigation Column (Desktop only, canonical taxonomy matching brand) */}
      <aside 
        className="hidden md:flex md:w-72 bg-[#071522] text-white flex-col justify-between border-r border-[#0B3A63]/60 shadow-2xl shrink-0 z-30 overflow-y-auto"
        id="side-bar-navigation"
      >
        <div className="p-5 space-y-6">
          {/* Company Brand Logo Block */}
          <div className="flex flex-col items-center justify-center pb-5 border-b border-[#0B3A63]/60" id="branding-panel">
            <AlgonquianLogo variant="full" theme="dark" size="md" />
            <div className="mt-2 text-center">
              <span className="text-[10px] font-serif tracking-[0.2em] text-[#D1A54A] font-semibold uppercase block">
                EST. 2026 • WATERBURY, CT
              </span>
            </div>
          </div>

          {/* Sourcing Menu Toggles - Grouped by Canonical Corporate Taxonomy */}
          <div className="space-y-4 text-xs" id="nav-categories">
            {/* OWNERS */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Owners</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("intake")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "intake" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-[#D1A54A]" />
                    <span>Submit A Property (Intake)</span>
                  </span>
                </button>
              </nav>
            </div>

            {/* ACQUISITIONS */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Acquisitions</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "pipeline" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-[#36C2B4]" />
                    <span>Deal Pipeline CRM</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#36C2B4]/20 border border-[#36C2B4]/50 text-[#36C2B4] text-[9px] font-mono font-bold">
                    {deals.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("underwriting")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "underwriting" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <Calculator className="h-4 w-4 text-slate-400" />
                  <span>Instant MAO Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab("offers")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "offers" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <FileSignature className="h-4 w-4 text-slate-400" />
                  <span>Institutional Offers</span>
                </button>
              </nav>
            </div>

            {/* INVESTORS */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Investors</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("capital")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "capital" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <Landmark className="h-4 w-4 text-slate-400" />
                  <span>Algonquian Funding Tracker</span>
                </button>
              </nav>
            </div>

            {/* SERVICES */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Services</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "documents" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>Document Library</span>
                </button>
              </nav>
            </div>

            {/* TECHNOLOGY */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>ARE Tech Suite</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("agent-engine")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "agent-engine" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[#D1A54A]" />
                    <span className="text-[#F5D77F] font-bold">ARE Agent Engine</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D1A54A] text-[#071522] text-[9px] font-mono font-bold">
                    1.0.0
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "tasks" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#36C2B4]" />
                    <span>Google Tasks Hub</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0B3A63] text-[#36C2B4] text-[9px] font-mono font-bold">
                    SYNC
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("automations")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "automations" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-slate-400" />
                    <span>Automation Engine</span>
                  </span>
                  {triggers.filter(t => t.isActive).length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] animate-ping" />
                  )}
                </button>
              </nav>
            </div>

            {/* COMMERCIAL PRODUCTS */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Commercial Store</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("digital-products")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "digital-products" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#D1A54A]" />
                    <span className="text-[#F5D77F] font-serif font-bold">Digital Products</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D1A54A] text-[#071522] text-[9px] font-mono font-bold">
                    STORE
                  </span>
                </button>
              </nav>
            </div>

            {/* COMPANY */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase block mb-1.5 font-bold px-1.5 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#D1A54A]" />
                <span>Company</span>
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === "overview" 
                      ? "bg-[#0B3A63] text-white border-l-4 border-[#D1A54A] shadow-sm" 
                      : "text-slate-300 hover:text-white hover:bg-[#081928]"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>Corporate Brief</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Fast Portal Triggers & Gregory Profile */}
        <div className="p-4 bg-[#081928] border-t border-[#0B3A63]/60 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("buyer")}
              className={`py-2 px-2.5 rounded-lg border text-[11px] font-serif font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "buyer"
                  ? "bg-[#0B3A63] text-white border-[#D1A54A]"
                  : "bg-[#071522] text-slate-300 border-[#0B3A63] hover:border-[#D1A54A] hover:text-white"
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#D1A54A]" />
              <span>BUYER</span>
            </button>

            <button
              onClick={() => setActiveTab("admin")}
              className={`py-2 px-2.5 rounded-lg border text-[11px] font-serif font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-[#0B3A63] text-white border-[#D1A54A]"
                  : "bg-[#071522] text-slate-300 border-[#0B3A63] hover:border-[#D1A54A] hover:text-white"
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-[#D1A54A]" />
              <span>PORTAL</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#0B3A63]/40">
            <div className="h-7 w-7 rounded bg-[#071522] border border-[#D1A54A]/50 flex items-center justify-center font-mono font-bold text-[#F5D77F] text-[10px]">
              GJ
            </div>
            <div>
              <span className="text-white block text-[11px] font-bold">Gregory Jones</span>
              <span className="text-[9px] text-[#D1A54A] block uppercase font-mono">Managing Member</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal font-serif italic text-center select-none">
            "Real Estate Builds Better People"
          </p>
        </div>
      </aside>

      {/* 2. Main Content Display Panel */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-display">
        {/* Official Algonquian Real Estate Corporate Header Bar */}
        <div 
          className="bg-[#071522] text-white border-b border-[#0B3A63]/60 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-md z-20"
          id="corporate-top-nav-bar"
        >
          {/* Left: Mobile Hamburger Trigger & Brand Logo / Ticker */}
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile drawer and quick overlay */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-[#081928] text-[#D1A54A] border border-[#0B3A63] hover:border-[#D1A54A] hover:bg-[#0B3A63] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              id="top-menu-hamburger-btn"
              aria-label="Open Navigation Menu"
              title="Open Algonquian Corporate Navigation Menu"
            >
              <Menu className="h-5 w-5 text-[#D1A54A]" />
              <span className="text-[11px] font-serif font-bold tracking-widest uppercase hidden sm:inline text-white">
                MENU
              </span>
            </button>

            {/* Logo on mobile or desktop */}
            <div className="flex items-center">
              <AlgonquianLogo variant="horizontal" theme="dark" size="sm" />
            </div>

            {/* Desktop Brand Slogan */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[#0B3A63]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D1A54A]" />
              <span className="text-xs font-serif italic text-[#F5D77F]">
                "Real Estate Builds Better People."
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                • Properties | People | Solutions
              </span>
            </div>
          </div>

          {/* Right: Direct Corporate Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("intake")}
              className="px-3 py-1.5 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold text-[11px] rounded tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
              id="top-submit-property-btn"
            >
              <span>SUBMIT PROPERTY</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("digital-products")}
              className={`px-3 py-1.5 rounded text-[11px] font-serif font-semibold transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer border ${
                activeTab === "digital-products"
                  ? "bg-[#0B3A63] text-white border-[#D1A54A]"
                  : "bg-transparent text-slate-300 hover:text-white border-slate-700 hover:border-slate-500"
              }`}
            >
              <Sparkles className="h-3 w-3 text-[#D1A54A]" />
              <span>DIGITAL PRODUCTS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("buyer")}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white text-[11px] font-serif tracking-wider uppercase transition-colors hidden md:flex items-center gap-1 cursor-pointer"
            >
              <User className="h-3 w-3 text-[#D1A54A]" />
              <span>BUYER LOGIN</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white text-[11px] font-serif tracking-wider uppercase transition-colors hidden md:flex items-center gap-1 cursor-pointer"
            >
              <Lock className="h-3 w-3 text-[#D1A54A]" />
              <span>CLIENT PORTAL</span>
            </button>
          </div>
        </div>

        {/* Dynamic HUD Workstation Status Bar */}
        <header 
          className="bg-white border-b border-slate-200 py-2.5 px-6 flex items-center justify-between shadow-2xs shrink-0"
          id="common-header"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0B2B4C]">
              <Trees className="h-3.5 w-3.5 text-[#D1A54A]" /> Algonquian Real Estate LLC
            </span>
            <span>/</span>
            <span className="text-slate-800 font-semibold uppercase">{activeTab} Workstation</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 hidden sm:inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> 
              <span>CT local: Waterbury HQ</span>
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold rounded-full text-[9px] uppercase tracking-wider inline-flex items-center gap-1 select-none">
              <ShieldCheck className="h-3 w-3 text-emerald-600" /> SOVEREIGN NODE
            </span>
          </div>
        </header>

        {/* Tab workspace with animation transitions */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto" id="main-workspace-scroll">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </main>

      {/* 3. Algonquian Navigation Menu Overlay (drawer modal for mobile & quick access) */}
      <AlgonquianNavigationMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        dealCount={deals.length}
        activeAutomationCount={triggers.filter(t => t.isActive).length}
      />
    </div>
  );
}
