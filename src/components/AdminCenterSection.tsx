/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RealEstateDeal, FundingSource } from "../types";
import { ShieldCheck, Award, TrendingUp, CheckCircle2 } from "lucide-react";

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
        <div className="bg-[#071522] text-white p-5 rounded-xl border border-[#0B3A63]/60 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#D1A54A]/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#D1A54A] font-bold block mb-1">
            AGGREGATE PORTFOLIO LIQUIDITY
          </span>
          <span className="text-2xl font-mono font-bold block text-white">${activePipelineVolume.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Across {totalDealsCount} pipeline listings</span>
        </div>

        <div className="bg-[#071522] text-white p-5 rounded-xl border border-[#0B3A63]/60 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#36C2B4]/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#D1A54A] font-bold block mb-1">
            TOTAL CLOSED TRANSACTIONS
          </span>
          <span className="text-2xl font-mono font-bold block text-white">${closedDealsVolume.toLocaleString()}</span>
          <span className="text-[10px] text-[#36C2B4] font-medium block mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4]" /> Capitalized & Discharged
          </span>
        </div>

        <div className="bg-[#071522] text-white p-5 rounded-xl border border-[#0B3A63]/60 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#D1A54A]/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#D1A54A] font-bold block mb-1">
            AVERAGE ACQUISITION SAVINGS
          </span>
          <span className="text-2xl font-mono font-bold block text-white">{avgDiscount}% Under ARV</span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Sponsor target average {avgDiscount > 30 ? <span className="text-[#36C2B4] font-bold">✓ Met</span> : <span className="text-[#D1A54A]">Vetting</span>}
          </span>
        </div>

        <div className="bg-[#071522] text-white p-5 rounded-xl border border-[#0B3A63]/60 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#36C2B4]/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#D1A54A] font-bold block mb-1">
            ACTIVE CAPITAL STACK
          </span>
          <span className="text-2xl font-mono font-bold block text-white">${fundedJVsSum.toLocaleString()}</span>
          <span className="text-[10px] text-[#36C2B4] font-medium block mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4]" /> Active Partner Liquidity
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Gregory Jones Authoritative constant controls */}
        <div className="lg:col-span-8 bg-[#071522] p-6 rounded-xl border border-[#0B3A63]/60 shadow-md space-y-6 text-white">
          <h2 className="text-base font-serif font-bold text-white inline-flex items-center gap-2 pb-3 border-b border-[#0B3A63]/60 w-full">
            <ShieldCheck className="h-5 w-5 text-[#36C2B4]" />
            <span className="text-[#D1A54A]">Algonquian Registrar</span> & Sovereign LLC Constants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-[#D1A54A] font-serif font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Managing Member & Supreme Architect
              </label>
              <input 
                type="text" 
                value={managingLeader} 
                onChange={(e) => setManagingLeader(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B3A63] bg-[#0B1F33] font-sans font-medium text-white text-xs focus:border-[#D1A54A] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Principal Authority Signature Constant</span>
            </div>

            <div>
              <label className="block text-[#D1A54A] font-serif font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Principal Registered Office
              </label>
              <input 
                type="text" 
                value={headquarters} 
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B3A63] bg-[#0B1F33] font-sans font-medium text-white text-xs focus:border-[#D1A54A] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Jurisdiction: Connecticut, USA</span>
            </div>

            <div>
              <label className="block text-[#D1A54A] font-serif font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Effective Record Date
              </label>
              <input 
                type="text" 
                value={effectiveDate} 
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B3A63] bg-[#0B1F33] font-mono font-medium text-white text-xs focus:border-[#D1A54A] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Incorporation Verification Anchor</span>
            </div>

            <div>
              <label className="block text-[#D1A54A] font-serif font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Brief Version Control ID
              </label>
              <input 
                type="text" 
                value={orgBriefVersion} 
                onChange={(e) => setOrgBriefVersion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B3A63] bg-[#0B1F33] font-mono font-medium text-white text-xs focus:border-[#D1A54A] focus:outline-none transition-colors"
              />
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">Release Hash Checksum Standard</span>
            </div>
          </div>

          <div className="p-4 bg-[#0B1F33] rounded-lg border border-[#0B3A63] space-y-2.5 text-xs text-slate-200">
            <span className="font-serif font-bold text-[#D1A54A] block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#36C2B4]" /> Strategic Registrar Directive Checklist
            </span>
            <div className="space-y-1.5 text-slate-300">
              <p className="flex items-start gap-2">
                <span className="text-[#36C2B4] font-bold">✓</span>
                <span>Algonquian Real Estate registered active Connecticut Limited Liability Company (Feb 11, 2026).</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#36C2B4] font-bold">✓</span>
                <span>Sovereign framework systems successfully designed and deployed by ARE Tech Division.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#36C2B4] font-bold">✓</span>
                <span>Primary underwriting constraints locked: MAO limit maximum set to {avgDiscount}% ARV discount multiple limit.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#36C2B4] font-bold">✓</span>
                <span>Active co-signatory limits registered to {managingLeader} with absolute operational mandate.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Executive Status Card */}
        <div className="lg:col-span-4 bg-[#071522] p-6 rounded-xl text-white space-y-6 border border-[#0B3A63]/60 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#D1A54A]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-[#D1A54A] uppercase bg-[#0B1F33] px-2.5 py-1 rounded border border-[#0B3A63] inline-block font-bold">
              EXECUTIVE CREDENTIAL COUPLING
            </span>
            <span className="text-[10px] font-mono text-[#36C2B4] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] animate-pulse" /> VERIFIED
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-[#0B1F33] border border-[#0B3A63] rounded-lg shrink-0 text-[#D1A54A]">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold block text-sm text-white">Managing Member Authorization</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All contracts, property acquisitions, seller-direct capital notes, and Joint Ventures represent the direct sovereign authorization of <strong className="text-[#D1A54A] font-semibold">{managingLeader}</strong>, Founder of ONEGODIAN™ and Supreme Architect of Sovereign Intelligence™.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-[#0B1F33] border border-[#0B3A63] rounded-lg shrink-0 text-[#D1A54A]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold block text-sm text-white">System Growth Trajectory</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Target assets under management are designed to scale to $10,000,000 within 24 months through automated deal underwriting and private mortgage capital raising channels.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#0B3A63]/60 pt-4 flex items-center justify-between font-mono text-[10px] text-[#D1A54A] uppercase tracking-wider">
            <span>SEAL: ARCHITECT CODE G-2026CT</span>
            <span className="text-[#36C2B4] font-bold">● ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
