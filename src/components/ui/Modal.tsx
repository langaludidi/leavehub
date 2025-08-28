import React from "react";
import Button from "./Button";

export default function Modal({
  open, title, children, onClose, footer
}: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; footer?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-lg font-semibold">{title}</div>
          <div className="p-4">{children}</div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            {footer ?? <Button variant="secondary" onClick={onClose}>Close</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
