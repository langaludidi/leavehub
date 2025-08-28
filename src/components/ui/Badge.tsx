import React from "react";

type Tone = "green" | "yellow" | "red" | "slate";
export default function Badge({ tone = "slate", className = "", children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  const tones: Record<Tone, string> = {
    green:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    yellow: "bg-amber-50  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300",
    red:    "bg-rose-50   text-rose-700   dark:bg-rose-900/30   dark:text-rose-300",
    slate:  "bg-gray-100  text-gray-700  dark:bg-gray-800/60    dark:text-gray-300"
  };
  return <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone], className].join(" ")}>{children}</span>;
}
