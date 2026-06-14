"use client";

import { useEffect } from "react";
import { T } from "./tokens";

interface ToastProps {
  msg: string;
  onDone: () => void;
}

export function Toast({ msg, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="slide-in"
      style={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        background: T.dark,
        color: "white",
        borderRadius: 12,
        padding: "12px 20px",
        fontSize: 14,
        fontWeight: 500,
        zIndex: 1000,
        whiteSpace: "nowrap",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      {msg}
    </div>
  );
}
