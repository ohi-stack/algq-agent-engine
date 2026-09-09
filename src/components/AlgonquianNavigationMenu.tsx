/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, ChevronDown, ChevronRight, User, Lock, Building2, FolderKanban, 
  Calculator, FileSignature, Landmark, BookOpen, Settings2, Workflow, 
  CheckSquare, Bot, Sparkles, Trees, ShieldCheck, ArrowRight, Home, DollarSign
} from "lucide-react";
import { AlgonquianLogo } from "./AlgonquianLogo";

export interface AlgonquianMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  dealCount?: number;
  activeAutomationCount?: number;
}

export function AlgonquianNavigationMenu({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  dealCount = 0,
  activeAutomationCount = 0
}: AlgonquianMenuProps) {
  // Accordion state for categories
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const handleNavigate = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#071522]/95 backdrop-blur-md flex flex-col text-white animate-fade-in"
      id="algonquian-mobile-menu-overlay"
    >
      {/* 1. Top Header: Submit A Property Button & Close X */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#0B3A63]/60 max-w-2xl mx-auto w-full">
        <button
          type="button"
          onClick={() => handleNavigate("intake")}
          className="px-4 py-2 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold text-xs sm:text-sm rounded-lg tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
          id="menu-submit-property-btn"
        >
          <span>SUBMIT A PROPERTY</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-xl bg-[#081928] border border-[#0B3A63] text-slate-300 hover:text-white hover:border-[#D1A54A] transition-all cursor-pointer shadow-sm"
          aria-label="Close menu"
          id="menu-close-btn"
        >
          <X className="h-6 w-6 text-[#D1A54A]" />
        </button>
      </div>

      {/* 2. Brand Identity Lockup */}
      <div className="py-6 px-4 flex flex-col items-center justify-center text-center border-b border-[#0B3A63]/40">
        <AlgonquianLogo variant="full" theme="dark" size="lg" />
        <p className="mt-2 text-xs font-serif italic text-[#D1A54A] tracking-wide">
          "Real Estate Builds Better People."
        </p>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
          Properties • People • Solutions • Stronger Communities
        </span>
      </div>

      {/* 3. Canonical Corporate Navigation Accordion List (matching official site structure) */}
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-2xl mx-auto w-full space-y-2">
        {/* OWNERS */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("OWNERS")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Home className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>OWNERS</span>
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                expandedSection === "OWNERS" ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          {expandedSection === "OWNERS" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("intake")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "intake" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Submit A Property (Direct Intake)</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("underwriting")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "underwriting" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Seller Financing & Terms Assessment</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          )}
        </div>

        {/* ACQUISITIONS */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("ACQUISITIONS")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <FolderKanban className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>ACQUISITIONS</span>
            </span>
            <div className="flex items-center gap-2">
              {dealCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#36C2B4]/20 border border-[#36C2B4]/50 text-[#36C2B4] text-[10px] font-mono font-bold">
                  {dealCount} Deals
                </span>
              )}
              <ChevronDown 
                className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                  expandedSection === "ACQUISITIONS" ? "rotate-180" : ""
                }`} 
              />
            </div>
          </button>
          
          {expandedSection === "ACQUISITIONS" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("pipeline")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "pipeline" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Deal Pipeline CRM (7 Stages)</span>
                <span className="text-[#D1A54A] font-mono font-bold text-[10px]">{dealCount} Active</span>
              </button>
              <button
                onClick={() => handleNavigate("underwriting")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "underwriting" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Instant MAO Underwriting Engine</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("offers")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "offers" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Institutional Offer Generator</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          )}
        </div>

        {/* INVESTORS */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("INVESTORS")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Landmark className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>INVESTORS</span>
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                expandedSection === "INVESTORS" ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          {expandedSection === "INVESTORS" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("capital")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "capital" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Algonquian Funding Tracker</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("buyer")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "buyer" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Buyer Portal & Vetted Deal Flow</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          )}
        </div>

        {/* SERVICES */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("SERVICES")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>SERVICES</span>
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                expandedSection === "SERVICES" ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          {expandedSection === "SERVICES" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("documents")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "documents" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Transactional Document Library</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("underwriting")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "underwriting" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Due Diligence & MAO Calculator</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          )}
        </div>

        {/* TECHNOLOGY */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("TECHNOLOGY")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Bot className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>TECHNOLOGY (ARE TECH)</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#D1A54A] text-[#071522] text-[9px] font-mono font-bold">
                ARE v2.5
              </span>
              <ChevronDown 
                className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                  expandedSection === "TECHNOLOGY" ? "rotate-180" : ""
                }`} 
              />
            </div>
          </button>
          
          {expandedSection === "TECHNOLOGY" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("agent-engine")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "agent-engine" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span className="text-[#F5D77F] font-semibold">ARE Agent Engine (Sovereign AI)</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("tasks")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "tasks" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Google Tasks Real Estate Hub</span>
                <span className="text-[#36C2B4] font-mono text-[10px]">SYNC</span>
              </button>
              <button
                onClick={() => handleNavigate("automations")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "automations" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Automation Workflow Engine</span>
                {activeAutomationCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-[#36C2B4] animate-pulse" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* DIGITAL PRODUCTS */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => handleNavigate("digital-products")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-[#F5D77F] hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>DIGITAL PRODUCTS</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#D1A54A] text-[#071522] text-[10px] font-mono font-bold uppercase">
              Store
            </span>
          </button>
        </div>

        {/* COMPANY */}
        <div className="border-b border-[#0B3A63]/40 pb-2">
          <button
            type="button"
            onClick={() => toggleSection("COMPANY")}
            className="w-full py-3 flex items-center justify-between text-left text-base sm:text-lg font-serif font-bold tracking-widest text-slate-100 hover:text-[#D1A54A] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Building2 className="h-4.5 w-4.5 text-[#D1A54A]" />
              <span>COMPANY</span>
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-[#D1A54A] transition-transform duration-200 ${
                expandedSection === "COMPANY" ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          {expandedSection === "COMPANY" && (
            <div className="pl-7 pr-2 pb-3 pt-1 space-y-2 text-sm">
              <button
                onClick={() => handleNavigate("overview")}
                className={`w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs font-medium transition-colors ${
                  activeTab === "overview" ? "bg-[#0B3A63] text-white font-bold" : "text-slate-300 hover:bg-[#081928] hover:text-white"
                }`}
              >
                <span>Corporate Brief & Dual-Vision</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
              <button
                onClick={() => handleNavigate("overview")}
                className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-xs text-slate-300 hover:bg-[#081928] hover:text-white transition-colors"
              >
                <span>Managing Member: Gregory Jones</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Prominent Rounded Action Buttons (as seen in IMG_4146.jpeg) */}
      <div className="p-6 max-w-2xl mx-auto w-full space-y-3">
        <button
          type="button"
          onClick={() => handleNavigate("buyer")}
          className="w-full py-3 px-5 rounded-xl bg-[#081928] hover:bg-[#0B3A63] border border-[#0B3A63] hover:border-[#D1A54A] text-white font-serif font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
          id="menu-buyer-login-btn"
        >
          <User className="h-4.5 w-4.5 text-[#D1A54A]" />
          <span>BUYER LOGIN</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("admin")}
          className="w-full py-3 px-5 rounded-xl bg-[#081928] hover:bg-[#0B3A63] border border-[#0B3A63] hover:border-[#D1A54A] text-white font-serif font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
          id="menu-client-portal-btn"
        >
          <Lock className="h-4.5 w-4.5 text-[#D1A54A]" />
          <span>CLIENT PORTAL</span>
        </button>

        {/* Corporate Accreditation Footnote */}
        <div className="pt-4 text-center space-y-1">
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
            Algonquian Real Estate LLC • Connecticut Formation 2026
          </p>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[#36C2B4] font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] animate-pulse" />
            Sovereign Architecture Active
          </span>
        </div>
      </div>
    </div>
  );
}
