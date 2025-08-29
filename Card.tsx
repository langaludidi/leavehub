import React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm", className].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>}
    </div>
  );
}

export function CardBody({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-4", className].join(" ")} {...props} />;
}
