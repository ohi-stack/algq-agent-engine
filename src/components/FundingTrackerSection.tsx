/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FundingSource } from "../types";
import { Landmark, Plus, Coins, HeartHandshake, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";

interface FundingTrackerProps {
  funds: FundingSource[];
  onAddFund: (fund: FundingSource) => void;
  onUpdateFundState: (id: string, updatedFields: Partial<FundingSource>) => void;
}

export function FundingTrackerSection({ funds, onAddFund, onUpdateFundState }: FundingTrackerProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Private Lender" | "Joint Venture Partner" | "Sponsor Equity" | "Institutional Debt">("Private Lender");
  const [contactPerson, setContactPerson] = useState("");
  const [maxAmount, setMaxAmount] = useState<number>(500000);
  const [targetYield, setTargetYield] = useState<number>(8.5);
  const [notes, setNotes] = useState("");

  const [allocationEdits, setAllocationEdits] = useState<{ [id: string]: number }>({});

  const totalLiquidity = funds.reduce((acc, f) => acc + (f.status === "Active" ? f.maxAmount : 0), 0);
  const totalAllocated = funds.reduce((acc, f) => acc + (f.status === "Active" ? f.activeAllocated : 0), 0);
  const allocationRatio = totalLiquidity > 0 ? (totalAllocated / totalLiquidity) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactPerson) {
      alert("Please specify a funding source name and representative contact.");
      return;
    }

    const newFund: FundingSource = {
      id: "fund-" + Date.now(),
      name,
      type,
      contactPerson,
      maxAmount,
      targetYield,
      status: "Active",
      activeAllocated: 0,
      notes: notes || "Standard capital reserves. Certified by Algonquian Real Estate LLC, Strategic Treasury."
    };

    onAddFund(newFund);
    setName("");
    setContactPerson("");
    setNotes("");
  };

  const handleAllocationChange = (id: string, value: number, max: number) => {
    if (value < 0 || value > max) return;
    onUpdateFundState(id, { activeAllocated: value });
  };

  const handleStatusToggle = (id: string, currentStatus: "Active" | "Inactive" | "Under Discussion") => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : currentStatus === "Inactive" ? "Under Discussion" : "Active";
    onUpdateFundState(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="funding-tracker-module">
      {/* HUD Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="funding-kpis">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 block uppercase font-mono text-[10px]">TOTAL DISPOSABLE LIQUIDITY</span>
            <span className="text-2xl font-mono font-bold text-slate-800">${totalLiquidity.toLocaleString()}</span>
          </div>
          <Coins className="h-8 w-8 text-emerald-800" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-slate-400 block uppercase font-mono text-[10px]">CURRENT DEBENTURE ALLOCATIONS</span>
            <span className="text-2xl font-mono font-bold text-emerald-800">${totalAllocated.toLocaleString()}</span>
          </div>
          <Landmark className="h-8 w-8 text-emerald-800" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1 w-full">
            <span className="text-slate-400 block uppercase font-mono text-[10px] flex justify-between">
              <span>TREASURY UTILIZATION</span>
              <span>{Math.round(allocationRatio)}%</span>
            </span>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-2.5 rounded-full ${allocationRatio > 75 ? "bg-amber-600" : "bg-emerald-800"}`} 
                style={{ width: `${Math.min(100, allocationRatio)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Funding Directory */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-sans font-semibold text-slate-900 text-sm pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>Corporate Capital Stack Directory</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Active debentures</span>
          </h3>

          <div className="space-y-4">
            {funds.map(fund => {
              const capRatio = fund.maxAmount > 0 ? (fund.activeAllocated / fund.maxAmount) * 100 : 0;
              return (
                <div 
                  key={fund.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-2 md:max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-slate-900 text-sm block">
                        {fund.name}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        fund.type === "Joint Venture Partner" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        fund.type === "Sponsor Equity" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        "bg-amber-100 text-amber-800 border bg-amber-50"
                      }`}>
                        {fund.type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[10px]">
                      <span>Contact: <strong>{fund.contactPerson}</strong></span>
                      <span>Target yield: <strong className="text-emerald-800">{fund.targetYield}%</strong></span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug font-sans italic">
                      "{fund.notes}"
                    </p>
                  </div>

                  <div className="space-y-2 min-w-[200px] border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">ALLOCANT:</span>
                      <span className="font-bold text-slate-700">${fund.activeAllocated.toLocaleString()} / ${fund.maxAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-800 h-1.5" style={{ width: `${Math.min(100, capRatio)}%` }} />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                      {/* Active Status Clickable Button Toggle */}
                      <button
                        onClick={() => handleStatusToggle(fund.id, fund.status)}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                          fund.status === "Active" ? "bg-emerald-950 text-white" :
                          fund.status === "Inactive" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}
                      >
                        ● {fund.status}
                      </button>

                      {/* Manual Slider custom allocation */}
                      <div className="flex items-center gap-1 w-full justify-end">
                        <span className="text-[9px] text-slate-400 uppercase">Set:</span>
                        <input 
                          type="range"
                          min="0"
                          max={fund.maxAmount}
                          step={10000}
                          value={fund.activeAllocated}
                          onChange={(e) => handleAllocationChange(fund.id, Number(e.target.value), fund.maxAmount)}
                          className="accent-emerald-700 w-20 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Funding Source Form Column */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-sans font-semibold text-slate-900 text-sm pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>Register Capital Debenture</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Capital Sourcing Entity</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hartford Merchant Trust"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Allocation Category</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-2.5 py-2 rounded bg-white border border-slate-300 text-slate-800"
                >
                  <option value="Private Lender">Private Lender</option>
                  <option value="Joint Venture Partner">Joint Venture Partner</option>
                  <option value="Sponsor Equity">Sponsor Equity</option>
                  <option value="Institutional Debt">Institutional Debt</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Entity Representative</label>
                <input 
                  type="text" 
                  value={contactPerson} 
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Total Cap Limit ($)</label>
                <input 
                  type="number" 
                  value={maxAmount} 
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Preferred Yield (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={targetYield} 
                  onChange={(e) => setTargetYield(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Add Partnership Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Details of capital covenants, lien prioritization rules..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-950 text-white font-bold hover:bg-emerald-900 rounded font-mono uppercase tracking-wider text-[11px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Inject Capital Account Sourcing
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
