/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RealEstateDeal, DealStatus } from "../types";
import { 
  FolderSync, Phone, Mail, FileWarning, DollarSign, Calendar, Edit3, ArrowRightLeft, 
  Trash2, ShieldCheck, Landmark, CheckCircle, Zap 
} from "lucide-react";

interface PipelineCRMProps {
  deals: RealEstateDeal[];
  onUpdateDealStatus: (id: string, newStatus: DealStatus) => void;
  onUpdateDealDetails: (id: string, updatedFields: Partial<RealEstateDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onResetDeals: () => void;
}

export function PipelineCRMSection({ 
  deals, 
  onUpdateDealStatus, 
  onUpdateDealDetails, 
  onDeleteDeal, 
  onResetDeals 
}: PipelineCRMProps) {
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  
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
    
    let nextIndex = currentIndex + (direction === "forward" ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      onUpdateDealStatus(id, statuses[nextIndex]);
    }
  };

  // Get properties for a specific column status
  const getDealsByStatus = (status: DealStatus) => {
    return deals.filter(deal => deal.status === status);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="crm-module">
      {/* Module Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="crm-top-hud">
        <div>
          <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
            <FolderSync className="h-5 w-5 text-emerald-700" /> Algonquian Pipeline CRM Control
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time pipeline orchestration. Manage Connecticut acquisitions from initial intake leads through close.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Total Pipeline Volume: <strong className="text-emerald-950">${deals.reduce((acc, d) => acc + d.askingPrice, 0).toLocaleString()}</strong>
          </span>
          <button 
            type="button"
            onClick={onResetDeals}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-200 hover:text-slate-93c transition-colors cursor-pointer"
          >
            Reset Seed Deals
          </button>
        </div>
      </div>

      {/* CRM Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 overflow-x-auto pb-4 " id="pipeline-kanban-board">
        {statuses.map(status => {
          const colDeals = getDealsByStatus(status);
          return (
            <div 
              key={status} 
              className="min-w-[240px] flex-1 bg-slate-100/80 rounded-xl p-3 border border-slate-200/60 flex flex-col space-y-3 min-h-[500px]"
              id={`column-${status.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="space-y-0.5">
                  <span className="font-sans font-bold text-slate-800 text-xs tracking-tight block">
                    {status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    {colDeals.length} {colDeals.length === 1 ? "Property" : "Properties"}
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
              </div>

              {/* Column List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colDeals.length === 0 ? (
                  <div className="h-32 rounded-lg border border-dashed border-slate-300 flex items-center justify-center p-3 text-center text-slate-400 text-xs">
                    No properties in this phase
                  </div>
                ) : (
                  colDeals.map(deal => {
                    const isEditing = editingDealId === deal.id;
                    const computedDiscount = deal.arv > 0 ? Math.round(((deal.arv - deal.askingPrice) / deal.arv) * 100) : 0;
                    
                    return (
                      <div 
                        key={deal.id}
                        className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3 hover:border-emerald-700/50 hover:shadow-md transition-all relative"
                        id={`deal-card-${deal.id}`}
                      >
                        {/* Title and Badge */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <span className="font-sans font-bold text-slate-900 text-xs block leading-tight">
                              {deal.address}
                            </span>
                            {deal.hasSellerFinancing && (
                              <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded uppercase">
                                Seller Terms
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                            {deal.city}, {deal.state} • {deal.propertyType}
                          </span>
                        </div>

                        {/* Interactive Edit Panel inside Card */}
                        {isEditing ? (
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div>
                              <label className="block text-slate-500 mb-0.5">Change Status</label>
                              <select 
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as DealStatus)}
                                className="w-full p-1 rounded border border-slate-300 bg-white"
                              >
                                {statuses.map(st => (
                                  <option key={st} value={st}>{st}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-slate-500 mb-0.5">Adjust Price ($)</label>
                              <input 
                                type="number" 
                                value={editAskingPrice}
                                onChange={(e) => setEditAskingPrice(Number(e.target.value))}
                                className="w-full p-1 rounded border border-slate-300"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-500 mb-0.5">Edit Assessment/Notes</label>
                              <textarea 
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={3}
                                className="w-full p-1 rounded border border-slate-300 font-mono text-[10px]"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              <button 
                                onClick={() => handleSaveEdit(deal.id)}
                                className="w-full py-1 bg-emerald-950 text-white font-bold rounded font-mono uppercase text-[9px]"
                              >
                                Save Changes
                              </button>
                              <button 
                                onClick={() => setEditingDealId(null)}
                                className="w-full py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded font-mono uppercase text-[9px]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Visual Metrics */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-b border-slate-100 py-1.5 bg-slate-50 p-2 rounded">
                              <div>
                                <span className="text-slate-400 block uppercase">Price</span>
                                <span className="font-bold text-slate-800">${deal.askingPrice.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block uppercase">ARV Limit</span>
                                <span className="font-bold text-emerald-800">${deal.arv.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block uppercase">MAO Max</span>
                                <span className="font-bold text-amber-700">${deal.mao.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block uppercase">Discount</span>
                                <span className="font-bold text-indigo-700">{computedDiscount}% off</span>
                              </div>
                            </div>

                            {/* Brief Notes */}
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 italic">
                              "{deal.notes}"
                            </p>

                            {/* Card Footer with Quick Navigation Controls */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <button
                                  onClick={() => handleStartEdit(deal)}
                                  title="Edit Property Info"
                                  className="p-1 hover:text-emerald-700 bg-slate-50 rounded"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteDeal(deal.id)}
                                  className="p-1 hover:text-red-700 bg-slate-50 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Pipeline Navigation Quick Shifts */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleQuickShift(deal.id, deal.status, "backward")}
                                  disabled={statuses.indexOf(deal.status) === 0}
                                  className={`px-1 rounded border border-slate-200 text-[10px] font-mono font-bold ${statuses.indexOf(deal.status) === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100"}`}
                                >
                                  ←
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickShift(deal.id, deal.status, "forward")}
                                  disabled={statuses.indexOf(deal.status) === statuses.length - 1}
                                  className={`px-1 rounded border border-slate-200 text-[10px] font-mono font-bold ${statuses.indexOf(deal.status) === statuses.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-emerald-950 hover:text-white"}`}
                                >
                                  →
                                </button>
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
  );
}
