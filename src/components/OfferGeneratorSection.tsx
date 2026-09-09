/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RealEstateDeal, DocTemplate, FolderCategory } from "../types";
import { FileDown, Printer, Check, Copy, RefreshCw, Signature, FileText } from "lucide-react";
import { SEED_TEMPLATES } from "../data";

interface OfferGeneratorProps {
  deals: RealEstateDeal[];
  triggerSystemEvent: (eventName: string, details: any) => void;
}

export function OfferGeneratorSection({ deals, triggerSystemEvent }: OfferGeneratorProps) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [paymentTerms, setPaymentTerms] = useState<string>("All cash closing within 15 days of Title inspection clears.");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("temp-loi");
  const [eSignature, setESignature] = useState<string>("Gregory Jones");
  const [compiledContent, setCompiledContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [signed, setSigned] = useState<boolean>(false);

  // Sync inputs when selected deal changes
  useEffect(() => {
    const deal = deals.find(d => d.id === selectedDealId);
    if (deal) {
      setCustomPrice(deal.mao || deal.askingPrice);
      if (deal.hasSellerFinancing && deal.sellerFinancingDetails) {
        const details = deal.sellerFinancingDetails;
        setPaymentTerms(
          `Seller financing terms: purchase price of $${deal.askingPrice.toLocaleString()} with $${details.downPayment.toLocaleString()} down payment, principal of $${(deal.askingPrice - details.downPayment).toLocaleString()} carried at ${details.interestRate}% interest-only over a term of ${details.termMonths} months, with interest payments of $${details.monthlyPayment}/mo and balloon at completion.`
        );
      } else {
        setPaymentTerms(`Cash purchase offer. Initial deposit of 5% of purchase price, with remaining balance to be fully funded at closing.`);
      }
    }
  }, [selectedDealId, deals]);

  // Compile template text in real-time
  useEffect(() => {
    const deal = deals.find(d => d.id === selectedDealId);
    const template = SEED_TEMPLATES.find(t => t.id === selectedTemplateId);
    
    if (!deal || !template) {
      setCompiledContent("Please select a property and template to compile.");
      return;
    }

    let raw = template.content;
    const loanAmt = Math.max(0, customPrice - (deal.sellerFinancingDetails?.downPayment || 20000));
    
    // Perform dynamic string substitutions
    raw = raw.replace(/\[OwnerName\]/g, deal.ownerName || "Seller");
    raw = raw.replace(/\[Address\]/g, deal.address);
    raw = raw.replace(/\[City\]/g, deal.city);
    raw = raw.replace(/\[State\]/g, deal.state);
    raw = raw.replace(/\[ZipCode\]/g, deal.zipCode);
    raw = raw.replace(/\[Price\]/g, customPrice.toLocaleString());
    raw = raw.replace(/\[PaymentTerms\]/g, paymentTerms);
    raw = raw.replace(/\[LoanAmount\]/g, loanAmt.toLocaleString());
    raw = raw.replace(/\[DownPayment\]/g, (deal.sellerFinancingDetails?.downPayment || 20000).toLocaleString());
    raw = raw.replace(/\[InterestRate\]/g, (deal.sellerFinancingDetails?.interestRate || 5).toString());
    raw = raw.replace(/\[MonthlyPayment\]/g, (deal.sellerFinancingDetails?.monthlyPayment || 1800).toLocaleString());
    raw = raw.replace(/\[BalloonPayment\]/g, (deal.sellerFinancingDetails?.balloonPayment || 180000).toLocaleString());
    raw = raw.replace(/\[TermMonths\]/g, (deal.sellerFinancingDetails?.termMonths || 120).toString());
    raw = raw.replace(/GREGORY JONES/g, eSignature.toUpperCase());

    setCompiledContent(raw);
  }, [selectedDealId, selectedTemplateId, customPrice, paymentTerms, eSignature, deals]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSign = () => {
    setSigned(true);
    const deal = deals.find(d => d.id === selectedDealId);
    triggerSystemEvent("ON_OFFER_SUBMITTED", {
      dealId: deal?.id,
      address: deal?.address,
      signatory: eSignature,
      documentType: SEED_TEMPLATES.find(t => t.id === selectedTemplateId)?.title
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="offer-generator-module">
      {/* Title HUD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-700" /> Algonquian Offer & Contract Generator
        </h2>
        <p className="text-slate-600 text-sm">
          Select target properties from active pipeline sources to generate customized, legally formatted documents. Utilize the integrated PDF & Signature Engine to authenticate e-signatures for official submission workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Document Configuration Parameters */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 space-y-5 shadow-sm">
          <h3 className="font-sans font-semibold text-slate-900 text-sm pb-1.5 border-b border-slate-100 uppercase tracking-wide">
            Configuration Panel
          </h3>

          <div className="space-y-4 text-xs">
            {/* Property Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Target Acquisition Asset</label>
              <select 
                value={selectedDealId}
                onChange={(e) => {
                  setSelectedDealId(e.target.value);
                  setSigned(false);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold"
              >
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.address} ({deal.city}, CT)
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Legal Template Model</label>
              <select 
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setSigned(false);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold"
              >
                {SEED_TEMPLATES.map(temp => (
                  <option key={temp.id} value={temp.id}>{temp.title}</option>
                ))}
              </select>
            </div>

            {/* Price Override */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Purchase Price Value ($)</label>
              <input 
                type="number"
                value={customPrice || ""}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Adjust the offer price. Defaults to the pre-underwritten MAO.</span>
            </div>

            {/* Amortization terms customizer */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Payment Allocations Narrative</label>
              <textarea 
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono text-[10px] leading-relaxed focus:ring-emerald-700"
              />
            </div>

            {/* Signatory Input */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Representative E-Signatory</label>
              <input 
                type="text"
                value={eSignature}
                onChange={(e) => {
                  setESignature(e.target.value);
                  setSigned(false);
                }}
                placeholder="Gregory Jones"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Real-time PDF Document Display & Signature Engine */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase px-2 inline-flex items-center gap-1">
              <Signature className="h-3.5 w-3.5 text-emerald-800" /> Interactive Document Sheet
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy Plain"}
              </button>

              <button
                onClick={handlePrint}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <Printer className="h-3 w-3" /> Print PDF
              </button>
            </div>
          </div>

          {/* Legal Canvas Layout */}
          <div className="flex-1 bg-white border-2 border-slate-300 rounded-xl p-8 shadow-inner font-mono text-xs text-slate-800 min-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed relative border-b-12">
            {/* Document Stamp logo */}
            <div className="absolute top-6 right-6 opacity-10 font-sans text-[10px] uppercase font-bold border-4 border-slate-900 p-2 transform rotate-12 select-none select-none">
              Algonquian RE LLC<br />Approved Draft
            </div>

            {compiledContent}
            
            {/* Signature Block Visual Overlay */}
            {signed && (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-sans text-emerald-950">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-700 text-white rounded-full">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold block">Sovereign E-Signature Applied!</span>
                    <span className="text-[11px] text-slate-600 block">Digitally certified by <strong className="font-semibold">{eSignature}</strong>. Webhook logs updated.</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Certification Stamp</span>
                  <span className="font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">#{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sign Transaction Block CTA */}
          {!signed && (
            <button
              onClick={handleSign}
              className="py-3.5 bg-emerald-950 text-white font-bold rounded-lg hover:bg-emerald-900 font-mono uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform transform active:scale-[99%]"
            >
              <Signature className="h-4 w-4 text-amber-400" /> Bi-Laterally Sign & Authenticate Offer Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
