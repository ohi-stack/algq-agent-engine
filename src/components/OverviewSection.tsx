/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Building2, User2, Trees, Milestone, Flame, Award, Cpu, Sparkles, ChevronRight, Layers, DollarSign, BookOpen, CheckCircle2 } from "lucide-react";
import { AlgonquianLogo, AlgonquianEmblem } from "./AlgonquianLogo";

export function OverviewSection({ 
  onNavigateToProducts, 
  onNavigateToIntake 
}: { 
  onNavigateToProducts?: () => void; 
  onNavigateToIntake?: () => void;
}) {
  return (
    <div className="space-y-8 animate-fade-in" id="overview-section">
      {/* 1. Official Corporate Brand Banner */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071522] via-[#0B2B4C] to-[#081B2E] p-8 md:p-10 text-white border border-[#D1A54A]/30 shadow-2xl"
        id="hero-header-banner"
      >
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#D1A54A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-[#1B4F8B]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <AlgonquianEmblem className="h-80 w-auto" />
        </div>
        
        <div className="relative z-10 max-w-4xl space-y-5">
          {/* Top Brand Tagline Eyebrow */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1A54A]/20 border border-[#D1A54A]/40 text-[#F5D77F] text-[11px] font-mono font-bold tracking-widest uppercase">
              <Trees className="h-3 w-3 text-[#D1A54A]" /> Sovereign Entity • Connecticut LLC
            </span>
            <span className="text-xs font-serif tracking-[0.2em] text-[#D1A54A] uppercase font-semibold">
              BUILDING VALUE. CREATING OPPORTUNITY.
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-white leading-tight">
              Algonquian Real Estate LLC
            </h1>
            <p className="text-[#D1A54A] font-serif text-lg md:text-xl font-bold tracking-wide italic">
              "Real Estate Builds Better People."
            </p>
          </div>
          
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            A technology-enabled real estate enterprise operating at the intersection of direct asset acquisition, institutional underwriting, and proprietary software infrastructure (ARE Tech). Focused on disciplined acquisitions across Connecticut municipal centers and sovereign digital products.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/60 text-sm">
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Formation Date</span>
              <span className="text-slate-100 font-semibold">February 11, 2026</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Principal Office</span>
              <span className="text-slate-100 font-semibold">Waterbury, CT</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Founder & Lead</span>
              <span className="text-slate-100 font-semibold">Gregory Jones</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Enterprise Status</span>
              <span className="text-emerald-400 font-semibold inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Active, Sovereign
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNavigateToIntake}
              className="px-4 py-2 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              id="hero-submit-prop-btn"
            >
              <span>Submit A Property</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onNavigateToProducts}
              className="px-4 py-2 bg-[#0B2B4C] hover:bg-[#071522] text-white border border-[#D1A54A]/40 font-serif font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              id="hero-explore-products-btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D1A54A]" />
              <span>Explore Digital Products</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Official Brand Taglines & Ecosystem Pillars Callout */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4" id="brand-tagline-bar">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#D1A54A] block">
              Core Brand Philosophy
            </span>
            <h2 className="text-xl font-serif font-bold text-[#0B2B4C]">
              Properties • People • Solutions • Stronger Communities
            </h2>
          </div>
          <span className="px-3 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-slate-700">
            Plan | Analyze | Execute | Grow
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-serif font-bold text-[#0B2B4C] block">Discipline Creates Opportunity</span>
            <p className="text-xs text-slate-600">Strict adherence to mathematical underwriting guidelines (MAO Formula standard) eliminates emotional speculation.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-serif font-bold text-[#0B2B4C] block">Knowledge Today</span>
            <p className="text-xs text-slate-600">Empowering real estate practitioners with bank-ready lender documentation, investment packets, and operational tools.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-serif font-bold text-[#0B2B4C] block">Real Estate Builds Better People</span>
            <p className="text-xs text-slate-600">Property stewardship creates generational equity, personal discipline, and sustainable municipal revitalization.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-serif font-bold text-[#0B2B4C] block">Sovereign Execution</span>
            <p className="text-xs text-slate-600">Deploying proprietary ARE Tech software agents, automated lead intake, and institutional offer generators.</p>
          </div>
        </div>
      </div>

      {/* 3. Leadership Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-grid">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-serif font-bold text-[#0B2B4C] inline-flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <User2 className="h-5 w-5 text-[#D1A54A]" /> Executive Leadership Profile
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>
                <strong>Gregory Jones</strong> is the Founder and Managing Member of Algonquian Real Estate LLC. He commands the company's full strategic trajectory, specializing in key property acquisitions, technology deployment, private capital formation, and long-term organizational value.
              </p>
              <blockquote className="border-l-4 border-[#D1A54A] pl-4 py-2 bg-slate-50 text-slate-800 italic font-mono rounded-r-md text-xs">
                "Gregory Jones previously served as Chief of the Indigenous Nation of Onegodia and subsequently became Founder of ONEGODIAN™ and Supreme Architect of Sovereign Intelligence™. These leadership roles contributed to the development of the organizational, technological, and strategic frameworks that inform the vision of Algonquian Real Estate LLC."
              </blockquote>
              <p>
                This profound sovereign governance background forms the bedrock of our operating policies. It equips Algonquian with a unique ability to structure highly complex, multi-party acquisitions and direct-to-seller seller financing accords with transparency, speed, and fiduciary discipline.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#0B2B4C] inline-flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <Building2 className="h-5 w-5 text-[#D1A54A]" /> Business Purpose & Core Activities
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Algonquian Real Estate LLC is developed simultaneously as an active, high-yield asset operator and a pioneering digital product infrastructure provider for the nationwide real estate markets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-2">
              {[
                "Seller-Direct & Off-Market Acquisitions",
                "Seller Financing & Creative Terms Transactions",
                "Residential & Commercial Multi-Unit Underwriting",
                "Joint Venture Partnerships & Family Office Sourcing",
                "Due Diligence Auditing & Legal Template Distribution",
                "Proprietary Real Estate Software Development (ARE Tech)"
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 font-medium text-slate-800 border border-slate-100">
                  <span className="h-5 w-5 rounded bg-[#0B2B4C] text-[#D1A54A] text-xs flex items-center justify-center font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Cards Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-[#0B2B4C] text-base inline-flex items-center gap-2">
              <Milestone className="h-4.5 w-4.5 text-[#D1A54A]" /> Strategic Dual-Vision
            </h3>
            
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-serif font-bold text-[#0B2B4C] block text-sm mb-1">01. Real Estate Operator</span>
                Direct acquisitions, strategic capital deployment, ownership, and value-add asset refurbishment in municipal centers.
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-serif font-bold text-[#D1A54A] block text-sm mb-1">02. Tech-Enabled Enterprise</span>
                Deploying and commercializing proprietary software products, deal processing engines, and transactional documents.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#071522] to-[#0B2B4C] p-6 rounded-2xl text-white space-y-4 border border-[#D1A54A]/30 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 opacity-10">
              <AlgonquianEmblem className="h-44 w-auto" />
            </div>
            
            <h3 className="font-serif font-bold text-[#D1A54A] text-base inline-flex items-center gap-2 uppercase tracking-wider font-mono">
              <Award className="h-4.5 w-4.5" /> Authority Mandate
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              "All strategic, operational, technology, acquisition, financing, and development activities ultimately report through the Managing Member, Gregory Jones."
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0B2B4C] border border-[#D1A54A] flex items-center justify-center font-bold text-[#D1A54A] text-xs shadow-md">
                GJ
              </div>
              <div>
                <p className="text-xs font-serif font-semibold text-white">Gregory Jones</p>
                <p className="text-[10px] text-[#D1A54A] uppercase font-mono">Managing Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
