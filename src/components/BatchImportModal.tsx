/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId, useRef, useEffect } from "react";
import { 
  X, UploadCloud, FileSpreadsheet, FileCode, CheckCircle2, 
  AlertTriangle, Copy, Check, Sparkles, RefreshCw, Trash2,
  HelpCircle, Eye, ArrowRight, CheckSquare, Square
} from "lucide-react";
import { RealEstateDeal, DealStatus } from "../types";

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDeals: (newDeals: RealEstateDeal[]) => void;
}

interface ParsedLeadResult {
  deal: RealEstateDeal;
  isValid: boolean;
  errors: string[];
  selected: boolean;
}

const SAMPLE_CSV = `address,city,state,zipCode,propertyType,ownerName,ownerPhone,ownerEmail,askingPrice,arv,estimatedRepairs,wholesaleFee,status,occupancy,notes
148 Wolcott St,Waterbury,CT,06705,Multi-Family,Carmine Rossi,203-555-0182,carmine.rossi@provider.com,142000,240000,45000,15000,New Intake,Tenant Occupied,"3-family with 1 vacant unit. Long term tenants on month-to-month. Deferred roof maintenance."
210 Grand Ave,New Haven,CT,06513,Single Family,Evelyn Vance,203-555-0144,evelyn.vance@gmail.com,165000,275000,38000,18000,Due Diligence,Vacant,"Probate inherited colonial. Hardwood floors intact, needs updated 200A electrical and kitchen."
88 Maplewood Terrace,Hartford,CT,06112,Commercial,Marcus Sterling,860-555-0199,msterling@capitalholdings.net,310000,490000,75000,25000,Underwriting,Tenant Occupied,"Mixed-use 2 retail storefronts with 4 residential units above. High cash flow potential."`;

const SAMPLE_JSON = `[
  {
    "address": "45 Highland Ave",
    "city": "Waterbury",
    "state": "CT",
    "zipCode": "06708",
    "propertyType": "Multi-Family",
    "ownerName": "Anthony Moretti",
    "ownerPhone": "203-555-9831",
    "ownerEmail": "amoretti@verizon.net",
    "askingPrice": 135000,
    "arv": 235000,
    "estimatedRepairs": 40000,
    "wholesaleFee": 15000,
    "status": "New Intake",
    "occupancy": "Tenant Occupied",
    "notes": "Direct seller sourced via off-market mailer. 2-family needing boiler replacement."
  },
  {
    "address": "772 Main St",
    "city": "Bridgeport",
    "state": "CT",
    "zipCode": "06604",
    "propertyType": "Mixed-Use",
    "ownerName": "Sandra Lin",
    "ownerPhone": "203-555-4421",
    "ownerEmail": "slin.properties@outlook.com",
    "askingPrice": 280000,
    "arv": 450000,
    "estimatedRepairs": 65000,
    "wholesaleFee": 20000,
    "status": "Due Diligence",
    "occupancy": "Owner Occupied",
    "notes": "Ground floor commercial studio with 2 loft apartments. Motivated seller relocating."
  },
  {
    "address": "19 Woodlawn Ave",
    "city": "Bristol",
    "state": "CT",
    "zipCode": "06010",
    "propertyType": "Single Family",
    "ownerName": "David K. Reynolds",
    "ownerPhone": "860-555-8732",
    "ownerEmail": "david.reynolds@charter.net",
    "askingPrice": 115000,
    "arv": 210000,
    "estimatedRepairs": 32000,
    "wholesaleFee": 14000,
    "status": "New Intake",
    "occupancy": "Vacant",
    "notes": "Estate sale. Complete cosmetic renovation needed. Solid mechanical foundation."
  }
]`;

export function BatchImportModal({ isOpen, onClose, onImportDeals }: BatchImportModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [formatMode, setFormatMode] = useState<"auto" | "json" | "csv">("auto");
  const [rawText, setRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [stageOverride, setStageOverride] = useState<string>("keep");
  const [parsedResults, setParsedResults] = useState<ParsedLeadResult[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSuccessImported, setIsSuccessImported] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaId = useId();

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccessImported(false);
    }
  }, [isOpen]);

  // Real-time parsing when rawText or formatMode or stageOverride changes
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedResults([]);
      setParseError(null);
      return;
    }

    try {
      const detectedFormat = formatMode === "auto" 
        ? (rawText.trim().startsWith("[") || rawText.trim().startsWith("{") ? "json" : "csv")
        : formatMode;

      let parsed: ParsedLeadResult[] = [];

      if (detectedFormat === "json") {
        parsed = parseJSONData(rawText, stageOverride);
      } else {
        parsed = parseCSVData(rawText, stageOverride);
      }

      setParsedResults(parsed);
      setParseError(null);
    } catch (err: any) {
      setParsedResults([]);
      setParseError(err.message || "Failed to parse input data. Please check syntax.");
    }
  }, [rawText, formatMode, stageOverride]);

  if (!isOpen) return null;

  // Clean and parse numbers
  function cleanNumber(val: any, fallback = 0): number {
    if (typeof val === "number") return isNaN(val) ? fallback : val;
    if (!val) return fallback;
    const str = String(val).replace(/[^0-9.-]+/g, "");
    const num = parseFloat(str);
    return isNaN(num) ? fallback : num;
  }

  // Normalize Deal Status
  function normalizeStatus(statusStr: string, override: string): DealStatus {
    if (override !== "keep") {
      const matched = Object.values(DealStatus).find(s => s === override);
      if (matched) return matched;
    }

    if (!statusStr) return DealStatus.Intake;
    const lower = statusStr.toLowerCase().trim();

    if (lower.includes("intake") || lower.includes("new")) return DealStatus.Intake;
    if (lower.includes("diligence") || lower.includes("due")) return DealStatus.DueDiligence;
    if (lower.includes("underwrite") || lower.includes("underwriting")) return DealStatus.Underwriting;
    if (lower.includes("submitted") || lower.includes("offer submitted")) return DealStatus.OfferSubmitted;
    if (lower.includes("negotiat") || lower.includes("seller negotiation")) return DealStatus.SellerNegotiation;
    if (lower.includes("contract") || lower.includes("under contract")) return DealStatus.UnderContract;
    if (lower.includes("funded") || lower.includes("closed")) return DealStatus.Funded;
    if (lower.includes("archive")) return DealStatus.Archived;

    return DealStatus.Intake;
  }

  // Normalize Property Type
  function normalizePropertyType(typeStr: string): "Single Family" | "Multi-Family" | "Commercial" | "Land" | "Mixed-Use" {
    if (!typeStr) return "Single Family";
    const lower = typeStr.toLowerCase();
    if (lower.includes("multi")) return "Multi-Family";
    if (lower.includes("commercial")) return "Commercial";
    if (lower.includes("mixed")) return "Mixed-Use";
    if (lower.includes("land") || lower.includes("lot")) return "Land";
    return "Single Family";
  }

  // Normalize Occupancy
  function normalizeOccupancy(occStr: string): "Owner Occupied" | "Tenant Occupied" | "Vacant" | "Abandoned" {
    if (!occStr) return "Tenant Occupied";
    const lower = occStr.toLowerCase();
    if (lower.includes("vacant")) return "Vacant";
    if (lower.includes("owner")) return "Owner Occupied";
    if (lower.includes("abandon")) return "Abandoned";
    return "Tenant Occupied";
  }

  // Robust RFC CSV Row Splitter
  function parseCSVRows(csvText: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === '\n' && !insideQuotes) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // Parse CSV
  function parseCSVData(csv: string, stageOverrideStr: string): ParsedLeadResult[] {
    const rows = parseCSVRows(csv);
    if (rows.length < 2) {
      throw new Error("CSV requires a header row and at least one property data row.");
    }

    const headers = rows[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, ""));
    const results: ParsedLeadResult[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      const getVal = (possibleKeys: string[]): string => {
        for (const k of possibleKeys) {
          const idx = headers.indexOf(k.toLowerCase().replace(/[\s_-]+/g, ""));
          if (idx !== -1 && row[idx] !== undefined) {
            return row[idx].trim();
          }
        }
        return "";
      };

      const address = getVal(["address", "propertyaddress", "street", "streetaddress", "location"]);
      const city = getVal(["city", "town", "municipality"]) || "Waterbury";
      const state = getVal(["state", "st"]) || "CT";
      const zipCode = getVal(["zipcode", "zip", "postalcode"]) || "06702";
      const propertyType = normalizePropertyType(getVal(["propertytype", "type", "assettype"]));
      const ownerName = getVal(["ownername", "owner", "seller", "contactname", "contact"]) || "Direct Seller";
      const ownerPhone = getVal(["ownerphone", "phone", "contactphone", "cell"]) || "Not specified";
      const ownerEmail = getVal(["owneremail", "email", "contactemail"]) || "Not specified";
      
      const askingPrice = cleanNumber(getVal(["askingprice", "asking", "price", "listprice"]));
      const arv = cleanNumber(getVal(["arv", "afterrepairvalue", "marketvalue", "comparablevalue"]));
      const estimatedRepairs = cleanNumber(getVal(["estimatedrepairs", "repairs", "rehab", "rehabcost"]));
      const wholesaleFee = cleanNumber(getVal(["wholesalefee", "fee", "targetfee", "assignmentfee"]), 15000);
      const rawStatus = getVal(["status", "stage", "pipelinestatus"]);
      const occupancy = normalizeOccupancy(getVal(["occupancy", "tenantstatus", "tenancy"]));
      const notes = getVal(["notes", "description", "comments", "assessment"]) || `Batch imported off-market lead via CSV.`;

      if (!address) {
        errors.push("Missing required property street address");
      }
      if (askingPrice <= 0 && arv <= 0) {
        errors.push("Missing both asking price and ARV");
      }

      // Compute MAO if not provided
      let mao = cleanNumber(getVal(["mao", "maximumallowableoffer"]));
      if (mao <= 0 && arv > 0) {
        mao = Math.max(0, Math.round((arv * 0.70) - estimatedRepairs - wholesaleFee));
      }

      const deal: RealEstateDeal = {
        id: `deal-batch-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        address,
        city,
        state,
        zipCode,
        propertyType,
        ownerName,
        ownerPhone,
        ownerEmail,
        askingPrice,
        arv,
        estimatedRepairs,
        wholesaleFee,
        mao,
        status: normalizeStatus(rawStatus, stageOverrideStr),
        occupancy,
        hasSellerFinancing: false,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      results.push({
        deal,
        isValid: errors.length === 0,
        errors,
        selected: errors.length === 0
      });
    }

    return results;
  }

  // Parse JSON
  function parseJSONData(jsonText: string, stageOverrideStr: string): ParsedLeadResult[] {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      throw new Error(`JSON Syntax Error: ${e.message}`);
    }

    // Handle array or object wrapper (e.g. { leads: [...] } or { deals: [...] })
    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      if (Array.isArray(parsed.leads)) items = parsed.leads;
      else if (Array.isArray(parsed.deals)) items = parsed.deals;
      else if (Array.isArray(parsed.properties)) items = parsed.properties;
      else if (Array.isArray(parsed.data)) items = parsed.data;
      else items = [parsed]; // Single object
    }

    if (items.length === 0) {
      throw new Error("No property lead objects found in JSON structure.");
    }

    return items.map((item, idx) => {
      const errors: string[] = [];
      const address = item.address || item.propertyAddress || item.street || "";
      const city = item.city || item.town || "Waterbury";
      const state = item.state || "CT";
      const zipCode = item.zipCode || item.zip || "06702";
      const propertyType = normalizePropertyType(item.propertyType || item.type);
      const ownerName = item.ownerName || item.owner || item.seller || "Direct Seller";
      const ownerPhone = item.ownerPhone || item.phone || "Not specified";
      const ownerEmail = item.ownerEmail || item.email || "Not specified";
      
      const askingPrice = cleanNumber(item.askingPrice || item.asking || item.price);
      const arv = cleanNumber(item.arv || item.afterRepairValue);
      const estimatedRepairs = cleanNumber(item.estimatedRepairs || item.repairs || item.rehab);
      const wholesaleFee = cleanNumber(item.wholesaleFee || item.fee, 15000);
      const occupancy = normalizeOccupancy(item.occupancy);
      const notes = item.notes || `Batch imported off-market lead via JSON payload.`;

      if (!address) {
        errors.push("Missing property address");
      }
      if (askingPrice <= 0 && arv <= 0) {
        errors.push("Missing both asking price and ARV");
      }

      let mao = cleanNumber(item.mao);
      if (mao <= 0 && arv > 0) {
        mao = Math.max(0, Math.round((arv * 0.70) - estimatedRepairs - wholesaleFee));
      }

      const deal: RealEstateDeal = {
        id: `deal-batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        address,
        city,
        state,
        zipCode,
        propertyType,
        ownerName,
        ownerPhone,
        ownerEmail,
        askingPrice,
        arv,
        estimatedRepairs,
        wholesaleFee,
        mao,
        status: normalizeStatus(item.status, stageOverrideStr),
        occupancy,
        hasSellerFinancing: Boolean(item.hasSellerFinancing),
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        deal,
        isValid: errors.length === 0,
        errors,
        selected: errors.length === 0
      };
    });
  }

  // File Upload Handlers
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        if (file.name.endsWith(".json")) {
          setFormatMode("json");
        } else if (file.name.endsWith(".csv")) {
          setFormatMode("csv");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Toggle row selection
  const handleToggleSelect = (index: number) => {
    setParsedResults(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  // Select all / Deselect all
  const handleSelectAll = (select: boolean) => {
    setParsedResults(prev => prev.map(item => ({
      ...item,
      selected: select && item.isValid
    })));
  };

  // Execute Import
  const handleExecuteImport = () => {
    const selectedDeals = parsedResults
      .filter(r => r.selected && r.isValid)
      .map(r => r.deal);

    if (selectedDeals.length === 0) return;

    onImportDeals(selectedDeals);
    setIsSuccessImported(true);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Copy CSV template to clipboard
  const handleCopyTemplate = () => {
    const headerOnly = `address,city,state,zipCode,propertyType,ownerName,ownerPhone,ownerEmail,askingPrice,arv,estimatedRepairs,wholesaleFee,status,occupancy,notes`;
    navigator.clipboard.writeText(headerOnly);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const validCount = parsedResults.filter(r => r.isValid).length;
  const selectedCount = parsedResults.filter(r => r.selected && r.isValid).length;
  const invalidCount = parsedResults.filter(r => !r.isValid).length;
  const totalVolume = parsedResults
    .filter(r => r.selected && r.isValid)
    .reduce((acc, r) => acc + r.deal.askingPrice, 0);

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      id="modal-batch-import-lead-pipeline"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-import-heading"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#071522] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0B3A63] text-[#36C2B4] rounded-lg border border-[#36C2B4]/30 shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="modal-import-heading" className="text-base font-sans font-bold tracking-tight text-white">
                  Batch Lead Ingestion & Pipeline Importer
                </h3>
                <span className="px-2 py-0.5 bg-[#D1A54A]/20 text-[#D1A54A] border border-[#D1A54A]/40 text-[10px] font-mono font-bold rounded">
                  CSV / JSON
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Upload or paste structured records to bulk-populate Connecticut property leads into Algonquian CRM.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8FAFC]">
          {/* Success Banner */}
          {isSuccessImported && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Successfully Ingested {selectedCount} Lead{selectedCount !== 1 ? 's' : ''}!</h4>
                <p className="text-xs text-emerald-700">
                  Deals have been committed to memory persistence and synchronized across the Pipeline CRM kanban board.
                </p>
              </div>
            </div>
          )}

          {/* Action Tabs & Quick Sample Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {/* Input Method Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "paste" 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 text-[#0B3A63]" />
                  <span>Paste Raw Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "upload" 
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5 text-[#0B3A63]" />
                  <span>Upload File</span>
                </button>
              </div>

              {/* Format Dropdown */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Format:</span>
                <select
                  value={formatMode}
                  onChange={(e) => setFormatMode(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-[#0B3A63]"
                >
                  <option value="auto">Auto-Detect</option>
                  <option value="csv">CSV (Comma Separated)</option>
                  <option value="json">JSON Array</option>
                </select>
              </div>
            </div>

            {/* Template Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_CSV);
                  setFormatMode("csv");
                  setActiveTab("paste");
                  setFileName("sample_connecticut_leads.csv");
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Load sample CSV dataset"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
                <span>Load Sample CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRawText(SAMPLE_JSON);
                  setFormatMode("json");
                  setActiveTab("paste");
                  setFileName("sample_connecticut_leads.json");
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Load sample JSON dataset"
              >
                <FileCode className="h-3.5 w-3.5 text-blue-700" />
                <span>Load Sample JSON</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy CSV column header row"
              >
                {copiedTemplate ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copiedTemplate ? "Copied!" : "Copy Header Row"}</span>
              </button>

              {rawText && (
                <button
                  type="button"
                  onClick={() => {
                    setRawText("");
                    setFileName(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Clear current input"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Upload File Drag and Drop */}
          {activeTab === "upload" && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? "border-[#36C2B4] bg-teal-50/50" 
                  : "border-slate-300 bg-white hover:border-[#0B3A63] hover:bg-slate-50/50"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv, .json, text/csv, application/json, text/plain" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-slate-100 text-[#0B3A63] rounded-full border border-slate-200">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  {fileName ? (
                    <span className="text-[#0B3A63] font-mono font-bold">Loaded: {fileName}</span>
                  ) : (
                    <span>Click to browse or drop your CSV or JSON file here</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Supports exported spreadsheets from PropStream, BatchLeads, DealMachine, county tax assessor rolls, or JSON payloads.
                </p>
                {fileName && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2 inline-block">
                    File loaded. Check parsed preview below.
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw Data */}
          {activeTab === "paste" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <label htmlFor={textareaId} className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>Structured Data Input</span>
                  <span className="font-normal text-slate-400">({rawText.length} characters)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Format: {formatMode === "auto" ? "Auto-Detecting" : formatMode.toUpperCase()}
                </span>
              </div>
              <textarea
                id={textareaId}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder="Paste CSV with headers or JSON array of leads here..."
                className="w-full p-3 font-mono text-xs bg-white text-slate-800 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent outline-hidden transition-all shadow-2xs resize-y"
              />
            </div>
          )}

          {/* Parsing Error Callout */}
          {parseError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Syntax / Format Issue:</span>
                <p className="text-red-700 font-mono mt-0.5">{parseError}</p>
              </div>
            </div>
          )}

          {/* Parsed Results Section */}
          {parsedResults.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
              {/* Table Top Bar / Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Parsed Leads ({parsedResults.length})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                      {invalidCount} Needs Attention
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    Selected Volume: <strong className="text-slate-900">${totalVolume.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Pipeline Stage Assignment Option */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 text-[11px] font-medium">Stage Target:</span>
                    <select
                      value={stageOverride}
                      onChange={(e) => setStageOverride(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 font-medium"
                    >
                      <option value="keep">Keep File Stage</option>
                      <option value={DealStatus.Intake}>Force: New Intake</option>
                      <option value={DealStatus.DueDiligence}>Force: Due Diligence</option>
                      <option value={DealStatus.Underwriting}>Force: Underwriting</option>
                      <option value={DealStatus.OfferSubmitted}>Force: Offer Submitted</option>
                    </select>
                  </div>

                  {/* Batch Select / Deselect */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-[#0B3A63] hover:underline font-semibold text-[11px]"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="text-slate-500 hover:underline font-medium text-[11px]"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto max-h-[300px] border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] sticky top-0 border-b border-slate-200 uppercase tracking-wider z-10">
                    <tr>
                      <th className="p-2.5 w-10 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectAll(selectedCount < validCount)}
                          aria-label={selectedCount === validCount ? "Deselect all valid leads" : "Select all valid leads"}
                          className="text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          {selectedCount === validCount && validCount > 0 ? (
                            <CheckSquare className="h-4 w-4 text-[#0B3A63]" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Property Address</th>
                      <th className="p-2.5">Asset Type</th>
                      <th className="p-2.5">Owner / Contact</th>
                      <th className="p-2.5 text-right">Asking Price</th>
                      <th className="p-2.5 text-right">ARV</th>
                      <th className="p-2.5 text-right">Auto MAO</th>
                      <th className="p-2.5">Pipeline Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {parsedResults.map((item, idx) => {
                      const { deal, isValid, errors, selected } = item;
                      return (
                        <tr 
                          key={deal.id || idx}
                          className={`transition-colors ${
                            !isValid 
                              ? "bg-red-50/40" 
                              : selected 
                              ? "bg-teal-50/20 hover:bg-teal-50/40" 
                              : "hover:bg-slate-50 opacity-60"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="p-2.5 text-center">
                            <input 
                              type="checkbox"
                              checked={selected}
                              disabled={!isValid}
                              onChange={() => handleToggleSelect(idx)}
                              className="rounded border-slate-300 text-[#0B3A63] focus:ring-[#0B3A63] cursor-pointer"
                            />
                          </td>

                          {/* Validity Badge */}
                          <td className="p-2.5 whitespace-nowrap">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Valid
                              </span>
                            ) : (
                              <span 
                                title={errors.join(", ")}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 cursor-help"
                              >
                                <AlertTriangle className="h-3 w-3 text-red-600" /> Invalid
                              </span>
                            )}
                          </td>

                          {/* Address */}
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900 leading-tight">
                              {deal.address || <span className="text-red-500 italic font-normal">Missing Address</span>}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {deal.city}, {deal.state} {deal.zipCode}
                            </div>
                          </td>

                          {/* Type & Occupancy */}
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="text-slate-800 font-medium block">{deal.propertyType}</span>
                            <span className="text-[10px] text-slate-400">{deal.occupancy}</span>
                          </td>

                          {/* Owner */}
                          <td className="p-2.5">
                            <div className="text-slate-800 font-medium">{deal.ownerName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{deal.ownerPhone}</div>
                          </td>

                          {/* Asking Price */}
                          <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                            ${deal.askingPrice.toLocaleString()}
                          </td>

                          {/* ARV */}
                          <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">
                            ${deal.arv.toLocaleString()}
                          </td>

                          {/* Computed MAO */}
                          <td className="p-2.5 text-right font-mono text-amber-700 font-bold">
                            ${deal.mao.toLocaleString()}
                          </td>

                          {/* Stage */}
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded font-semibold border border-slate-200">
                              {deal.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parsedResults.length > 0 ? (
              <span>
                Ready to commit <strong className="text-slate-900">{selectedCount} of {parsedResults.length}</strong> lead{selectedCount !== 1 ? 's' : ''} to Algonquian Pipeline CRM.
              </span>
            ) : (
              <span>Paste or upload leads to populate the import preview table.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedCount === 0 || isSuccessImported}
              onClick={handleExecuteImport}
              className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedCount > 0 && !isSuccessImported
                  ? "bg-[#0B3A63] text-white hover:bg-[#071522] shadow-sm hover:shadow"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#36C2B4]" />
              <span>Import {selectedCount} Lead{selectedCount !== 1 ? 's' : ''} to CRM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
