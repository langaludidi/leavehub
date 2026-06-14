"use client";

import { useState } from "react";
import { T } from "./tokens";
import type { Worker, Station } from "./types";

type DashTab = "overview" | "workers" | "analytics";

interface EmployerDashboardProps {
  workers: Worker[];
  stations: Station[];
  toast: (msg: string) => void;
}

const DASH_TABS: { id: DashTab; label: string; icon: string }[] = [
  { id: "overview",  label: "Overview",  icon: "📊" },
  { id: "workers",   label: "Workers",   icon: "👷" },
  { id: "analytics", label: "Analytics", icon: "📈" },
];

const HOURLY_DATA = [
  { hour: "6am",  tips: 2  },
  { hour: "8am",  tips: 8  },
  { hour: "10am", tips: 12 },
  { hour: "12pm", tips: 18 },
  { hour: "2pm",  tips: 15 },
  { hour: "4pm",  tips: 20 },
  { hour: "6pm",  tips: 11 },
  { hour: "8pm",  tips: 5  },
];

const MONTHLY_DATA = [
  { month: "April 2026",        value: 3200 },
  { month: "May 2026",          value: 5840 },
  { month: "June 2026 (MTD)",   value: 8420 },
];

function workerTotalEarned(w: Worker) {
  return w.tips.reduce((s, t) => s + t.amount, 0);
}

export function EmployerDashboard({ workers, stations, toast }: EmployerDashboardProps) {
  const [activeTab, setActiveTab]       = useState<DashTab>("overview");
  const [selectedStation, setSelectedStation] = useState<Station>(stations[0]);

  const stationWorkers  = workers.filter((w) => selectedStation?.workers.includes(w.id));
  const totalTips       = workers.reduce((s, w) => s + workerTotalEarned(w), 0);
  const totalTipCount   = workers.reduce((s, w) => s + w.tips.length, 0);
  const avgTip          = totalTipCount > 0 ? totalTips / totalTipCount : 0;
  const maxHourlyTips   = Math.max(...HOURLY_DATA.map((d) => d.tips));
  const maxMonthlyValue = Math.max(...MONTHLY_DATA.map((d) => d.value));

  const kpis = [
    { label: "Total tips this month", value: `R${totalTips.toFixed(0)}`,               icon: "💰", color: T.teal    },
    { label: "Active workers",        value: workers.filter((w) => w.active).length,    icon: "👷", color: T.tealDk  },
    { label: "Avg tip value",         value: `R${avgTip.toFixed(2)}`,                   icon: "📊", color: T.amber   },
    { label: "Partner stations",      value: stations.length,                            icon: "⛽", color: T.mid     },
  ];

  const sortedByEarned = [...workers].sort(
    (a, b) => workerTotalEarned(b) - workerTotalEarned(a)
  );
  const maxEarned = workerTotalEarned(sortedByEarned[0]) || 1;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="fade-in" style={{ maxWidth: 420, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.dark} 0%, #2A4A47 100%)`,
          padding: "20px 20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Employer Dashboard</div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18 }}>
              Dealers Group (Pty) Ltd
            </div>
          </div>
          <span className="tag tag-green">Live</span>
        </div>

        <select
          value={selectedStation?.id}
          onChange={(e) => {
            const found = stations.find((s) => s.id === e.target.value);
            if (found) setSelectedStation(found);
          }}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 13,
          }}
        >
          {stations.map((s) => (
            <option key={s.id} value={s.id} style={{ color: T.dark }}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 16px 0" }}>
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: k.color, marginBottom: 2 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px 16px 80px" }}>
        {activeTab === "overview" && (
          <div className="slide-in">
            {/* Bar chart */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                Today&apos;s tip activity by hour
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {HOURLY_DATA.map((d) => (
                  <div
                    key={d.hour}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        background: `linear-gradient(to top, ${T.teal}, ${T.tealLt})`,
                        borderRadius: "4px 4px 0 0",
                        height: `${(d.tips / maxHourlyTips) * 64}px`,
                        minHeight: 4,
                        transition: "height 0.4s ease",
                      }}
                    />
                    <span style={{ fontSize: 9, color: T.muted }}>{d.hour}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top earners */}
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                Top earners this month
              </p>
              {sortedByEarned.map((w, i) => {
                const earned = workerTotalEarned(w);
                return (
                  <div key={w.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {medals[i] ?? "  "} {w.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
                        R{earned.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: T.border, borderRadius: 3 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(earned / maxEarned) * 100}%`,
                          background: `linear-gradient(to right, ${T.teal}, ${T.amber})`,
                          borderRadius: 3,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="slide-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 15 }}>Workers at {selectedStation?.name}</p>
              <button
                className="btn-ghost"
                onClick={() => toast("Invite link copied!")}
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                + Add worker
              </button>
            </div>

            {stationWorkers.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 32 }}>
                <p style={{ color: T.muted }}>No workers registered at this station yet.</p>
              </div>
            ) : (
              stationWorkers.map((w) => {
                const earned = workerTotalEarned(w);
                return (
                  <div key={w.id} className="card" style={{ marginBottom: 10, padding: "14px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${T.teal}, ${T.tealDk})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ color: "white", fontWeight: 700 }}>
                          {w.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>{w.phone}</div>
                      </div>
                      <span className={`tag ${w.active ? "tag-green" : "tag-red"}`}>
                        {w.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        ["Tips received", w.tips.length],
                        ["Total earned",  `R${earned.toFixed(0)}`],
                        ["Balance",       `R${w.balance.toFixed(0)}`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            background: T.bg,
                            borderRadius: 8,
                            padding: 8,
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>{value}</div>
                          <div style={{ fontSize: 10, color: T.muted }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="slide-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Monthly tip volume</p>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
                Across all partner stations
              </p>
              {MONTHLY_DATA.map(({ month, value }) => (
                <div key={month} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{month}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>
                      R{value.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: 8, background: T.border, borderRadius: 4 }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(value / maxMonthlyValue) * 100}%`,
                        background: `linear-gradient(to right, ${T.teal}, ${T.amber})`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Platform insights</p>
              {[
                ["Avg tip per transaction",   `R${avgTip.toFixed(2)}`],
                ["Digital tip adoption rate", "38%"],
                ["Worker retention rate",     "94%"],
                ["Customer repeat tip rate",  "62%"],
                ["Peak tipping hour",         "4pm – 6pm"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: T.mid }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.dark }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              className="card"
              style={{ background: T.amberLt, border: `1px solid ${T.amber}40` }}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: T.amberDk, marginBottom: 6 }}>
                💡 SwiftTip Monthly Report
              </p>
              <p style={{ fontSize: 13, color: T.amberDk, marginBottom: 12 }}>
                Your June report is ready. Digital tips increased by 44% vs May.
              </p>
              <button
                className="btn-amber"
                onClick={() => toast("Report downloaded!")}
                style={{ padding: "10px 16px", fontSize: 13 }}
              >
                Download Report (PDF)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: T.white,
          borderTop: `1px solid ${T.border}`,
          display: "flex",
        }}
      >
        {DASH_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "10px 4px 12px",
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 600,
              color: activeTab === tab.id ? T.teal : T.muted,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
