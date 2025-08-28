import { createContext, useContext, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";
type T = { id: number; message: string; type: ToastType };

const ToastCtx = createContext<(msg: string, type?: ToastType) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const idRef = useRef(1);

  const show = (message: string, type: ToastType = "info") => {
    const id = idRef.current++;
    setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 3000);
  };

  const value = useMemo(() => show, []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 space-y-3 z-50">
        {items.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-white font-medium backdrop-blur-sm border animate-slide-up ${
              t.type === "success" 
                ? "bg-gradient-to-r from-teal-600 to-teal-500 border-teal-400/30 shadow-teal-500/25" :
              t.type === "error" 
                ? "bg-gradient-to-r from-rose-600 to-rose-500 border-rose-400/30 shadow-rose-500/25" : 
                "bg-gradient-to-r from-slate-700 to-slate-600 border-slate-500/30 shadow-slate-500/25"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
              </span>
              {t.message}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
