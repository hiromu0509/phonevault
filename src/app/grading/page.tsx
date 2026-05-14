"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";

const grades = [
  {
    grade: "A+",
    label: "未使用品同等",
    color: "text-emerald-400",
    border: "border-emerald-400/40",
    bg: "bg-emerald-400/5",
    dot: "bg-emerald-400",
    points: [
      "新品・未使用または開封済み未使用",
      "傷・汚れ・へこみが一切なし",
      "バッテリー容量 95% 以上",
      "付属品・箱あり（または同等品）",
      "すべての機能が正常動作",
    ],
  },
  {
    grade: "A",
    label: "極美品",
    color: "text-emerald-300",
    border: "border-emerald-300/40",
    bg: "bg-emerald-300/5",
    dot: "bg-emerald-300",
    points: [
      "ごく軽微な使用感のみ（通常使用の範囲内）",
      "目立つ傷・汚れなし",
      "バッテリー容量 85% 以上",
      "画面・ボディともにクリアな状態",
      "すべての機能が正常動作",
    ],
  },
  {
    grade: "A-",
    label: "美品",
    color: "text-amber-400",
    border: "border-amber-400/40",
    bg: "bg-amber-400/5",
    dot: "bg-amber-400",
    points: [
      "わずかな細かい傷あり（目立たないレベル）",
      "画面に軽微なすり傷の可能性あり",
      "バッテリー容量 80% 以上",
      "ボディに小さな使用感あり",
      "すべての機能が正常動作",
    ],
  },
  {
    grade: "B",
    label: "良品",
    color: "text-orange-400",
    border: "border-orange-400/40",
    bg: "bg-orange-400/5",
    dot: "bg-orange-400",
    points: [
      "目立つ傷・すり傷が複数あり",
      "ボディに軽微なへこみの可能性あり",
      "バッテリー容量 75% 以上",
      "画面に目立つすり傷の可能性あり",
      "機能はすべて正常動作",
    ],
  },
  {
    grade: "C",
    label: "訳あり品",
    color: "text-rose-400",
    border: "border-rose-400/40",
    bg: "bg-rose-400/5",
    dot: "bg-rose-400",
    points: [
      "明らかな傷・へこみ・割れがあり",
      "画面割れ・液晶不良の可能性あり",
      "バッテリー容量 70% 以上",
      "外観上の大きなダメージあり",
      "基本機能は動作（一部制限の可能性あり）",
    ],
  },
];

export default function GradingPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-white text-2xl font-semibold">グレーディング基準</h1>
            <p className="text-surface-400 text-sm mt-1">
              Best of Best が採用する端末状態評価の基準です。
            </p>
          </div>

          <div className="space-y-4">
            {grades.map(({ grade, label, color, border, bg, dot, points }) => (
              <div
                key={grade}
                className={`rounded-xl border ${border} ${bg} p-5`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl border-2 ${border} flex items-center justify-center`}>
                    <span className={`font-bold text-lg ${color}`}>{grade}</span>
                  </div>
                  <div>
                    <p className={`font-semibold text-base ${color}`}>{grade}</p>
                    <p className="text-surface-400 text-sm">{label}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-surface-300 text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-surface-800 border border-surface-600 rounded-xl p-4">
            <p className="text-surface-400 text-xs leading-relaxed">
              ※ 上記グレードはすべて工場出荷時設定（初期化済み）の端末が対象です。
              バッテリー容量は目安であり、個体差があります。
              詳細は各商品の備考欄をご確認ください。
            </p>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
