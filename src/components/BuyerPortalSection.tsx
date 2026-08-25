/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RealEstateDeal, DealStatus } from "../types";
import { Search, MapPin, Building, Landmark, Percent, Layers, ShieldQuestion, HelpCircle } from "lucide-react";

interface BuyerPortalProps {
  deals: RealEstateDeal[];
}

export function BuyerPortalSection({ deals }: BuyerPortalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // Unique list of cities from existing deals
  const cities = ["All", ...Array.from(new Set(deals.map(d => d.city)))];
  const classifications = ["All", "Single Family", "Multi-Family", "Commercial", "Land", "Mixed-Use"];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deal.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === "All" || deal.city === selectedCity;
    const matchesType = selectedType === "All" || deal.propertyType === selectedType;
    
    // Only showcase active pipeline inventory that is not archived
    return matchesSearch && matchesCity && matchesType && deal.status !== DealStatus.Archived;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="buyer-portal-module">
      {/* HUD Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-700" /> Algonquian Off-Market Buyer Portal
        </h2>
        <p className="text-slate-600 text-sm">
          A secure, digital marketplace showcasing pre-underwritten equity opportunities, fully vetted rental buildings, and development properties Sourced and managed by Algonquian Real Estate LLC.
        </p>
      </div>

      {/* Filter HUD card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search address, seller, or municipal marker..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent"
          />
        </div>

        {/* City Filter */}
        <div className="w-full md:w-48 text-xs font-mono">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-slate-800 font-semibold"
          >
            {cities.map(ct => (
              <option key={ct} value={ct}>City: {ct}</option>
            ))}
          </select>
        </div>

        {/* Classification Filter */}
        <div className="w-full md:w-52 text-xs font-mono">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-slate-800 font-semibold"
          >
            {classifications.map(cl => (
              <option key={cl} value={cl}>Classification: {cl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buyer Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="buyer-catalog-grid">
        {filteredDeals.length === 0 ? (
          <div className="col-span-full h-48 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-center text-slate-400" id="buyer-empty-state">
            <ShieldQuestion className="h-10 w-10 text-slate-300 mb-2" />
            <p className="font-sans font-bold text-slate-700 text-sm">No matched inventory listings found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust search tags or property filters to view Algonquian assets.</p>
          </div>
        ) : (
          filteredDeals.map(deal => {
            // Simulated cap rate / rental yield formula based on asking price & ARV parameters
            const isCommercial = deal.propertyType === "Commercial" || deal.propertyType === "Mixed-Use";
            const estCapRate = isCommercial ? 8.4 : 9.8;
            const estMonthlyRent = Math.round(deal.arv * 0.009); // 0.9% rule of ARV
            const grossYield = deal.askingPrice > 0 ? Math.round(((estMonthlyRent * 12) / deal.askingPrice) * 100) : 10.5;

            return (
              <div 
                key={deal.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                id={`catalog-card-${deal.id}`}
              >
                {/* Visual Image Header Placeholder (Creative Pattern) */}
                <div className="h-40 bg-gradient-to-br from-slate-900 to-emerald-950 p-4 text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-600/10 rounded-full blur-2xl" />
                  
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 bg-emerald-900/80 border border-emerald-500/30 text-[9px] uppercase font-mono font-bold rounded">
                      {deal.status}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-[9px] uppercase font-mono font-bold rounded">
                      {deal.propertyType}
                    </span>
                  </div>

                  <div className="z-10 space-y-0.5">
                    <h3 className="font-sans font-bold text-sm tracking-tight inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {deal.address}
                    </h3>
                    <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider pl-4.5">
                      {deal.city}, {deal.state} {deal.zipCode}
                    </p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono border-b border-slate-100 pb-4">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase">CAP RATE</span>
                      <span className="font-bold text-emerald-800 text-xs inline-flex items-center">{estCapRate}% <Percent className="h-2.5 w-2.5" /></span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase">GROSS YIELD</span>
                      <span className="font-bold text-indigo-800 text-xs inline-flex items-center">{grossYield}% <Percent className="h-2.5 w-2.5" /></span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block text-[8px] uppercase">MTH. RENT</span>
                      <span className="font-bold text-slate-800 text-xs">${estMonthlyRent.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Vetted Underwriting Summary */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-800 uppercase text-[9px] block tracking-wider">Certified Valuations (Vetted)</span>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Underwritten ARV:</span>
                        <span className="font-bold text-slate-800">${deal.arv.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Algonquian MAO Ceiling:</span>
                        <span className="font-bold text-amber-700">${deal.mao.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Capital Funding:</span>
                        <span className="font-bold text-slate-800">${deal.askingPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-50 pt-3">
                    "{deal.notes}"
                  </p>
                </div>

                {/* Footer Request CTA */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <a 
                    href={`mailto:onegodianone@gmail.com?subject=Inquiry: Algonquian Asset Sourcing - ${deal.address}&body=Requesting full underwriting books and due diligence checklists for property at ${deal.address}, ${deal.city}, CT.`}
                    className="block w-full py-2 bg-emerald-950 text-white font-bold rounded hover:bg-emerald-900 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Request Full Due Diligence Packer
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footnote instruction */}
      <div className="p-4 bg-neutral-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
        <span>
          <strong>Co-Investment Policy:</strong> Algonquian Real Estate co-invests at least 10% principal sponsor equity in all listed commercial assets. To receive full environmental, tenant estoppel registers, and title deeds, verified buyers must proceed with certified non-disclosure protocols.
        </span>
      </div>
    </div>
  );
}
