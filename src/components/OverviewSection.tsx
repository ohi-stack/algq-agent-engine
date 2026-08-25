/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Building2, User2, Trees, Milestone, Flame, Award, Cpu } from "lucide-react";

export function OverviewSection() {
  return (
    <div className="space-y-8 animate-fade-in" id="overview-section">
      {/* Hero Banner Section */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white border border-slate-800 shadow-xl"
        id="hero-header-banner"
      >
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 bg-amber-600/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <Trees className="h-3 w-3" /> Connecticut Limited Liability Company
          </div>
          
          <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-slate-100">
            Algonquian Real Estate LLC
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
            A technology-enabled real estate enterprise. Building institutional-grade scalable systems for sourcing, underwriting, acquiring, financing, managing, and monetizing commercial and residential assets.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-sm">
            <div>
              <span className="text-slate-500 block text-xs uppercase font-mono">Formation Date</span>
              <span className="text-slate-200 font-semibold">February 11, 2026</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs uppercase font-mono">Principal Office</span>
              <span className="text-slate-200 font-semibold">Waterbury, CT</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs uppercase font-mono">Founder & Lead</span>
              <span className="text-slate-200 font-semibold">Gregory Jones</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs uppercase font-mono">Status</span>
              <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active, Sovereign
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Profile Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile-grid">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <User2 className="h-5 w-5 text-emerald-700" /> Executive Leadership Profile
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>
                <strong>Gregory Jones</strong> is the Founder and Managing Member of Algonquian Real Estate LLC. He commands the company's full strategic trajectory, specializing in key property acquisitions, technology deployment, private capital formation, and long-term organizational value.
              </p>
              <blockquote className="border-l-4 border-emerald-700 pl-4 py-1 bg-slate-50 text-slate-700 italic font-mono rounded-r-md">
                "Gregory Jones previously served as Chief of the Indigenous Nation of Onegodia and subsequently became Founder of ONEGODIAN™ and Supreme Architect of Sovereign Intelligence™. These leadership roles contributed to the development of the organizational, technological, and strategic frameworks that inform the vision of Algonquian Real Estate LLC."
              </blockquote>
              <p>
                This profound sovereign governance background forms the bedrock of our operating policies. It equips Algonquian with a unique ability to structure highly complex, multi-party acquisitions and direct-to-seller seller financing accords with transparency and absolute security.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
              <Building2 className="h-5 w-5 text-emerald-700" /> Business Purpose & Core Activities
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
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-5 font-medium text-slate-800 border border-slate-100">
                  <span className="h-5 w-5 rounded-md bg-emerald-50 text-emerald-800 text-xs flex items-center justify-center font-bold font-mono">
                    {idx + 1}
                  </span>
                  {activity}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strategic Cards Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-sans font-semibold text-slate-900 text-base inline-flex items-center gap-2">
              <Milestone className="h-4.5 w-4.5 text-amber-700" /> Strategic Dual-Vision
            </h3>
            
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                <span className="font-bold text-slate-800 block text-sm mb-1 mb-1">01. Real Estate Operator</span>
                Direct acquisitions, strategic capital deployment, ownership, and value-add asset refurbishment in municipal centers.
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200/60 shadow-sm">
                <span className="font-bold text-emerald-800 block text-sm mb-1">02. Tech-Enabled Enterprise</span>
                Deploying and commercializing proprietary software products, deal processing engines, and transactional documents.
              </div>
            </div>
          </div>

          <div className="bg-emerald-950 p-6 rounded-xl text-white space-y-4 border border-emerald-900 shadow-lg relative overflow-hidden">
            <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 opacity-10">
              <Cpu className="h-40 w-40" />
            </div>
            
            <h3 className="font-sans font-bold text-amber-400 text-base inline-flex items-center gap-2 uppercase tracking-wider font-mono">
              <Award className="h-4.5 w-4.5" /> Authority Mandate
            </h3>
            <p className="text-xs text-emerald-200 leading-relaxed font-mono">
              "All strategic, operational, technology, acquisition, financing, and development activities ultimately report through the Managing Member, Gregory Jones."
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-800/80 border border-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                GJ
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Gregory Jones</p>
                <p className="text-[10px] text-emerald-400 uppercase font-mono">Managing Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
