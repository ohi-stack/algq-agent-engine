/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AutomationTrigger } from "../types";
import { Zap, Play, ToggleLeft, Plus, Smartphone, Mail, FileCheck, RefreshCw, Layers } from "lucide-react";

interface AutomationProps {
  triggers: AutomationTrigger[];
  logs: string[];
  onToggleTrigger: (id: string) => void;
  onAddTrigger: (trigger: AutomationTrigger) => void;
  onClearLogs: () => void;
}

export function AutomationSection({ triggers, logs, onToggleTrigger, onAddTrigger, onClearLogs }: AutomationProps) {
  const [title, setTitle] = useState("");
  const [event, setEvent] = useState("ON_DEAL_INTAKE");
  const [actionType, setActionType] = useState<"Email Alert" | "SMS Alert" | "Document Draft" | "CRM Log">("Email Alert");
  const [recipient, setRecipient] = useState("");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !recipient) {
      alert("Please specify a descriptive automation title and target recipient.");
      return;
    }

    const newTrigger: AutomationTrigger = {
      id: "auto-" + Date.now(),
      title,
      event,
      actionType,
      recipient,
      subjectTemplate: subjectTemplate || `ARE Tech Automation Alert`,
      bodyTemplate: bodyTemplate || `Workflow event [EventName] triggered for asset.`,
      isActive: true
    };

    onAddTrigger(newTrigger);
    setTitle("");
    setRecipient("");
    setSubjectTemplate("");
    setBodyTemplate("");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="automation-module">
      {/* Title HUD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" /> Algonquian Automation Engine (ARE Tech)
        </h2>
        <p className="text-slate-600 text-sm">
          Coordinate seamless workflows across your real estate channels. Design conditional SMS relays, email syndications to private capital syndicates, and automatic LOI contract drafts fired upon exact column transitions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trigger rules list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-sans font-semibold text-slate-900 text-sm pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Operational Trigger Rules</span>
              <span className="text-[10px] text-slate-400 font-mono">Workflow Schemas</span>
            </h3>

            <div className="space-y-3">
              {triggers.map(trig => (
                <div 
                  key={trig.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1.5 md:max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-bold text-slate-800 text-sm">
                        {trig.title}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        trig.isActive ? "bg-emerald-100 text-emerald-800 borderborder-emerald-200" : "bg-slate-200 text-slate-500"
                      }`}>
                        {trig.isActive ? "Active" : "Paused"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[10px]">
                      <span>Source event: <strong className="text-indigo-800">{trig.event}</strong></span>
                      <span>Action relay: <strong className="text-emerald-800 inline-flex items-center gap-0.5">
                        {trig.actionType === "SMS Alert" ? <Smartphone className="h-2.5 w-2.5" /> : null}
                        {trig.actionType === "Email Alert" ? <Mail className="h-2.5 w-2.5" /> : null}
                        {trig.actionType === "Document Draft" ? <FileCheck className="h-2.5 w-2.5" /> : null}
                        {trig.actionType}
                      </strong></span>
                      <span>Recipient: <strong className="text-slate-700">{trig.recipient}</strong></span>
                    </div>

                    <div className="bg-white p-2 rounded.md border border-slate-200/60 font-mono text-[9px] text-slate-500 leading-normal whitespace-pre-line">
                      <strong className="text-slate-700 font-bold block text-[8px] uppercase">Format Mock Body:</strong>
                      "{trig.bodyTemplate}"
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => onToggleTrigger(trig.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold font-sans tracking-wide cursor-pointer transition-colors ${
                        trig.isActive ? "bg-emerald-950 text-white hover:bg-emerald-900" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {trig.isActive ? "Pause Active" : "Resume Trigger"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook simulated logs terminal */}
          <div className="bg-slate-950 text-emerald-400 rounded-xl p-5 border border-slate-900 font-mono text-xs shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <span className="text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse" /> LIVE SIMULATING TELEMETRY TERMINAL
              </span>
              <button 
                onClick={onClearLogs}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear Terminal Screen
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-10 italic">
                  -- Waiting for state actions (Try moving deals in Pipeline CRM or submitting Intake form) --
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed font-mono text-[11px]">
                    <span className="text-slate-500 font-bold pr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add custom automation rule */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-sans font-semibold text-slate-900 text-sm pb-1.5 border-b border-slate-100 uppercase tracking-wide">
            Design Action Rule
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Trigger Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Notify Nutmeg of Off-Contract"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">When Event Fires</label>
                <select 
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="w-full p-2 rounded bg-white border border-slate-300 text-slate-800"
                >
                  <option value="ON_DEAL_INTAKE">On Deal Intake</option>
                  <option value="ON_STATUS_CHANGE_UNDERWRITING">Moved to Underwriting</option>
                  <option value="ON_OFFER_SUBMITTED">Offer Submited</option>
                  <option value="ON_STATUS_CHANGE_CONTRACT">Under Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Action Output Method</label>
                <select 
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full p-2 rounded bg-white border border-slate-300 text-slate-800"
                >
                  <option value="Email Alert">Email Alert Relay</option>
                  <option value="SMS Alert">SMS Cellular Ping</option>
                  <option value="Document Draft">Draft PDF Template</option>
                  <option value="CRM Log">CRM Auditor Entry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Recipient Destination</label>
              <input 
                type="text" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="email address, cell number, or agent ID"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Action Subject Format</label>
              <input 
                type="text" 
                value={subjectTemplate}
                onChange={(e) => setSubjectTemplate(e.target.value)}
                placeholder="e.g. [Address] State Transition Alert"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Action Message Template (Supports bracket placeholders)</label>
              <textarea 
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                rows={4}
                placeholder="e.g. Asset [Address] has successfully completed vetting. Action required."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-950 text-white font-bold hover:bg-emerald-900 rounded font-mono uppercase tracking-wider text-[11px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Mount New Automation Trigger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
