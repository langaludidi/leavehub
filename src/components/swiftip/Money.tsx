"use client";

import { useState, useEffect, useRef } from "react";
import { T } from "./tokens";

interface MoneyProps {
  amount: number;
  size?: number;
  color?: string;
  prefix?: string;
}

export function Money({ amount, size = 28, color = T.dark, prefix = "R" }: MoneyProps) {
  const [cls, setCls] = useState("");
  const prev = useRef(amount);

  useEffect(() => {
    if (amount !== prev.current) {
      setCls("pulse");
      const t = setTimeout(() => setCls(""), 600);
      prev.current = amount;
      return () => clearTimeout(t);
    }
  }, [amount]);

  return (
    <span
      className={cls}
      style={{ fontSize: size, fontWeight: 700, color, display: "inline-block" }}
    >
      {prefix}{amount.toFixed(2)}
    </span>
  );
}
