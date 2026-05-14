"use client";

import { useRef, useState } from "react";
import {
  Upload, ClipboardPaste, CheckCircle2, XCircle,
  Trash2, Check, FileSpreadsheet, Camera, Loader2,
} from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GRADE_COLORS } from "@/lib/constants";
import {
  parseWhatsAppInventory, parseExcelInventory, aiResponseToItems,
  SAMPLE_WHATSAPP_INPUT,
} from "@/utils/parser";
import { importInventoryBatch } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ParsedInventoryItem } from "@/types";
import clsx from "clsx";

type Tab = "text" | "excel" | "screenshot";

export default function ImportPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("text");

  // Text
  const [raw, setRaw] = useState("");

  // Excel
  const excelRef = useRef<HTMLInputElement>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Screenshot
  const imgRef = useRef<HTMLInputElement>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // Shared
  const [parsed, setParsed] = useState<ParsedInventoryItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const applyResult = (items: ParsedInventoryItem[], errs: string[]) => {
    setParsed(items);
    setErrors(errs);
    setSelected(new Set(items.map((_, i) => i)));
    setImportDone(false);
  };

  const reset = () => {
    setRaw(""); setExcelFile(null); setImgFile(null);
    setImgPreview(null); setAnalyzeError(null);
    setParsed([]); setErrors([]); setSelected(new Set());
  };

  // ── Text parse ──────────────────────────────────────────────────────────────
  const handleTextParse = () => {
    const result = parseWhatsAppInventory(raw);
    applyResult(result.items, result.errors);
  };

  // ── Excel parse ─────────────────────────────────────────────────────────────
  const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    const result = await parseExcelInventory(file);
    applyResult(result.items, result.errors);
  };

  // ── Screenshot AI ───────────────────────────────────────────────────────────
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setAnalyzeError(null);
    setParsed([]); setErrors([]); setSelected(new Set());
  };

  const handleAnalyze = async () => {
    if (!imgFile) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const buffer = await imgFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const mimeType = imgFile.type || "image/jpeg";

      const res = await fetch("/api/parse-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Unknown error");

      const result = aiResponseToItems(data.items ?? []);
      applyResult(result.items, result.errors);
    } catch (e: any) {
      setAnalyzeError(e?.message ?? "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────────
  const toggleSelect = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const handleImport = async () => {
    if (!user || selected.size === 0) return;
    setImporting(true);
    try {
      const toImport = parsed.filter((_, i) => selected.has(i));
      await importInventoryBatch(toImport, user.uid);
      setImportDone(true);
      reset();
    } finally {
      setImporting(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "text",       label: "WhatsApp Text", icon: <ClipboardPaste size={14} /> },
    { id: "excel",      label: "Excel",         icon: <FileSpreadsheet size={14} /> },
    { id: "screenshot", label: "Screenshot AI", icon: <Camera size={14} /> },
  ];

  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-navy-500 text-2xl font-semibold">Import Stock</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Import inventory via WhatsApp text, Excel file, or screenshot
            </p>
          </div>

          {importDone && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p className="text-emerald-700 font-medium">Successfully imported to inventory!</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); reset(); }}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-amber-400 text-white"
                    : "bg-slate-100 text-slate-500 hover:text-slate-700"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left: Input panel ────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* TEXT tab */}
              {tab === "text" && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-navy-500 font-medium text-sm uppercase tracking-wider">Raw Input</h2>
                    <button
                      onClick={() => { setRaw(SAMPLE_WHATSAPP_INPUT); setParsed([]); setErrors([]); }}
                      className="text-amber-500 text-xs hover:text-amber-600 flex items-center gap-1"
                    >
                      <ClipboardPaste size={12} /> Load sample
                    </button>
                  </div>
                  <textarea
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                    placeholder="Paste WhatsApp inventory here..."
                    rows={18}
                    className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:border-amber-400 transition-colors leading-relaxed text-slate-700 bg-white placeholder-slate-300"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleTextParse} disabled={!raw.trim()} className="flex-1">
                      <Upload size={14} /> Parse Inventory
                    </Button>
                    {raw && (
                      <Button variant="ghost" onClick={reset}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* EXCEL tab */}
              {tab === "excel" && (
                <>
                  <h2 className="text-navy-500 font-medium text-sm uppercase tracking-wider">Upload Excel File</h2>
                  <div
                    onClick={() => excelRef.current?.click()}
                    className={clsx(
                      "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                      excelFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-amber-300 bg-slate-50"
                    )}
                  >
                    <FileSpreadsheet size={32} className={excelFile ? "text-emerald-500" : "text-slate-300"} />
                    {excelFile ? (
                      <>
                        <p className="text-emerald-700 font-medium text-sm">{excelFile.name}</p>
                        <p className="text-slate-400 text-xs">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-500 text-sm font-medium">Click to upload .xlsx file</p>
                        <p className="text-slate-400 text-xs">Columns: Model, Storage, Color, Grade, Price, Qty, Country</p>
                      </>
                    )}
                  </div>
                  <input ref={excelRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelChange} />
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-700 text-xs font-medium mb-1">Required Excel columns (any order):</p>
                    <p className="text-amber-600 text-xs font-mono">Model · Storage · Color · Grade · Price · Qty · Country</p>
                    <p className="text-amber-500 text-xs mt-1">Column names are flexible (e.g. "Qty" or "Quantity" both work)</p>
                  </div>
                </>
              )}

              {/* SCREENSHOT tab */}
              {tab === "screenshot" && (
                <>
                  <h2 className="text-navy-500 font-medium text-sm uppercase tracking-wider">Upload Screenshot</h2>
                  <div
                    onClick={() => imgRef.current?.click()}
                    className={clsx(
                      "border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all",
                      imgPreview ? "border-slate-200" : "border-slate-200 hover:border-amber-300 bg-slate-50 p-10 flex flex-col items-center justify-center gap-3"
                    )}
                  >
                    {imgPreview ? (
                      <img src={imgPreview} alt="preview" className="w-full rounded-xl object-contain max-h-64" />
                    ) : (
                      <>
                        <Camera size={32} className="text-slate-300" />
                        <p className="text-slate-500 text-sm font-medium">Click to upload screenshot</p>
                        <p className="text-slate-400 text-xs">WhatsApp price list, supplier screenshot, etc.</p>
                      </>
                    )}
                  </div>
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />

                  {analyzeError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-red-600 text-xs">{analyzeError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleAnalyze} disabled={!imgFile || analyzing} className="flex-1">
                      {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                      {analyzing ? "Analyzing..." : "Analyze with AI"}
                    </Button>
                    {imgFile && (
                      <Button variant="ghost" onClick={reset}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs">
                    Uses Claude AI (claude-haiku). Requires <code className="bg-slate-100 px-1 rounded">ANTHROPIC_API_KEY</code> in Vercel env vars.
                  </p>
                </>
              )}

              {/* Parse warnings */}
              {errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-mono">
                    Warnings ({errors.length})
                  </p>
                  {errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-600 text-xs">{e}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Preview panel ─────────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-navy-500 font-medium text-sm uppercase tracking-wider">
                  Preview ({parsed.length} items)
                </h2>
                {parsed.length > 0 && (
                  <button
                    onClick={() =>
                      setSelected(
                        selected.size === parsed.length
                          ? new Set()
                          : new Set(parsed.map((_, i) => i))
                      )
                    }
                    className="text-slate-400 text-xs hover:text-slate-600 transition-colors"
                  >
                    {selected.size === parsed.length ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>

              {parsed.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 text-center bg-slate-50">
                  <Upload size={28} className="text-slate-300 mb-3" />
                  <p className="text-slate-400 text-sm">Parsed items appear here</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {parsed.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => toggleSelect(i)}
                      className={clsx(
                        "bg-white border rounded-xl p-4 cursor-pointer transition-all shadow-sm",
                        selected.has(i)
                          ? "border-amber-400 ring-1 ring-amber-300"
                          : "border-slate-200 opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {item.flag && <span>{item.flag}</span>}
                            {item.country && !item.flag && (
                              <span className="text-xs text-amber-500">{item.country}</span>
                            )}
                            <p className="text-navy-500 text-sm font-medium leading-snug">{item.model}</p>
                          </div>
                          <p className="text-slate-400 text-xs mt-0.5">{item.storage} · {item.color}</p>
                        </div>
                        <div className={clsx(
                          "w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-all",
                          selected.has(i) ? "bg-amber-400 border-amber-400" : "border-slate-300 bg-white"
                        )}>
                          {selected.has(i) && <Check size={11} className="text-white" />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge label={item.grade} className={GRADE_COLORS[item.grade]} />
                        <span className="text-slate-400 text-xs">{item.quantity} pcs</span>
                        <span className="ml-auto text-amber-500 font-mono text-sm font-semibold">
                          {item.sellerPrice.toLocaleString()} AED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {parsed.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Selected</span>
                    <span className="text-navy-500 font-medium">{selected.size} / {parsed.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Commission added</span>
                    <span className="text-emerald-600 font-mono">+20 AED each</span>
                  </div>
                  <Button
                    onClick={handleImport}
                    loading={importing}
                    disabled={selected.size === 0}
                    size="lg"
                    className="w-full mt-1"
                  >
                    Import {selected.size} Item{selected.size !== 1 ? "s" : ""} →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
