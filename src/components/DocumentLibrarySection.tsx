/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FolderCategory, DocTemplate } from "../types";
import { Folder, FolderOpen, FileText, Check, Copy, PencilLine, Save } from "lucide-react";
import { SEED_TEMPLATES } from "../data";

export function DocumentLibrarySection() {
  const [templates, setTemplates] = useState<DocTemplate[]>(SEED_TEMPLATES);
  const [selectedFolder, setSelectedFolder] = useState<FolderCategory>(FolderCategory.Acquisition);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("temp-loi");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    setEditMode(false);
    const temp = templates.find(t => t.id === id);
    if (temp) {
      setEditedContent(temp.content);
    }
  };

  const handleStartEdit = () => {
    if (activeTemplate) {
      setEditedContent(activeTemplate.content);
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, content: editedContent } : t));
    setEditMode(false);
  };

  const handleCopy = () => {
    if (activeTemplate) {
      navigator.clipboard.writeText(editMode ? editedContent : activeTemplate.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const folderIcons = {
    [FolderCategory.Acquisition]: "📁",
    [FolderCategory.Finance]: "📂",
    [FolderCategory.JointVenture]: "💼",
    [FolderCategory.Management]: "📋"
  };

  return (
    <div className="space-y-6 animate-fade-in" id="doc-library-module">
      {/* Title HUD */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-sans font-semibold text-slate-900 inline-flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-emerald-700" /> Algonquian Document & Contract Library
        </h2>
        <p className="text-slate-600 text-sm">
          A secure repository containing vital Connecticut commercial agreements. Edit system templates below to customize default clauses across deal flows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Folder Index */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-sans font-semibold text-slate-900 text-xs uppercase tracking-wider">
              System Folders
            </h3>

            {/* Folder selection tab rows */}
            <div className="space-y-2.5">
              {Object.values(FolderCategory).map(fol => (
                <button
                  key={fol}
                  onClick={() => {
                    setSelectedFolder(fol);
                    const matched = templates.find(t => t.category === fol);
                    if (matched) handleSelectTemplate(matched.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border font-mono text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedFolder === fol 
                      ? "bg-emerald-950 text-white border-emerald-950" 
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{folderIcons[fol]}</span>
                    <span>{fol}</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[9px] font-bold">
                    {templates.filter(t => t.category === fol).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-sans font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Documents in Folder
            </h4>
            
            <div className="space-y-2">
              {templates.filter(t => t.category === selectedFolder).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  className={`w-full text-left p-3 rounded-lg border font-sans text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                    activeTemplateId === t.id
                      ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="h-4.5 w-4.5 shrink-0 text-emerald-800 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block text-slate-800">{t.title}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{t.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Editor Preview Workspace */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {activeTemplate ? (
            <>
              {/* Workspace Header */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase px-2">
                  Document Workspace : {activeTemplate.title}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-700" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy Template"}
                  </button>

                  {editMode ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-2.5 py-1 bg-emerald-950 text-white border border-emerald-950 text-xs rounded hover:bg-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="h-3 w-3" /> Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <PencilLine className="h-3 w-3" /> Customize Boilerplate
                    </button>
                  )}
                </div>
              </div>

              {/* Editing Area */}
              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full flex-1 bg-white border-2 border-slate-300 rounded-xl p-6 font-mono text-xs text-slate-800 tracking-wide min-h-[500px] leading-relaxed focus:ring-2 focus:ring-emerald-800 focus:outline-none"
                />
              ) : (
                <div className="flex-1 bg-white border-2 border-slate-300 rounded-xl p-8 font-mono text-xs text-slate-800 leading-relaxed min-h-[500px] whitespace-pre-wrap select-all">
                  {activeTemplate.content}
                </div>
              )}
            </>
          ) : (
            <div className="h-96 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-6 text-center text-slate-400">
              Please select a document template from the folders index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
