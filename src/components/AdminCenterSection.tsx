/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RealEstateDeal, FundingSource } from "../types";
import { ShieldCheck, Users, Milestone, Library, Landmark, Award, ArrowUpRight, TrendingUp } from "lucide-react";

interface AdminCenterProps {
  deals: RealEstateDeal[];
  funds: FundingSource[];
}

export function AdminCenterSection({ deals, funds }: AdminCenterProps) {
  const [managingLeader, setManagingLeader] = useState("Gregory Jones");
  const [headquarters, setHeadquarters] = useState("Waterbury, Connecticut");
  const [effectiveDate, setEffectiveDate] = useState("June 16, 2026");
  const [orgBriefVersion, setOrgBriefVersion] = useState("v2.0");

  const totalDealsCount = deals.length;
  const closedDealsVolume = deals.filter(d => d.status.includes("Funded") || d.status.includes("Closed")).reduce((acc, d) => acc + d.askingPrice, 0);
  const activePipelineVolume = deals.reduce((acc, d) => acc + d.askingPrice, 0);

  // Compute average portfolio discount to ARV
  const validArvDeals = deals.filter(d => d.arv > 0);
  const avgDiscount = validArvDeals.length > 0
    ? Math.round(
        (validArvDeals.reduce((sum, d) => sum + ((d.arv - d.askingPrice) / d.arv), 0) / validArvDeals.length) * 100
      )
    : 0;

  // Active JV Lenders total
  const fundedJVsSum = funds.reduce((acc, f) => acc + f.activeAllocated, 0);

  return (
    <div className="space-y-8 animate-fade-in" id="admin-module">
      {/* HUD metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="admin-kpis-grid">
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 block mb-1">AGGREGATE PORTFOLIO LIQUIDITY</span>
          <span className="text-2xl font-mono font-bold block">${activePipelineVolume.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 block mt-1">Across {totalDealsCount} pipeline listings</span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block mb-1">TOTAL CLOSED TRANSACTIONS</span>
          <span className="text-2xl font-mono font-bold block">${closedDealsVolume.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 block mt-1">Successfully capitalized</span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 block mb-1">AVERAGE ACQUISITION SAVINGS</span>
          <span className="text-2xl font-mono font-bold block">{avgDiscount}% Under ARV</span>
          <span className="text-[9px] text-slate-400 block mt-1">Sponsor target average {avgDiscount > 30 ? "✓ Met" : "Vetting"}</span>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">ACTIVE CAPITAL STACK</span>
          <span className="text-2xl font-mono font-bold block">${fundedJVsSum.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 block mt-1">Lent or joint-venture partners</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Gregory Jones Authoritative constant controls */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-sans font-semibold text-slate-900 inline-flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
            <ShieldCheck className="h-5 w-5 text-emerald-800" /> Algonquian Registrar & LLC Constants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wide">Managing Member & Supreme Architect</label>
              <input 
                type="text" 
                value={managingLeader} 
                onChange={(e) => setManagingLeader(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-sans font-semibold text-slate-800 text-sm"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Principal Authority Signature Constant</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wide">Principal Registered Office</label>
              <input 
                type="text" 
                value={headquarters} 
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-sans font-semibold text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wide">Effective Record Date</label>
              <input 
                type="text" 
                value={effectiveDate} 
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wide">Brief Version Control ID</label>
              <input 
                type="text" 
                value={orgBriefVersion} 
                onChange={(e) => setOrgBriefVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold text-slate-800 font-mono text-sm"
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-600/20 space-y-2 text-xs">
            <span className="font-bold text-emerald-950 block">Strategic Registrar Directive Checklist:</span>
            <div className="space-y-1 text-slate-700">
              <p>✔ Algonquian Real Estate registered active Connecticut Limited Liability Company (Feb 11, 2026).</p>
              <p>✔ Sovereign framework systems successfully designed and deployed by ARE Tech Division.</p>
              <p>✔ Primary underwriting constraints locked: MAO limit maximum set to {avgDiscount}% ARV discount multiple limit.</p>
              <p>✔ Active co-signatory limits registered to {managingLeader} with absolute operational mandate.</p>
            </div>
          </div>
        </div>

        {/* Right Executive Status Card */}
        <div className="lg:col-span-4 bg-emerald-950 p-6 rounded-xl text-white space-y-6 border border-emerald-900 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-2xl" />
          
          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase bg-emerald-900 px-2 py-0.5 rounded border border-emerald-800 inline-block font-bold">
            EXECUTIVE CREDENTIAL COUPLING
          </span>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-900 rounded-md shrink-0">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="font-sans font-bold block text-sm">Managing Member Authorization</span>
                <p className="text-xs text-emerald-200 leading-normal">
                  All contracts, property acquisitions, seller-direct capital notes, and Joint Ventures represent the direct sovereign authorize of <strong className="font-bold">{managingLeader}</strong>, Founder of ONEGODIAN™ and Supreme Architect of Sovereign Intelligence™.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-900 rounded-md shrink-0">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <span className="font-sans font-bold block text-sm">System Growth Trajectory</span>
                <p className="text-xs text-emerald-200 leading-normal">
                  Target assets under management are designed to scale to $10,000,000 within 24 months through automated deal underwriting and private mortgage capital raising channels.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-900 pt-4 text-center font-mono text-[10px] text-emerald-400 uppercase">
            REGULARITY SEAL: ARCHITECT CODE G-2026CT
          </div>
        </div>
      </div>
    </div>
  );
}
