/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building2, FolderKanban, Calculator, FileSignature, 
  Landmark, ShieldAlert, Layers, BookOpen, Settings2, 
  Workflow, LogOut, Clock, Trees, UserCheck, ShieldCheck
} from "lucide-react";

import { RealEstateDeal, FundingSource, AutomationTrigger, DealStatus } from "./types";
import { SEED_DEALS, SEED_FUNDS, SEED_AUTOMATIONS } from "./data";

// Component import sections
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

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  // Central Event Log trigger triggers
  const triggerSystemEvent = (eventName: string, details: any) => {
    const timestamp = new Date().toLocaleTimeString();
    let message = `[Event Raised] ${eventName}`;

    if (eventName === "ON_DEAL_INTAKE") {
      message = `[Deal Intake Hook] Sourced off-market lead "${details.address}" (${details.city}, CT). Computed MAO is $${details.mao.toLocaleString()}. Added to Pipeline.`;
      
      // Trigger correlated automations
      triggers.filter(t => t.event === "ON_DEAL_INTAKE" && t.isActive).forEach(t => {
        setAutomationLogs(prev => [
          ...prev, 
          `[Webhook Executed] SMS Alert successfully dispatched to ${t.recipient} : "New Deal Lead at ${details.address}. Asking: $${details.askingPrice.toLocaleString()}."`
        ]);
      });
    } 
    else if (eventName === "ON_OFFER_SUBMITTED") {
      message = `[Signature Engine] Digital e-signature verified! Signatory "${details.signatory}" authorized "${details.documentType}" document.`;
    }
    else if (eventName === "ON_STATUS_CHANGE") {
      message = `[CRM Pipeline Swing] Property "${details.address}" moved -> "${details.newStatus}".`;
      
      // Check for Underwriting Automation
      if (details.newStatus === DealStatus.Underwriting) {
        triggers.filter(t => t.event === "ON_STATUS_CHANGE_UNDERWRITING" && t.isActive).forEach(t => {
          setAutomationLogs(prev => [
            ...prev,
            `[Webhook Executed] Document compilation queued: LOI draft generated for ${details.address}, Owner: ${details.ownerName || "Seller"}.`
          ]);
        });
      }
      // Check for Offer Submitted
      if (details.newStatus === DealStatus.OfferSubmitted) {
        triggers.filter(t => t.event === "ON_OFFER_SUBMITTED" && t.isActive).forEach(t => {
          setAutomationLogs(prev => [
            ...prev,
            `[Webhook Executed] Partner Alert: Email dispatched to ${t.recipient} with underwriting parameters for ${details.address}.`
          ]);
        });
      }
    }

    setAutomationLogs(prev => [message, ...prev]);
  };

  // State Adjustments
  const handleAddDeal = (deal: RealEstateDeal) => {
    setDeals(prev => [deal, ...prev]);
  };

  const handleUpdateDealStatus = (id: string, newStatus: DealStatus) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;
    
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d));
    triggerSystemEvent("ON_STATUS_CHANGE", { address: deal.address, newStatus, ownerName: deal.ownerName });
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
        return <OverviewSection />;
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
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans antialiased text-slate-800" id="main-application-frame">
      {/* 1. Left Side Admin Navigation Column */}
      <aside 
        className="w-full md:w-64 bg-slate-950 text-slate-100 flex flex-col justify-between border-r border-slate-900 shadow-xl shrink-0 z-30"
        id="side-bar-navigation"
      >
        <div className="p-5 space-y-6">
          {/* Company Brand Logo Block */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-900" id="branding-panel">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-500/30 flex items-center justify-center shadow-lg font-mono text-white text-md font-bold">
              <Trees className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold block tracking-tight text-white leading-tight">Algonquian</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest block uppercase">Real Estate Suite</span>
            </div>
          </div>

          {/* Sourcing Menu Toggles */}
          <div className="space-y-4" id="nav-categories">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-2 font-bold px-1.5">
                Enterprise Core
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "overview" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4 text-emerald-55" />
                  <span>Corporate Brief</span>
                </button>

                <button
                  onClick={() => setActiveTab("admin")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "admin" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Settings2 className="h-4 w-4 text-slate-40 shrink-0" />
                  <span>Admin Command Center</span>
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block mb-2 font-bold px-1.5">
                ARE Tech Suite
              </span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("intake")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "intake" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FolderKanban className="h-4 w-4" />
                    <span>Algonquian Deal Intake</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "pipeline" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FolderKanban className="h-4 w-4" />
                    <span>Algonquian Pipeline CRM</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-905 text-[9px] font-bold">
                    {deals.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("underwriting")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "underwriting" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Calculator className="h-4 w-4 text-emerald-5" />
                  <span>Algonquian MAO Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab("offers")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "offers" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <FileSignature className="h-4 w-4 text-emerald-5" />
                  <span>Offer & Signature Engine</span>
                </button>

                <button
                  onClick={() => setActiveTab("capital")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "capital" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  <span>Algonquian Funding Tracker</span>
                </button>

                <button
                  onClick={() => setActiveTab("buyer")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "buyer" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Algonquian Buyer Portal</span>
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === "documents" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-slate-4" />
                  <span>Algonquian Doc Library</span>
                </button>

                <button
                  onClick={() => setActiveTab("automations")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeTab === "automations" 
                      ? "bg-emerald-900/60 text-white border-l-4 border-amber-400 shadow-sm" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Workflow className="h-4 w-4 text-amber-50" />
                    <span>Automation Engine</span>
                  </span>
                  {triggers.filter(t => t.isActive).length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Founder Gregory credentials tag footnote */}
        <div className="p-4 bg-slate-950 border-t border-slate-900 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-emerald-900 border border-emerald-800 flex items-center justify-center font-mono font-bold text-slate-200 text-[10px]">
              G
            </div>
            <div>
              <span className="text-slate-200 block text-[11px] font-bold">Gregory Jones</span>
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Managing Member</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 leading-normal font-mono uppercase tracking-wide border-t border-slate-900 pt-2 text-center select-none">
            Sovereign Code: ARE-v2.0
          </p>
        </div>
      </aside>

      {/* 2. Main Content Display Panel */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-display">
        {/* Dynamic HUD Header */}
        <header 
          className="bg-white border-b border-slate-200 py-3.5 px-6 flex items-center justify-between shadow-sm shrink-0"
          id="common-header"
        >
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1">
              <Trees className="h-3.5 w-3.5 text-emerald-800" /> Algonquian Real Estate LLC
            </span>
            <span>•</span>
            <span className="text-slate-800 font-semibold uppercase">{activeTab} Workstation</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> 
              <span>CT local time: 11:38 AM</span>
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold rounded-full text-[9px] uppercase tracking-wider inline-flex items-center gap-1 select-none">
              <ShieldCheck className="h-3 w-3" /> SECURED CONTAINER
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
    </div>
  );
}
