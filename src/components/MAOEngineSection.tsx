/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calculator, HelpCircle, DollarSign, Activity, Percent, Shield } from "lucide-react";

export function MAOEngineSection() {
  // Simulator inputs
  const [arv, setArv] = useState<number>(450000);
  const [repairs, setRepairs] = useState<number>(55000);
  const [fee, setFee] = useState<number>(25000);
  const [ltvPercent, setLtvPercent] = useState<number>(70);
  const [holdingMonths, setHoldingMonths] = useState<number>(6);
  const [interestRate, setInterestRate] = useState<number>(10); // Private lender interest rate

  // Calculated variables
  const ltvLimit = (arv * ltvPercent) / 100;
  const maoResult = Math.max(0, Math.round(ltvLimit - repairs - fee));
  
  // Project Capital Stack Estimate
  const totalCost = maoResult + repairs;
  const standardFundingCosts = Math.round((totalCost * (interestRate / 100) * (holdingMonths / 12)));
  const holdingExp = Math.round(holdingMonths * 1200); // insurance, property tax, utilities, etc.
  const totalSponsorInvestmentAtExit = totalCost + standardFundingCosts + holdingExp;
  
  const estimatedExitSaleFee = Math.round(arv * 0.05); // 5% exit commissions & concessions
  const netEquityProfit = Math.max(0, Math.round(arv - totalSponsorInvestmentAtExit - estimatedExitSaleFee));
  
  const returnOnCapital = totalCost > 0 ? Math.round((netEquityProfit / totalCost) * 100) : 0;
  const yieldOnCost = totalSponsorInvestmentAtExit > 0 ? ((arv / totalSponsorInvestmentAtExit) * 10) : 1.1; // simulated cap/yield multiple

  // Underwriting Safety Multipliers
  let safetyVerdict = "Exceptional - Highly Secured Asset";
  let safetyColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  
  if (ltvPercent > 70 && ltvPercent <= 75) {
    safetyVerdict = "Standard Venture Risk Threshold";
    safetyColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (ltvPercent > 75) {
    safetyVerdict = "Aggressive - Marginal Comfort Zone";
    safetyColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className="space-y-6 animate-fade-in" id="mao-engine-module">
      {/* HUD Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-700" /> Algonquian MAO Underwriting System v2.0
        </h2>
        <p className="text-slate-600 text-sm">
          Enter individual transaction parameters below to calculate Maximum Allowable Offer (MAO) limits. Grounded upon the classic institutional formulation, this utility simulates debt capital hold costs and ultimate profit margins in real estate deals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Underwriting Parameters Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-sm">
          <h3 className="font-sans font-semibold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Model Variables</span>
            <span className="text-xs font-mono text-slate-400">Parameters Setup</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">After Repair Value (ARV) ($)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono">$</span>
                <input 
                  type="number" 
                  value={arv} 
                  onChange={(e) => setArv(Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Estimated appraisal threshold post full renovation.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Estimated Renovation ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono">$</span>
                  <input 
                    type="number" 
                    value={repairs} 
                    onChange={(e) => setRepairs(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Target Wholesaler Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono">$</span>
                  <input 
                    type="number" 
                    value={fee} 
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex justify-between">
                <span>Vetting LTV Multiplier</span>
                <span className="text-emerald-700 font-bold">{ltvPercent}% LTV Rule</span>
              </label>
              <input 
                type="range" 
                min="60" 
                max="85" 
                step="1"
                value={ltvPercent} 
                onChange={(e) => setLtvPercent(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Conservative (65%)</span>
                <span>Standard (70%)</span>
                <span>Aggressive (80%+)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Project Hold Duration</label>
                <select 
                  value={holdingMonths} 
                  onChange={(e) => setHoldingMonths(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold"
                >
                  <option value={3}>3 Months (Quick Flip)</option>
                  <option value={6}>6 Months (Standard Renovation)</option>
                  <option value={9}>9 Months (Complex Refurbish)</option>
                  <option value={12}>12 Months (Heavy Value-add)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Private Debt Rate</label>
                <select 
                  value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold"
                >
                  <option value={8}>8.0% Interest-Only</option>
                  <option value={10}>10.0% Interest-Only</option>
                  <option value={12}>12.0% Soft Money Rate</option>
                  <option value={14}>14.0% Hard Cash Financing</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Underwriting Output Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-slate-400">
                <Shield className="h-3.5 w-3.5 text-amber-500" /> SYSTEM RESOLUTION VERDICT
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${safetyColor}`}>
                {safetyVerdict}
              </span>
            </div>

            {/* Verdict Output Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs uppercase block">Maximum Allowable Offer (MAO)</span>
                <span className="text-4xl md:text-5xl font-mono font-bold text-amber-400 tracking-tight block">
                  ${maoResult.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block italic leading-snug">
                  * All purchase offer bids to direct sellers should rest at or below this metric to guarantee underwriting equity safety margins.
                </span>
              </div>

              {/* Graphic Indicators */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase block tracking-wider">LTV Formulation breakdown</span>
                <div className="flex justify-between text-slate-300">
                  <span>Gross LTV Limit ({ltvPercent}%):</span>
                  <span>${ltvLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Less Est. Renovation:</span>
                  <span>-${repairs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Less Target Wholsale Fee:</span>
                  <span>-${fee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-amber-400">
                  <span>Max Offer Limit:</span>
                  <span>${maoResult.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Financial modeling */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-sans font-semibold text-slate-900 text-sm inline-flex items-center gap-1.5 uppercase tracking-wide">
              <Activity className="h-4 w-4 text-emerald-800" /> Full Deal Capital Return Matrix
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block uppercase text-[9px]">Sponsor Total Exposure</span>
                <span className="font-bold text-slate-800 text-sm block">${totalSponsorInvestmentAtExit.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 block">(includes carry & debt holding cost)</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block uppercase text-[9px]">Debt Holding Interest Cost</span>
                <span className="font-bold text-red-700 text-sm block">${standardFundingCosts.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 block">({interestRate}% rate over {holdingMonths} mo)</span>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-100">
                <span className="text-emerald-800 block uppercase text-[9px]">Net Exit Equity Profit</span>
                <span className="font-bold text-emerald-800 text-sm block">${netEquityProfit.toLocaleString()}</span>
                <span className="text-[9px] text-slate-500 block">(excluding 5% dealer fees)</span>
              </div>

              <div className="p-3 bg-indigo-50 text-indigo-950 rounded-lg border border-indigo-100">
                <span className="text-indigo-800 block uppercase text-[9px]">Return on Capital (ROC)</span>
                <span className="font-bold text-indigo-800 text-sm block">{returnOnCapital}% ROI</span>
                <span className="text-[9px] text-slate-500 block">On invested capital</span>
              </div>
            </div>

            {/* Explanatory Info Alert */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
              <span>
                <strong>System Insight:</strong> This calculation sets a highly resilient threshold. By modeling holding finance costs and transaction exit fees directly, Gregory Jones' underwriting model ensures Algonquian secures the property with an operational buffer.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
