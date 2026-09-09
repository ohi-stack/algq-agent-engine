/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RealEstateDeal, DealStatus } from "../types";
import { 
  FolderSync, Edit3, Trash2, CheckSquare, UploadCloud, CheckCircle2, Download, 
  Sparkles, ChevronRight, Building2, Landmark, Clock, ArrowRight, Filter
} from "lucide-react";
import { BatchImportModal } from "./BatchImportModal";

interface PipelineCRMProps {
  deals: RealEstateDeal[];
  onUpdateDealStatus: (id: string, newStatus: DealStatus) => void;
  onUpdateDealDetails: (id: string, updatedFields: Partial<RealEstateDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onResetDeals: () => void;
  onBatchAddDeals?: (newDeals: RealEstateDeal[]) => void;
}

export function PipelineCRMSection({ 
  deals, 
  onUpdateDealStatus, 
  onUpdateDealDetails, 
  onDeleteDeal, 
  onResetDeals,
  onBatchAddDeals 
}: PipelineCRMProps) {
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [batchNotification, setBatchNotification] = useState<string | null>(null);
  
  // Local state edit fields
  const [editNotes, setEditNotes] = useState("");
  const [editAskingPrice, setEditAskingPrice] = useState(0);
  const [editStatus, setEditStatus] = useState<DealStatus>(DealStatus.Intake);

  const statuses = [
    DealStatus.Intake,
    DealStatus.DueDiligence,
    DealStatus.Underwriting,
    DealStatus.OfferSubmitted,
    DealStatus.SellerNegotiation,
    DealStatus.UnderContract,
    DealStatus.Funded
  ];

  const handleStartEdit = (deal: RealEstateDeal) => {
    setEditingDealId(deal.id);
    setEditNotes(deal.notes);
    setEditAskingPrice(deal.askingPrice);
    setEditStatus(deal.status);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateDealDetails(id, {
      notes: editNotes,
      askingPrice: Number(editAskingPrice),
    });
    if (editStatus) {
      onUpdateDealStatus(id, editStatus);
    }
    setEditingDealId(null);
  };

  const handleQuickShift = (id: string, current: DealStatus, direction: "forward" | "backward") => {
    const currentIndex = statuses.indexOf(current);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex + (direction === "forward" ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      onUpdateDealStatus(id, statuses[nextIndex]);
    }
  };

  // Get properties for a specific column status
  const getDealsByStatus = (status: DealStatus) => {
    return deals.filter(deal => deal.status === status);
  };

  const escapeCSVField = (value: any): string => {
    if (value === null || value === undefined) return "";
    const stringVal = String(value);
    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const handleExportCSV = () => {
    if (deals.length === 0) {
      setBatchNotification("No deals currently available in the pipeline to export.");
      return;
    }

    const headers = [
      "ID",
      "Address",
      "City",
      "State",
      "Zip Code",
      "Property Type",
      "Owner Name",
      "Owner Phone",
      "Owner Email",
      "Asking Price",
      "ARV",
      "Estimated Repairs",
      "Wholesale Fee",
      "MAO",
      "Status",
      "Occupancy",
      "Seller Financing",
      "Notes",
      "Created At",
      "Updated At"
    ];

    const rows = deals.map(deal => [
      escapeCSVField(deal.id),
      escapeCSVField(deal.address),
      escapeCSVField(deal.city),
      escapeCSVField(deal.state),
      escapeCSVField(deal.zipCode),
      escapeCSVField(deal.propertyType),
      escapeCSVField(deal.ownerName),
      escapeCSVField(deal.ownerPhone),
      escapeCSVField(deal.ownerEmail),
      escapeCSVField(deal.askingPrice),
      escapeCSVField(deal.arv),
      escapeCSVField(deal.estimatedRepairs),
      escapeCSVField(deal.wholesaleFee),
      escapeCSVField(deal.mao),
      escapeCSVField(deal.status),
      escapeCSVField(deal.occupancy),
      escapeCSVField(deal.hasSellerFinancing ? "Yes" : "No"),
      escapeCSVField(deal.notes),
      escapeCSVField(deal.createdAt),
      escapeCSVField(deal.updatedAt)
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `algonquian_pipeline_deals_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBatchNotification(`Successfully exported ${deals.length} deal${deals.length !== 1 ? 's' : ''} to algonquian_pipeline_deals_${dateStr}.csv.`);
    setTimeout(() => setBatchNotification(null), 5000);
  };

  const totalPipelineVolume = deals.reduce((acc, d) => acc + d.askingPrice, 0);
  const totalArvVolume = deals.reduce((acc, d) => acc + d.arv, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="crm-module">
      {/* 1. Module Top HUD - Canonical Algonquian Dark Navy (#071522) with Gold (#D1A54A) and Teal (#36C2B4) */}
      <div 
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#071522] p-5 md:p-6 rounded-2xl border border-[#D1A54A]/30 shadow-2xl relative overflow-hidden" 
        id="crm-top-hud"
      >
        <div className="absolute top-0 right-0 h-64 w-64 bg-[#D1A54A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 bg-[#36C2B4]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#D1A54A]/15 border border-[#D1A54A]/40 text-[#F5D77F] text-[10px] font-mono uppercase tracking-wider font-bold">
              SOVEREIGN PIPELINE CRM
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#36C2B4]/15 border border-[#36C2B4]/40 text-[#36C2B4] text-[10px] font-mono font-semibold uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] animate-pulse shadow-[0_0_6px_#36C2B4]" />
              7-Stage Active Pipeline
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2.5">
            <FolderSync className="h-6 w-6 text-[#D1A54A]" />
            <span>Algonquian Deal Pipeline Control</span>
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Direct acquisitions, institutional underwriting, and transactional stage tracking across Connecticut municipal centers.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Volume Metric Display */}
          <div className="bg-[#081928] border border-[#0B3A63] px-3.5 py-2 rounded-xl text-left shadow-inner">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#D1A54A] block">
              Total Pipeline Volume
            </span>
            <span className="text-base md:text-lg font-mono font-bold text-white block">
              ${totalPipelineVolume.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#081928] border border-[#0B3A63] px-3.5 py-2 rounded-xl text-left shadow-inner">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#36C2B4] block">
              Active Properties
            </span>
            <span className="text-base md:text-lg font-mono font-bold text-white block">
              {deals.length} <span className="text-xs font-normal text-slate-400">Assets</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-[#081928] text-slate-200 border border-[#D1A54A]/40 hover:border-[#D1A54A] hover:text-white rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              id="btn-export-deals-csv"
              title="Export all current pipeline deals to a downloadable CSV file"
            >
              <Download className="h-3.5 w-3.5 text-[#D1A54A]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button 
              type="button"
              onClick={() => setIsBatchImportModalOpen(true)}
              className="px-3.5 py-2 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              id="btn-open-batch-import"
              title="Upload or paste CSV/JSON to batch-import leads"
            >
              <UploadCloud className="h-3.5 w-3.5 text-[#071522]" />
              <span>Batch Import</span>
            </button>

            <button 
              type="button"
              onClick={onResetDeals}
              className="px-3 py-2 bg-[#081928] text-slate-400 hover:text-slate-200 border border-slate-700/60 rounded-lg text-xs font-serif font-semibold hover:border-slate-500 transition-colors cursor-pointer"
              title="Reset sample test deals"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Batch Import / Status Notification Toast */}
      {batchNotification && (
        <div className="bg-[#071522] border border-[#36C2B4] text-white p-3.5 rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#36C2B4] shadow-[0_0_8px_#36C2B4] shrink-0" />
            <CheckCircle2 className="h-4 w-4 text-[#36C2B4] shrink-0" />
            <span className="text-slate-200">{batchNotification}</span>
          </div>
          <button 
            onClick={() => setBatchNotification(null)}
            className="text-[#D1A54A] hover:text-[#F5D77F] text-xs font-mono font-bold px-2 py-0.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Kanban Board Canvas - Canonical Algonquian Dark Theme (#071522 Canvas) */}
      <div 
        className="bg-[#071522] p-4 md:p-5 rounded-2xl border border-[#D1A54A]/25 shadow-2xl space-y-4"
        id="pipeline-kanban-wrapper"
      >
        {/* Kanban Board Subheader / Stage Flow Tracker */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#0B3A63]/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D1A54A] font-bold">
              Workflow Sequence:
            </span>
            <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
              Intake → Due Diligence → Underwriting → Offer → Negotiation → Contract → Funded
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#36C2B4] shadow-[0_0_6px_#36C2B4]" />
              <span className="text-slate-300 font-semibold">Active Status Indicator</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#D1A54A]" />
              <span className="text-slate-300 font-semibold">Financial Metrics</span>
            </span>
          </div>
        </div>

        {/* 7-Column Horizontal Kanban Track */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 overflow-x-auto pb-3" id="pipeline-kanban-board">
          {statuses.map((status, statusIdx) => {
            const colDeals = getDealsByStatus(status);
            const colVolume = colDeals.reduce((sum, d) => sum + d.askingPrice, 0);

            return (
              <div 
                key={status} 
                className="min-w-[250px] flex-1 bg-[#081928] rounded-xl p-3.5 border border-[#0B3A63] shadow-lg flex flex-col space-y-3 min-h-[530px]"
                id={`column-${status.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {/* Column Header */}
                <div className="flex items-start justify-between border-b border-[#0B3A63] pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full bg-[#071522] border border-[#D1A54A]/50 text-[#D1A54A] text-[9px] font-mono font-bold flex items-center justify-center">
                        {statusIdx + 1}
                      </span>
                      <span className="font-serif font-bold text-white text-xs tracking-wide block">
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-5.5">
                      <span className="text-[10px] text-[#D1A54A] font-mono font-semibold uppercase block">
                        {colDeals.length} {colDeals.length === 1 ? "Deal" : "Deals"}
                      </span>
                      {colVolume > 0 && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          • ${(colVolume / 1000).toFixed(0)}k
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator Beacon - Canonical Teal (#36C2B4) */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span 
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        colDeals.length > 0 
                          ? "bg-[#36C2B4] shadow-[0_0_8px_#36C2B4] animate-pulse" 
                          : "bg-[#0B3A63]"
                      }`}
                      title={colDeals.length > 0 ? `${colDeals.length} active property in stage` : "Empty stage"}
                    />
                  </div>
                </div>

                {/* Column Property Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colDeals.length === 0 ? (
                    <div className="h-36 rounded-lg border border-dashed border-[#0B3A63]/80 bg-[#071522]/50 flex flex-col items-center justify-center p-3 text-center text-slate-500 text-xs gap-1.5 select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0B3A63]" />
                      <span className="font-mono text-[11px]">No properties in stage</span>
                    </div>
                  ) : (
                    colDeals.map(deal => {
                      const isEditing = editingDealId === deal.id;
                      const computedDiscount = deal.arv > 0 ? Math.round(((deal.arv - deal.askingPrice) / deal.arv) * 100) : 0;
                      
                      return (
                        <div 
                          key={deal.id}
                          className="bg-[#071522] p-4 rounded-xl border border-[#0B3A63] hover:border-[#D1A54A]/80 shadow-md hover:shadow-xl transition-all relative space-y-3 group"
                          id={`deal-card-${deal.id}`}
                        >
                          {/* Property Title and Badges */}
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-serif font-bold text-white text-xs block leading-tight group-hover:text-[#F5D77F] transition-colors">
                                {deal.address}
                              </span>

                              {/* Status Indicators & Feature Pills */}
                              <div className="flex items-center gap-1 shrink-0">
                                {deal.hasSellerFinancing && (
                                  <span 
                                    className="px-1.5 py-0.5 bg-[#D1A54A]/15 border border-[#D1A54A]/50 text-[#F5D77F] text-[9px] font-mono font-bold rounded uppercase"
                                    title="Seller Financing Terms Available"
                                  >
                                    Seller Terms
                                  </span>
                                )}
                                {deal.hasLinkedGoogleTaskList && (
                                  <span 
                                    className="px-1.5 py-0.5 bg-[#071522] border border-[#36C2B4] text-[#36C2B4] text-[9px] font-mono font-bold rounded uppercase flex items-center gap-1 shadow-sm"
                                    title="Google Tasks Linked"
                                  >
                                    <CheckSquare className="h-2.5 w-2.5 text-[#36C2B4]" />
                                    Sync
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-mono font-semibold uppercase block">
                                {deal.city}, {deal.state} • {deal.propertyType}
                              </span>
                              
                              {/* Active Stage Indicator Pill */}
                              <span className="inline-flex items-center gap-1 text-[#36C2B4] font-mono font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] shadow-[0_0_4px_#36C2B4]" />
                                {deal.status}
                              </span>
                            </div>
                          </div>

                          {/* Interactive Edit Panel inside Card */}
                          {isEditing ? (
                            <div className="space-y-2 pt-2 border-t border-[#0B3A63] text-xs">
                              <div>
                                <label className="block text-[#D1A54A] font-mono text-[10px] uppercase font-bold mb-1">
                                  Change Status
                                </label>
                                <select 
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value as DealStatus)}
                                  className="w-full p-1.5 rounded-lg border border-[#0B3A63] bg-[#081928] text-white font-mono text-xs focus:outline-none focus:border-[#D1A54A]"
                                >
                                  {statuses.map(st => (
                                    <option key={st} value={st} className="bg-[#071522] text-white">{st}</option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-[#D1A54A] font-mono text-[10px] uppercase font-bold mb-1">
                                  Adjust Asking Price ($)
                                </label>
                                <input 
                                  type="number" 
                                  value={editAskingPrice}
                                  onChange={(e) => setEditAskingPrice(Number(e.target.value))}
                                  className="w-full p-1.5 rounded-lg border border-[#0B3A63] bg-[#081928] text-white font-mono text-xs focus:outline-none focus:border-[#D1A54A]"
                                />
                              </div>

                              <div>
                                <label className="block text-[#D1A54A] font-mono text-[10px] uppercase font-bold mb-1">
                                  Edit Assessment/Notes
                                </label>
                                <textarea 
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  rows={3}
                                  className="w-full p-1.5 rounded-lg border border-[#0B3A63] bg-[#081928] text-white font-mono text-[10px] focus:outline-none focus:border-[#D1A54A]"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                <button 
                                  onClick={() => handleSaveEdit(deal.id)}
                                  className="w-full py-1.5 bg-[#D1A54A] hover:bg-[#b8860b] text-[#071522] font-serif font-bold rounded-lg uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                                >
                                  Save Changes
                                </button>
                                <button 
                                  onClick={() => setEditingDealId(null)}
                                  className="w-full py-1.5 bg-[#081928] hover:bg-[#0B2B4C] text-slate-300 border border-[#0B3A63] rounded-lg font-mono uppercase text-[10px] transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Visual Financial Metrics - Canonical Gold Accents & Teal Status Indicator */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border border-[#0B3A63] bg-[#081928] p-2.5 rounded-lg">
                                <div>
                                  <span className="text-[#D1A54A] block uppercase text-[9px] font-bold tracking-wider">
                                    Asking Price
                                  </span>
                                  <span className="font-bold text-white text-xs">
                                    ${deal.askingPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#D1A54A] block uppercase text-[9px] font-bold tracking-wider">
                                    ARV Limit
                                  </span>
                                  <span className="font-bold text-slate-200 text-xs">
                                    ${deal.arv.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#D1A54A] block uppercase text-[9px] font-bold tracking-wider">
                                    MAO Max
                                  </span>
                                  <span className="font-bold text-[#F5D77F] text-xs">
                                    ${deal.mao.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#D1A54A] block uppercase text-[9px] font-bold tracking-wider">
                                    Discount Spread
                                  </span>
                                  <span className="font-bold text-[#36C2B4] text-xs inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4] shadow-[0_0_4px_#36C2B4]" />
                                    {computedDiscount}% off
                                  </span>
                                </div>
                              </div>

                              {/* Deal Notes Quote */}
                              {deal.notes && (
                                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 italic bg-[#081928]/60 p-2 rounded border border-[#0B3A63]/50">
                                  "{deal.notes}"
                                </p>
                              )}

                              {/* Card Footer with Quick Navigation Controls */}
                              <div className="flex items-center justify-between border-t border-[#0B3A63] pt-2.5">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <button
                                    onClick={() => handleStartEdit(deal)}
                                    title="Edit Property Info"
                                    className="p-1.5 hover:text-[#D1A54A] bg-[#081928] hover:bg-[#0B2B4C] border border-[#0B3A63] rounded transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteDeal(deal.id)}
                                    title="Delete Deal"
                                    className="p-1.5 hover:text-red-400 bg-[#081928] hover:bg-red-950/40 border border-[#0B3A63] rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {/* Status Progression Controls */}
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#36C2B4]/10 border border-[#36C2B4]/30 text-[#36C2B4] text-[9px] font-mono font-semibold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#36C2B4]" />
                                    Stage {statuses.indexOf(deal.status) + 1}/7
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickShift(deal.id, deal.status, "backward")}
                                      disabled={statuses.indexOf(deal.status) === 0}
                                      className={`px-1.5 py-0.5 rounded border border-[#0B3A63] bg-[#081928] text-slate-300 text-[10px] font-mono font-bold transition-colors ${
                                        statuses.indexOf(deal.status) === 0 
                                          ? "opacity-25 cursor-not-allowed" 
                                          : "hover:border-[#D1A54A] hover:text-[#D1A54A] cursor-pointer"
                                      }`}
                                      title="Move backward in pipeline"
                                    >
                                      ←
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickShift(deal.id, deal.status, "forward")}
                                      disabled={statuses.indexOf(deal.status) === statuses.length - 1}
                                      className={`px-1.5 py-0.5 rounded border border-[#36C2B4]/50 bg-[#081928] text-[#36C2B4] text-[10px] font-mono font-bold transition-colors ${
                                        statuses.indexOf(deal.status) === statuses.length - 1 
                                          ? "opacity-25 cursor-not-allowed" 
                                          : "hover:bg-[#36C2B4] hover:text-[#071522] cursor-pointer"
                                      }`}
                                      title="Advance to next pipeline stage"
                                    >
                                      →
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchImportModalOpen}
        onClose={() => setIsBatchImportModalOpen(false)}
        onImportDeals={(newDeals) => {
          if (onBatchAddDeals) {
            onBatchAddDeals(newDeals);
          }
          setBatchNotification(`Successfully ingested ${newDeals.length} off-market property lead${newDeals.length !== 1 ? 's' : ''} into Pipeline CRM.`);
          setTimeout(() => setBatchNotification(null), 6000);
        }}
      />
    </div>
  );
}
