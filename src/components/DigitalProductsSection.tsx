/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, Download, CheckCircle2, ShieldCheck, DollarSign, 
  BarChart3, Layers, BookOpen, Calculator, Sparkles, ExternalLink,
  ChevronRight, Building, Award, ArrowUpRight, Copy, Check
} from "lucide-react";
import { AlgonquianLogo, AlgonquianEmblem } from "./AlgonquianLogo";

export function DigitalProductsSection({ onNavigateToIntake }: { onNavigateToIntake?: () => void }) {
  const [activePackageTab, setActivePackageTab] = useState<"lender" | "investor" | "tools">("investor");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadSample = (title: string, contentStr: string) => {
    const blob = new Blob([contentStr], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_sample.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice(`Sample specification for "${title}" generated and downloaded.`);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleCopySpec = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="digital-products-hub">
      {/* 1. Official Brand Header Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071522] via-[#0B2B4C] to-[#0A1E33] p-8 md:p-10 text-white border border-[#D1A54A]/30 shadow-2xl"
        id="digital-products-hero"
      >
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <AlgonquianEmblem className="h-96 w-auto" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Top Brand Tagline Eyebrow */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#D1A54A]/20 border border-[#D1A54A]/50 text-[#F5D77F] text-[11px] font-mono font-bold tracking-widest uppercase inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#D1A54A]" /> ARE Tech Digital Products
            </span>
            <span className="text-xs font-serif tracking-[0.2em] text-slate-300 uppercase">
              PLAN | ANALYZE | EXECUTE | GROW
            </span>
          </div>

          {/* Main Title & Description */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-white leading-tight">
              DIGITAL PRODUCTS
            </h1>
            <p className="text-[#D1A54A] font-serif text-lg font-semibold tracking-wide">
              Downloadable templates, guides, calculators, and operational tools for real estate work.
            </p>
          </div>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            Algonquian Real Estate LLC packages proprietary institutional underwriting systems, lender presentation decks, and deal evaluation tools developed for Connecticut and nationwide acquisitions.
          </p>

          {/* Official Core Brand Mottos Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-700/60 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[#071522]/80 border border-[#D1A54A]/20">
              <span className="text-[#D1A54A] font-bold block text-[10px] uppercase">Corporate Mantra</span>
              <span className="text-white font-serif font-bold text-xs tracking-wider">Real Estate Builds Better People.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071522]/80 border border-[#D1A54A]/20">
              <span className="text-[#D1A54A] font-bold block text-[10px] uppercase">Mission Focus</span>
              <span className="text-white font-medium text-xs">Stronger Communities</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071522]/80 border border-[#D1A54A]/20">
              <span className="text-[#D1A54A] font-bold block text-[10px] uppercase">Guiding Formula</span>
              <span className="text-white font-medium text-xs">Discipline Plans Executes</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#071522]/80 border border-[#D1A54A]/20">
              <span className="text-[#D1A54A] font-bold block text-[10px] uppercase">Value Delivery</span>
              <span className="text-white font-medium text-xs">Knowledge Today</span>
            </div>
          </div>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{downloadNotice}</span>
          </div>
          <span className="text-xs text-emerald-300 font-mono">Algonquian Real Estate Repository</span>
        </div>
      )}

      {/* 2. The 4 Operational Pillars (Templates, Guides, Calculators, Toolkits) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="brand-pillars">
        {[
          {
            title: "TEMPLATES",
            subtitle: "Save time. Do it right.",
            desc: "Legally reviewed LOIs, Assignment Contracts, Seller Financing Term Sheets, and Master Purchase Agreements.",
            icon: FileText,
            color: "border-blue-500/30 text-blue-400"
          },
          {
            title: "GUIDES",
            subtitle: "Practical knowledge.",
            desc: "Property Planning, Municipal Permitting, Tenant Estoppel Audits, and Off-Market Negotiation roadmaps.",
            icon: BookOpen,
            color: "border-amber-500/30 text-amber-400"
          },
          {
            title: "CALCULATORS",
            subtitle: "Analyze with confidence.",
            desc: "Institutional MAO Engines, Multi-Unit Cash Flow Projections, Cap Rate Matrix, and Rehab Cost estimators.",
            icon: Calculator,
            color: "border-emerald-500/30 text-emerald-400"
          },
          {
            title: "TOOLKITS",
            subtitle: "Real tools. Real results.",
            desc: "Complete Investor Toolkits, Maintenance Inspection Checklists, and Lender Presentation binders.",
            icon: Layers,
            color: "border-[#D1A54A]/30 text-[#D1A54A]"
          }
        ].map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-[#D1A54A] transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-[#0B2B4C] group-hover:text-[#D1A54A] transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Pillar 0{idx + 1}</span>
              </div>
              <h3 className="font-serif font-bold text-slate-900 tracking-wider text-base">{pillar.title}</h3>
              <p className="text-xs font-semibold text-[#B8860B] mb-2">{pillar.subtitle}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Package Selector & Showcase Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="package-showcase">
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            onClick={() => setActivePackageTab("investor")}
            className={`px-4 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activePackageTab === "investor"
                ? "bg-[#0B2B4C] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Layers className="h-4 w-4 text-[#D1A54A]" />
            <span>Enhanced Investor Deal Package ($249.00)</span>
          </button>

          <button
            onClick={() => setActivePackageTab("lender")}
            className={`px-4 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activePackageTab === "lender"
                ? "bg-[#0B2B4C] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Building className="h-4 w-4 text-[#D1A54A]" />
            <span>Capital / Lender Documentation Package ($995.00)</span>
          </button>

          <button
            onClick={() => setActivePackageTab("tools")}
            className={`px-4 py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activePackageTab === "tools"
                ? "bg-[#0B2B4C] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Calculator className="h-4 w-4 text-[#D1A54A]" />
            <span>Worksheets, Checklists & Toolkits</span>
          </button>
        </div>

        {/* Tab Content 1: Enhanced Investor Deal Package ($249.00) */}
        {activePackageTab === "investor" && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase font-mono">
                  <Award className="h-3.5 w-3.5 text-[#B8860B]" /> Institutional Investor Grade
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Enhanced Investor Deal Package
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  <strong>Expanded investor-facing deal package with deeper property and underwriting detail.</strong> Crafted to provide accredited partners, private equity syndicators, and high-net-worth individuals with institutional transparency.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                  <span>✓ Deeper Insight</span>
                  <span>✓ Greater Confidence</span>
                  <span>✓ More Data</span>
                  <span>✓ Stronger Returns</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#071522] to-[#0B2B4C] text-white border border-[#D1A54A]/40 text-center min-w-[240px] shadow-lg">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D1A54A] font-bold block mb-1">
                  Digital Download
                </span>
                <span className="text-4xl font-serif font-black text-white block">$249.00</span>
                <span className="text-[11px] text-slate-300 block mb-4">One-Time License & Templates</span>
                <button
                  type="button"
                  onClick={() => handleDownloadSample(
                    "Algonquian_Enhanced_Investor_Deal_Package",
                    `ALGONQUIAN REAL ESTATE, LLC
ENHANCED INVESTOR DEAL PACKAGE SPECIFICATION
==================================================
Corporate Motto: "Real Estate Builds Better People."
Plan | Analyze | Execute | Grow
Contact: deals@algonquianre.com | Gregory Jones, Managing Member

PACKAGE CONTENTS:
1. Investment Overview (Strategy, Value-Add Potential, Exit Scenarios)
2. Financial Analysis (Purchase Price, Rehab Budget, Stabilized ARV, NOI, Cash-on-Cash)
3. Property Details (Zoning, Lot Metrics, Condition Audit, Comparables)
4. Rent Roll & Income Matrix (Unit-by-Unit Schedules, Pro Forma)
5. Underwriting & Sensitivity Scenarios (Base, Optimistic, Conservative Stress Tests)
`
                  )}
                  className="w-full py-2.5 px-4 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Spec / Package</span>
                </button>
              </div>
            </div>

            {/* 5 Core Components Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  title: "Investment Overview",
                  points: ["Property Summary", "Key Highlights", "Investment Strategy", "Value-Add Potential", "Exit Considerations"]
                },
                {
                  title: "Financial Analysis",
                  points: ["Purchase Price & Rehab", "Stabilized ARV & NOI", "Cap Rate & Cash-on-Cash", "DSCR (Stabilized)", "5-Year Cash Flow Matrix"]
                },
                {
                  title: "Property Details",
                  points: ["Location Overview", "Lot & Building Details", "Zoning & Municipal Code", "Condition Assessment", "Comparables Intelligence"]
                },
                {
                  title: "Rent Roll & Income",
                  points: ["Unit-by-Unit Beds/Baths", "Current In-Place Rents", "Pro Forma Market Rents", "Gross Annualized Income", "Tenant Lease Terms"]
                },
                {
                  title: "Underwriting & Scenarios",
                  points: ["Base Case Assumptions", "Value-Add Scenarios", "Conservative Sensitivity", "CapEx & Expense Reserves", "Risk Factor Matrix"]
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-[#0B2B4C] text-[#D1A54A] text-[10px] font-mono font-bold flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-xs text-slate-900 leading-snug">{item.title}</h4>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Underwriting Standards */}
            <div className="p-5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[#D1A54A] font-serif font-bold text-xs uppercase tracking-widest">
                  Underwriting Standard
                </span>
                <p className="text-xs text-slate-300">
                  Every Algonquian Investor Package follows strict MAO discipline: <code>MAO = (ARV × 70%) - Repairs - Wholesale Fee</code>.
                </p>
              </div>
              <button
                onClick={onNavigateToIntake}
                className="px-4 py-2 bg-[#0B3A63] hover:bg-[#071522] text-white border border-[#D1A54A]/30 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <span>Submit Property For Underwriting</span>
                <ChevronRight className="h-3.5 w-3.5 text-[#D1A54A]" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: Capital / Lender Documentation Package ($995.00) */}
        {activePackageTab === "lender" && (
          <div className="p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold uppercase font-mono">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-700" /> Bank & CDFI Institutional Grade
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                  Capital / Lender Documentation Package
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  <strong>Institutional, bank-ready materials for commercial lenders, CDFIs, and seller-financing presentations.</strong>
                  Engineered to satisfy bank loan committee mandates, underwriter stress tests, and bridge financing covenants.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                  <span>PREPARE</span>
                  <span>•</span>
                  <span>PRESENT</span>
                  <span>•</span>
                  <span>FINANCE</span>
                  <span>•</span>
                  <span>BUILD</span>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#071522] to-[#0B2B4C] text-white border border-[#D1A54A]/40 text-center min-w-[240px] shadow-lg">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D1A54A] font-bold block mb-1">
                  Institutional Suite
                </span>
                <span className="text-4xl font-serif font-black text-white block">$995.00</span>
                <span className="text-[11px] text-slate-300 block mb-4">Full Document & Financial Model</span>
                <button
                  type="button"
                  onClick={() => handleDownloadSample(
                    "Algonquian_Capital_Lender_Documentation_Package",
                    `ALGONQUIAN REAL ESTATE, LLC
CAPITAL & LENDER DOCUMENTATION PACKAGE (INSTITUTIONAL GRADE)
============================================================
"REAL ESTATE BUILDS BETTER PEOPLE."
Principal Office: Waterbury, CT | Gregory Jones, Managing Member

DOCUMENTATION SUITE:
1. OPERATING PLAN: Clear strategy, milestone calendar, scope of work, budget allocation.
2. RISK REVIEW: Risk identification, environmental audit checklist, mitigation strategy.
3. DUE DILIGENCE PACKAGE: Title review, municipal liens check, property records, lease audit.
4. LENDER PRESENTATION: Executive investment thesis, DSCR (1.42+), LTV covenants, sponsor resume.
5. SOURCES & USES SCHEDULE: Senior debt, mezzanine, sponsor equity, reserves breakdown.
6. 10-YEAR PRO FORMA & STRESS TESTING: Vacancy sensitivity, interest rate escalations.
`
                  )}
                  className="w-full py-2.5 px-4 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Package Spec</span>
                </button>
              </div>
            </div>

            {/* 4 Lender Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Operating Plan",
                  desc: "Clear strategy. Real execution.",
                  points: ["Phased renovation timeline", "Contractor bidding criteria", "Asset stabilization path", "Property management integration"]
                },
                {
                  title: "Risk Review",
                  desc: "Identify risk. Build confidence.",
                  points: ["Environmental & flood assessment", "Tenant default mitigations", "Municipal code compliance", "Interest rate buffer modeling"]
                },
                {
                  title: "Due Diligence",
                  desc: "Thorough analysis. Fewer surprises.",
                  points: ["Title search & lien audit", "Zoning variance documentation", "Tax assessment history", "Utility and MEP engineering"]
                },
                {
                  title: "Lender Presentation",
                  desc: "Compelling materials. Greater capital access.",
                  points: ["Sponsor bio & past track record", "Underwriting summary (DSCR 1.42+)", "Sources and uses breakdown", "Loan exit & refinancing strategy"]
                }
              ].map((mod, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="h-8 w-8 rounded-lg bg-[#0B2B4C] text-[#D1A54A] flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">{mod.title}</h4>
                    <p className="text-[11px] text-[#B8860B] font-semibold">{mod.desc}</p>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {mod.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Worksheets, Checklists & Toolkits */}
        {activePackageTab === "tools" && (
          <div className="p-6 md:p-8 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">
                Individual Worksheets, Checklists & Operational Guides
              </h3>
              <p className="text-xs text-slate-500">
                Directly from the Algonquian Real Estate digital catalog featured in the official brand release.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: "acq-worksheet",
                  title: "Acquisition Criteria Worksheet",
                  category: "Underwriting",
                  tag: "Free Resource",
                  desc: "Define your market, set investment criteria, evaluate multi-family opportunities, and standardize buy-box thresholds.",
                  sample: "ALGONQUIAN ACQUISITION CRITERIA: Target Cap Rate: 8.5%+, Min Cash-on-Cash: 12%, MAO Formula Standard: 70% of ARV."
                },
                {
                  id: "prop-options",
                  title: "Property Options Worksheet",
                  category: "Deal Structuring",
                  tag: "Templates",
                  desc: "Compare wholesale, BRRRR, fix-and-flip, and seller financing options side-by-side on any Connecticut property.",
                  sample: "ALGONQUIAN PROPERTY OPTIONS MATRIX: Direct Acquisition vs Wholesale vs Seller Financing Accord comparison sheet."
                },
                {
                  id: "maint-checklist",
                  title: "Maintenance & Inspection Checklist",
                  category: "Operations",
                  tag: "Checklists",
                  desc: "Prevent unexpected CapEx, inspect roofs, plumbing, electrical, and foundations, and protect long-term equity.",
                  sample: "ALGONQUIAN 85-POINT PROPERTY INSPECTION: Structural, Roof, HVAC, Electrical, Plumbing, Fire Code."
                },
                {
                  id: "investor-toolkit",
                  title: "Investor Toolkit",
                  category: "Toolkits",
                  tag: "Best Practices",
                  desc: "Comprehensive starter pack containing cold outreach scripts, credibility book templates, and follow-up flows.",
                  sample: "ALGONQUIAN INVESTOR TOOLKIT: Cold lead script, credibility slide deck, joint venture operating agreement draft."
                },
                {
                  id: "seller-finance-terms",
                  title: "Seller Financing Term Sheet Template",
                  category: "Finance",
                  tag: "Legal Template",
                  desc: "Professional institutional term sheet: interest rate, amortization schedule, balloon terms, and default covenants.",
                  sample: "ALGONQUIAN PROMISSORY NOTE & DEED OF TRUST: Principal, Amortization (30-year schedule), 5-year balloon clause."
                },
                {
                  id: "prop-planning-guide",
                  title: "Property Planning Guide",
                  category: "Strategy",
                  tag: "Guides",
                  desc: "Set strategic 5-year portfolio milestones, structure tax-advantaged holding entities, and build generational wealth.",
                  sample: "ALGONQUIAN STRATEGIC PROPERTY PLANNING: LLC structuring, municipal tax strategies, portfolio stabilization."
                }
              ].map((tool) => (
                <div key={tool.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#0B3A63] bg-blue-100 px-2 py-0.5 rounded">
                        {tool.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{tool.tag}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">{tool.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{tool.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleCopySpec(tool.id, tool.sample)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === tool.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedIndex === tool.id ? "Copied" : "Copy Content"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadSample(tool.title, tool.sample)}
                      className="px-2.5 py-1 bg-[#0B2B4C] hover:bg-[#071522] text-white rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Audience Alignment Footer Section (Property Owners, Investors, Operations, ARE Tech) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#071522] via-[#0B2B4C] to-[#0A1E33] text-white border border-[#D1A54A]/30">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D1A54A] font-bold">
            Real Estate Creates Opportunity
          </span>
          <h3 className="font-serif font-bold text-xl text-white">
            Solutions Built for the Entire Real Estate Ecosystem
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg font-serif font-bold text-white block">Property Owners</span>
            <span className="text-xs text-[#D1A54A] font-mono uppercase font-bold tracking-wider">Maximize Value</span>
            <p className="text-[11px] text-slate-300 mt-2">Transparent valuations, creative terms, and rapid execution on off-market assets.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg font-serif font-bold text-white block">Investors</span>
            <span className="text-xs text-[#D1A54A] font-mono uppercase font-bold tracking-wider">Build Wealth</span>
            <p className="text-[11px] text-slate-300 mt-2">Underwritten cash-flowing deals, deep data transparency, and stable yields.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg font-serif font-bold text-white block">Operations</span>
            <span className="text-xs text-[#D1A54A] font-mono uppercase font-bold tracking-wider">Drive Efficiency</span>
            <p className="text-[11px] text-slate-300 mt-2">Checklists, workflows, and automated pipeline CRM management systems.</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg font-serif font-bold text-white block">ARE Tech</span>
            <span className="text-xs text-[#D1A54A] font-mono uppercase font-bold tracking-wider">Innovate For Impact</span>
            <p className="text-[11px] text-slate-300 mt-2">Autonomous multi-agent engines, algorithmic MAO calculators, and cloud workflows.</p>
          </div>
        </div>

        {/* Corporate Sign-off Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-mono">
          <span className="flex items-center gap-2">
            <AlgonquianEmblem className="h-4 w-auto" />
            <span>Algonquian Real Estate LLC • Founded by Gregory Jones</span>
          </span>
          <span className="text-[#D1A54A] font-serif font-bold tracking-wider">
            "REAL ESTATE BUILDS BETTER PEOPLE."
          </span>
        </div>
      </div>
    </div>
  );
}
