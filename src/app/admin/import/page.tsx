"use client";

import { useState } from "react";
import {
  Upload,
  ClipboardPaste,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
} from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GRADE_COLORS } from "@/lib/constants";
import { parseWhatsAppInventory, SAMPLE_WHATSAPP_INPUT } from "@/utils/parser";
import { importInventoryBatch } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ParsedInventoryItem } from "@/types";

export default function ImportPage() {
  const { user } = useAuth();
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedInventoryItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);

  const handleParse = () => {
    const result = parseWhatsAppInventory(raw);
    setParsed(result.items);
    setErrors(result.errors);
    setSelected(new Set(result.items.map((_, i) => i)));
    setImportDone(false);
  };

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
      setRaw("");
      setParsed([]);
      setErrors([]);
      setSelected(new Set());
    } finally {
      setImporting(false);
    }
  };

  const loadSample = () => {
    setRaw(SAMPLE_WHATSAPP_INPUT);
    setParsed([]);
    setErrors([]);
    setImportDone(false);
  };

  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-semibold">Import Stock</h1>
            <p className="text-surface-400 text-sm mt-0.5">
              Paste WhatsApp inventory text to bulk import
            </p>
          </div>

          {importDone && (
            <div className="flex items-center gap-3 bg-jade-400/10 border border-jade-400/30 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 size={18} className="text-jade-400 shrink-0" />
              <p className="text-jade-400 font-medium">
                Successfully imported to inventory!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-medium text-sm uppercase tracking-wider">
                  Raw Input
                </h2>
                <button
                  onClick={loadSample}
                  className="text-amber-400 text-xs hover:text-amber-500 transition-colors flex items-center gap-1"
                >
                  <ClipboardPaste size={12} />
                  Load sample
                </button>
              </div>

              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={`Paste WhatsApp inventory here, e.g:\n\niPhone 14 Pro 256 Purple\nA Grade\n2450 AED\n5 pcs`}
                rows={18}
                className="w-full bg-surface-800 border border-surface-600 text-white placeholder-surface-500 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:border-amber-400/50 transition-colors leading-relaxed"
              />

              <div className="flex gap-3">
                <Button
                  onClick={handleParse}
                  disabled={!raw.trim()}
                  className="flex-1"
                >
                  <Upload size={14} />
                  Parse Inventory
                </Button>
                {raw && (
                  <Button
                    variant="ghost"
                    onClick={() => { setRaw(""); setParsed([]); setErrors([]); }}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-surface-400 text-xs uppercase tracking-wider font-mono">
                    Parse Warnings ({errors.length})
                  </p>
                  {errors.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
                    >
                      <XCircle size={12} className="text-rose-400 mt-0.5 shrink-0" />
                      <p className="text-rose-400 text-xs">{e}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-medium text-sm uppercase tracking-wider">
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
                    className="text-surface-400 text-xs hover:text-white transition-colors"
                  >
                    {selected.size === parsed.length ? "Deselect all" : "Select all"}
                  </button>
                )}
              </div>

              {parsed.length === 0 ? (
                <div className="bg-surface-800 border border-surface-600 border-dashed rounded-xl flex flex-col items-center justify-center py-16 text-center">
                  <Upload size={28} className="text-surface-600 mb-3" />
                  <p className="text-surface-400 text-sm">Parsed items appear here</p>
                  <p className="text-surface-600 text-xs mt-1">
                    Paste text and click Parse
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {parsed.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => toggleSelect(i)}
                      className={`bg-surface-800 border rounded-xl p-4 cursor-pointer transition-all ${
                        selected.has(i)
                          ? "border-amber-400/40 bg-amber-400/5"
                          : "border-surface-600 opacity-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium leading-snug">
                            {item.model}
                          </p>
                          <p className="text-surface-400 text-xs mt-0.5">
                            {item.storage} · {item.color}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-all ${
                            selected.has(i)
                              ? "bg-amber-400 border-amber-400"
                              : "border-surface-500 bg-transparent"
                          }`}
                        >
                          {selected.has(i) && (
                            <Check size={11} className="text-surface-900" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          label={item.grade}
                          className={GRADE_COLORS[item.grade]}
                        />
                        <span className="text-surface-400 text-xs">
                          {item.quantity} pcs
                        </span>
                        <span className="ml-auto text-amber-400 font-mono text-sm font-semibold">
                          {item.sellerPrice.toLocaleString()} AED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {parsed.length > 0 && (
                <div className="bg-surface-700 border border-surface-600 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Selected</span>
                    <span className="text-white font-medium">
                      {selected.size} / {parsed.length} items
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Commission added</span>
                    <span className="text-jade-400 font-mono">+20 AED each</span>
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

          {/* Format guide */}
          <div className="mt-8 bg-surface-800 border border-surface-600 rounded-xl p-5">
            <h3 className="text-white font-medium text-sm mb-3">
              Supported Format
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-surface-400 text-xs mb-2 uppercase tracking-wider font-mono">
                  Block format (blank line between items)
                </p>
                <pre className="bg-surface-700 rounded-lg p-3 text-xs text-surface-300 font-mono leading-relaxed">
{`iPhone 14 Pro 256 Purple
A Grade
2450 AED
5 pcs

Samsung S24 512GB Black
A+ Grade
3200 AED
2 pcs`}
                </pre>
              </div>
              <div>
                <p className="text-surface-400 text-xs mb-2 uppercase tracking-wider font-mono">
                  Parsed fields
                </p>
                <ul className="space-y-1.5 text-xs text-surface-400">
                  {[
                    ["Model", "First line of block"],
                    ["Storage", "e.g. 128GB, 256GB, 512GB"],
                    ["Color", "Detected from model line"],
                    ["Grade", "A+, A, A-, B, C (any order)"],
                    ["Price", "Number followed by AED"],
                    ["Qty", "Number + pcs/pieces/units"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex gap-2">
                      <span className="text-amber-400 font-mono w-16 shrink-0">{k}</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
