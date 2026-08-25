/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RealEstateDeal, DealStatus } from "../types";
import { PlusCircle, Calculator, FileText, Smartphone, DollarSign, Building2, User } from "lucide-react";

interface DealIntakeProps {
  onAddDeal: (deal: RealEstateDeal) => void;
  triggerSystemEvent: (eventName: string, details: any) => void;
}

export function DealIntakeSection({ onAddDeal, triggerSystemEvent }: DealIntakeProps) {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Waterbury");
  const [state, setState] = useState("CT");
  const [zipCode, setZipCode] = useState("");
  const [propertyType, setPropertyType] = useState<"Single Family" | "Multi-Family" | "Commercial" | "Land" | "Mixed-Use">("Multi-Family");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [askingPrice, setAskingPrice] = useState<number>(0);
  const [arv, setArv] = useState<number>(0);
  const [estimatedRepairs, setEstimatedRepairs] = useState<number>(0);
  const [wholesaleFee, setWholesaleFee] = useState<number>(15000);
  const [percentage, setPercentage] = useState<number>(70); // 70% rule
  const [occupancy, setOccupancy] = useState<"Owner Occupied" | "Tenant Occupied" | "Vacant" | "Abandoned">("Tenant Occupied");
  const [hasSellerFinancing, setHasSellerFinancing] = useState(false);
  
  // Seller financing fields
  const [downPayment, setDownPayment] = useState<number>(20000);
  const [interestRate, setInterestRate] = useState<number>(5.0);
  const [termMonths, setTermMonths] = useState<number>(120);

  // Computed values
  const [mao, setMao] = useState<number>(0);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [balloonPayment, setBalloonPayment] = useState<number>(0);

  // Success state
  const [submittedDeal, setSubmittedDeal] = useState<string | null>(null);

  // Handle MAO Underwriting calculation in real-time
  useEffect(() => {
    const computedMao = Math.round((arv * (percentage / 100)) - estimatedRepairs - wholesaleFee);
    setMao(computedMao > 0 ? computedMao : 0);
  }, [arv, estimatedRepairs, wholesaleFee, percentage]);

  // Handle Seller Financing Calculations
  useEffect(() => {
    if (hasSellerFinancing) {
      const loanAmt = askingPrice - downPayment;
      if (loanAmt <= 0) {
        setMonthlyPayment(0);
        setBalloonPayment(0);
        return;
      }
      // Simple annual interest interest-only schedule simulation or amortized
      const monthlyRate = (interestRate / 100) / 12;
      const payment = Math.round(loanAmt * (monthlyRate > 0 ? monthlyRate : 0.05 / 12));
      setMonthlyPayment(payment > 0 ? payment : 0);
      
      // Amortization balloon template balance
      setBalloonPayment(Math.round(loanAmt * 0.85)); // Assume 85% balloon principal remains
    }
  }, [hasSellerFinancing, askingPrice, downPayment, interestRate, termMonths]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !ownerName) {
      alert("Please provide at least a property address and owner key name.");
      return;
    }

    const newDeal: RealEstateDeal = {
      id: "deal-" + Date.now(),
      address,
      city,
      state,
      zipCode,
      propertyType,
      ownerName,
      ownerPhone: ownerPhone || "Not specified",
      ownerEmail: ownerEmail || "Not specified",
      askingPrice: Number(askingPrice),
      arv: Number(arv),
      estimatedRepairs: Number(estimatedRepairs),
      wholesaleFee: Number(wholesaleFee),
      mao,
      status: DealStatus.Intake,
      occupancy,
      hasSellerFinancing,
      notes: `Sourced direct seller via Algonquian Deal Intake. ARV assessed at $${arv} with estimated repairs of $${estimatedRepairs}. Target wholesale fee: $${wholesaleFee}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (hasSellerFinancing) {
      newDeal.sellerFinancingDetails = {
        downPayment: Number(downPayment),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        monthlyPayment,
        balloonPayment
      };
      newDeal.notes += ` Proposed seller financing: $${downPayment} down, ${interestRate}% rate, $${monthlyPayment}/mo payment, ${termMonths} mo term.`;
    }

    onAddDeal(newDeal);
    triggerSystemEvent("ON_DEAL_INTAKE", newDeal);

    // Show success feedback
    setSubmittedDeal(address);
    
    // Clear form
    setAddress("");
    setZipCode("");
    setOwnerName("");
    setOwnerPhone("");
    setOwnerEmail("");
    setAskingPrice(0);
    setArv(0);
    setEstimatedRepairs(0);
    setHasSellerFinancing(false);

    // Reset success banner after 5 seconds
    setTimeout(() => {
      setSubmittedDeal(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="deal-intake-module">
      {submittedDeal && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between shadow-sm animate-bounce" id="success-intake-alert">
          <div>
            <span className="font-bold">✓ Intake Form Certified:</span> Property at <span className="font-semibold">{submittedDeal}</span> has been ingested and ported into the Pipeline CRM (Column: "New Intake"). System triggered webhook alerts.
          </div>
          <button onClick={() => setSubmittedDeal(null)} className="text-emerald-900 font-mono text-xs hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2 pb-3 border-b border-slate-100 w-full mb-6">
            <PlusCircle className="h-5 w-5 text-emerald-700" /> Algonquian Real Estate Deal Intake Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* Address Group */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-medium mb-1.5">Property Street Address <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 52 Pine Hill Road"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-slate-800"
                  placeholder="Waterbury"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Zip Code</label>
                <input 
                  type="text" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="06702"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-slate-800"
                />
              </div>
            </div>

            {/* Property details group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Asset Classification</label>
                <select 
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800"
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Multi-Family">Multi-Family (2-4 Units)</option>
                  <option value="Commercial">Commercial / Mixed-Use</option>
                  <option value="Land">Land Parcel</option>
                  <option value="Mixed-Use">Mixed-Use</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Occupancy Status</label>
                <select 
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800"
                >
                  <option value="Owner Occupied">Owner Occupied</option>
                  <option value="Tenant Occupied">Tenant Occupied</option>
                  <option value="Vacant">Vacant Lot / Building</option>
                  <option value="Abandoned">Abandoned / Distress</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Vetting Percentage Rule</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="60" 
                    max="85" 
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-800 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded w-12 text-center">{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Seller Info Container */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-4">
              <span className="font-sans font-semibold text-slate-800 text-xs uppercase tracking-wider block inline-flex items-center gap-1">
                <User className="h-3 w-3 text-emerald-700" /> Seller & Owner Contact Dossier
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1 text-xs">Owner Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 text-xs">Owner Phone</label>
                  <input 
                    type="tel" 
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="203-555-0199"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1 text-xs">Owner Email</label>
                  <input 
                    type="email" 
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="owner@domain.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Financial Details Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Asking Price ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={askingPrice || ""}
                    onChange={(e) => setAskingPrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-700 font-medium mb-1.5">After Repair Value ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={arv || ""}
                    onChange={(e) => setArv(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Estimated Repairs ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={estimatedRepairs || ""}
                    onChange={(e) => setEstimatedRepairs(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1.5">Target Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">$</span>
                  <input 
                    type="number" 
                    value={wholesaleFee || ""}
                    onChange={(e) => setWholesaleFee(Number(e.target.value))}
                    placeholder="15000"
                    className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Seller Financing Accordion toggle */}
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-600/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Assess Seller-Direct Financing Structure?</span>
                  <span className="text-xs text-slate-600">Model down payment and term details for creative seller deals.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasSellerFinancing}
                    onChange={(e) => setHasSellerFinancing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                </label>
              </div>

              {hasSellerFinancing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-700/10 text-xs">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Proposed Down Payment ($)</label>
                    <input 
                      type="number" 
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Interest Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Term Schedule (Months)</label>
                    <input 
                      type="number" 
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submission CTA */}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-950 text-white rounded-lg font-bold hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 font-mono uppercase tracking-wider shadow-sm cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5 text-amber-400" /> Commit Asset Intake & Trigger Webhooks
            </button>
          </form>
        </div>

        {/* Live Underwriting Summary Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
            
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 inline-block">
              ARE TECH UNDERWRITING RADAR
            </span>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 block">Computed Max Allowable Offer (MAO)</span>
              <span className="text-3xl font-mono font-bold text-amber-400 tracking-tight">
                ${mao.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block">
                Rule formulation: ({percentage}% × ARV) − repairs − wholesale fee
              </span>
            </div>

            {/* Calculations Breakdown Chart Bars */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Estimated ARV:</span>
                  <span className="font-mono text-slate-100">${arv.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                  <div className="bg-emerald-500 h-2" style={{ width: arv > 0 ? "100%" : "0%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Target MAO Benchmark limit ({percentage}%):</span>
                  <span className="font-mono text-amber-400 font-bold">${mao.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-amber-400 h-2" 
                    style={{ width: arv > 0 ? `${Math.min(100, (mao / arv) * 100)}%` : "0%" }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Estimated Repairs Allocation:</span>
                  <span className="font-mono text-red-400">${estimatedRepairs.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-red-500 h-2" 
                    style={{ width: arv > 0 ? `${Math.min(100, (estimatedRepairs / arv) * 100)}%` : "0%" }} 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Target Assignment/Enterprise Fee:</span>
                  <span className="font-mono text-cyan-400">${wholesaleFee.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-2" 
                    style={{ width: arv > 0 ? `${Math.min(100, (wholesaleFee / arv) * 100)}%` : "0%" }} 
                  />
                </div>
              </div>
            </div>

            {/* Warning indicator */}
            {askingPrice > 0 && mao > 0 && askingPrice > mao && (
              <div className="p-3.5 bg-yellow-900/40 border border-yellow-700/50 rounded-lg text-yellow-200 text-xs">
                <strong>🚨 Underwriting Alert:</strong> Asking Price (${askingPrice.toLocaleString()}) exceeds our maximum allowable offer threshold (${mao.toLocaleString()}) by <strong>${(askingPrice - mao).toLocaleString()}</strong>. Negotiation of terms or creative seller financing is highly recommended.
              </div>
            )}
          </div>

          {/* Seller financing computed schedules preview */}
          {hasSellerFinancing && (
            <div className="bg-emerald-950 text-white p-5 rounded-xl border border-emerald-900 space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 block">
                CREATIVE SELLER SCHEDULE
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-300">Total Purchase:</span>
                  <span>${askingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-300">Down Payment:</span>
                  <span>${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-300">Financed Principal:</span>
                  <span className="font-bold text-amber-300">${(askingPrice - downPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-900 pb-1.5">
                  <span className="text-emerald-300">Est. Monthly P&I Interest:</span>
                  <span className="font-bold text-white">${monthlyPayment}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300">Maturity {termMonths} Mo Balloon:</span>
                  <span className="text-slate-200">${balloonPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
