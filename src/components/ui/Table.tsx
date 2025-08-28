import React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">{children}</table>;
}
export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50 dark:bg-gray-900/40">{children}</thead>;
}
export function TH({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{children}</th>;
}
export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-800">{children}</tbody>;
}
export function TD({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-2 text-sm">{children}</td>;
}
