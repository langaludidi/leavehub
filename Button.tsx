import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export default function Button({
  children, variant = "primary", size = "md", className = "", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60";
  const sizes = size === "sm" ? "text-sm px-2.5 py-1.5" : "text-sm px-3 py-2";
  const variants: Record<Variant, string> = {
    primary:  "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:"border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
    ghost:    "bg-transparent text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800",
    danger:   "bg-rose-600 text-white hover:bg-rose-700"
  };
  return (
    <button className={[base, sizes, variants[variant], className].join(" ")} {...props}>
      {children}
    </button>
  );
}
