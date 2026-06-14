"use client";

import { T } from "./tokens";
import type { Role } from "./types";

interface TopNavProps {
  role: Role;
  setRole: (r: Role) => void;
}

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: "worker",   label: "Worker",   icon: "👷" },
  { id: "customer", label: "Tip Now",  icon: "💳" },
  { id: "employer", label: "Employer", icon: "🏢" },
];

export function TopNav({ role, setRole }: TopNavProps) {
  return (
    <div
      style={{
        background: T.white,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: T.teal,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontWeight: 800, fontSize: 13 }}>ST</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: T.dark, letterSpacing: "-0.3px" }}>
              SwiftTip
            </span>
          </div>
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>MVP Demo</span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "8px 4px 12px",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                color: role === r.id ? T.teal : T.muted,
                borderBottom: `2.5px solid ${role === r.id ? T.teal : "transparent"}`,
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
