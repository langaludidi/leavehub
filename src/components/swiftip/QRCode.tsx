"use client";

import { T } from "./tokens";

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 140 }: QRCodeProps) {
  const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = 21;
  const cell = size / cells;
  const rng = (n: number) => ((seed * 9301 + 49297 * (n + 1)) % 233280) / 233280;

  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) return true;
      if ((r === 7 || r === 13) && c < 8) return r === 7;
      if (c === 7 && r < 8) return false;
      return rng(r * cells + c) > 0.45;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" rx="8" />
      {grid.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill={T.dark} />
          ) : null
        )
      )}
      <rect x={size / 2 - 14} y={size / 2 - 14} width={28} height={28} fill="white" rx="4" />
      <rect x={size / 2 - 10} y={size / 2 - 10} width={20} height={20} fill={T.teal} rx="3" />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontWeight="800"
        fontFamily="Inter,sans-serif"
      >
        ST
      </text>
    </svg>
  );
}
