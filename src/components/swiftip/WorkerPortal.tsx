"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { T } from "./tokens";
import { QRCode } from "./QRCode";
import { Money } from "./Money";
import { AVAILABLE_STATIONS, BANKS } from "./seed";
import type { Worker } from "./types";

type Screen = "login" | "register" | "dashboard";
type DashTab = "home" | "qr" | "history" | "payout";

interface WorkerPortalProps {
  workers: Worker[];
  setWorkers: Dispatch<SetStateAction<Worker[]>>;
  toast: (msg: string) => void;
}

interface RegData {
  name: string;
  phone: string;
  station: string;
  bank: string;
  accNum: string;
}

const DASH_TABS: { id: DashTab; label: string; icon: string }[] = [
  { id: "home",    label: "Home",    icon: "⚡" },
  { id: "qr",      label: "My QR",   icon: "◻" },
  { id: "history", label: "History", icon: "📋" },
  { id: "payout",  label: "Pay Out", icon: "💸" },
];

export function WorkerPortal({ workers, setWorkers, toast }: WorkerPortalProps) {
  const [screen, setScreen] = useState<Screen>("login");
  const [worker, setWorker] = useState<Worker | null>(null);
  const [regData, setRegData] = useState<RegData>({ name: "", phone: "", station: "", bank: "", accNum: "" });
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [activeTab, setActiveTab] = useState<DashTab>("home");

  const login = (w: Worker) => { setWorker(w); setScreen("dashboard"); };

  const register = () => {
    if (!regData.name || !regData.phone || !regData.station) {
      toast("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newWorker: Worker = {
        id: `W${Date.now()}`,
        name: regData.name,
        station: regData.station,
        phone: regData.phone,
        bank: regData.bank ? `${regData.bank} ****${regData.accNum.slice(-4)}` : "Not set",
        balance: 0,
        tips: [],
        payouts: [],
        active: true,
      };
      setWorkers((prev) => [...prev, newWorker]);
      setWorker(newWorker);
      setScreen("dashboard");
      setLoading(false);
      toast("✅ Registration complete! Your QR code is ready.");
    }, 1400);
  };

  const requestPayout = () => {
    if (!worker) return;
    const amt = parseFloat(payoutAmount);
    if (!amt || amt > worker.balance || amt < 20) {
      toast("Minimum payout is R20");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const payout = {
        id: `P${Date.now()}`,
        amount: amt,
        date: new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }),
        status: "paid" as const,
      };
      const updated: Worker = {
        ...worker,
        balance: worker.balance - amt,
        payouts: [payout, ...worker.payouts],
      };
      setWorker(updated);
      setWorkers((prev) => prev.map((w) => (w.id === worker.id ? updated : w)));
      setPayoutAmount("");
      setLoading(false);
      toast(`✅ R${amt.toFixed(2)} sent to ${worker.bank}`);
    }, 1800);
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div className="fade-in" style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>👷</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: T.dark }}>Worker Portal</h2>
          <p style={{ color: T.mid, fontSize: 14, marginTop: 4 }}>Sign in or register to receive tips</p>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 14, color: T.dark }}>Registered Workers</p>
          {workers.map((w) => (
            <button
              key={w.id}
              onClick={() => login(w)}
              style={{
                width: "100%",
                textAlign: "left",
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = T.teal)}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: T.teal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
                  {w.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: T.dark }}>{w.name}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{w.station}</div>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 700, color: T.teal }}>
                R{w.balance.toFixed(2)}
              </div>
            </button>
          ))}
        </div>

        <button className="btn-ghost" onClick={() => setScreen("register")} style={{ width: "100%" }}>
          + Register as new worker
        </button>
      </div>
    );
  }

  // ── Register screen ───────────────────────────────────────────────────────
  if (screen === "register") {
    return (
      <div className="fade-in" style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
        <button
          onClick={() => setScreen("login")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: T.teal,
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Register on SwiftTip</h2>
        <p style={{ color: T.mid, fontSize: 13, marginBottom: 24 }}>
          Takes 2 minutes. Your QR code will be ready immediately.
        </p>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label>Full name (as on SA ID)</label>
            <input
              placeholder="e.g. Sipho Dlamini"
              value={regData.name}
              onChange={(e) => setRegData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label>Mobile number</label>
            <input
              placeholder="e.g. 0821234567"
              value={regData.phone}
              onChange={(e) => setRegData((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label>Your fuel station</label>
            <select
              value={regData.station}
              onChange={(e) => setRegData((p) => ({ ...p, station: e.target.value }))}
            >
              <option value="">Select station</option>
              {AVAILABLE_STATIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Bank</label>
            <select
              value={regData.bank}
              onChange={(e) => setRegData((p) => ({ ...p, bank: e.target.value }))}
            >
              <option value="">Select your bank</option>
              {BANKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Account number</label>
            <input
              placeholder="Your bank account number"
              value={regData.accNum}
              onChange={(e) => setRegData((p) => ({ ...p, accNum: e.target.value }))}
            />
          </div>

          <button className="btn-primary" onClick={register} disabled={loading}>
            {loading ? <span className="spinner" /> : "Register & Get My QR Code"}
          </button>

          <p style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
            By registering you agree to SwiftTip's terms. Your details are secured and POPIA-compliant.
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  if (!worker) return null;

  const monthTotal = worker.tips.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fade-in" style={{ maxWidth: 420, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDk} 100%)`,
          padding: "20px 20px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <button
          onClick={() => setScreen("login")}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "white",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 12,
            marginBottom: 16,
            fontFamily: "inherit",
          }}
        >
          ← Switch worker
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontWeight: 800, fontSize: 18 }}>
              {worker.name.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Good day,</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 17 }}>{worker.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{worker.station}</div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 4 }}>
            Available balance
          </div>
          <Money amount={worker.balance} size={34} color="white" />
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>This month</div>
              <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
                R{monthTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Tips received</div>
              <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{worker.tips.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px 16px", minHeight: 300 }}>
        {activeTab === "home" && (
          <div className="slide-in">
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recent tips</p>
            {worker.tips.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
                <p style={{ color: T.muted, fontSize: 14 }}>
                  No tips yet. Share your QR code to start receiving!
                </p>
              </div>
            ) : (
              worker.tips.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="card"
                  style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: T.tealLt,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    💳
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Tip received</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{t.time}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: T.green, fontSize: 16 }}>
                    +R{t.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
            <div
              className="card"
              style={{ marginTop: 16, background: T.amberLt, border: `1px solid ${T.amber}30` }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, color: T.amberDk, marginBottom: 4 }}>
                💡 Tip to grow your income
              </div>
              <p style={{ fontSize: 12, color: T.amberDk }}>
                Workers who display their QR code prominently earn 40% more in tips. Keep your badge visible!
              </p>
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div className="slide-in" style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Your personal QR code</p>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              Customers scan this to tip you instantly. No app needed on their side.
            </p>
            <div className="card" style={{ display: "inline-block", padding: 24, marginBottom: 16 }}>
              <QRCode value={`swiftip.co.za/tip/${worker.id}`} size={160} />
              <div style={{ marginTop: 12, fontSize: 12, color: T.muted }}>
                swiftip.co.za/tip/{worker.id}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-primary" onClick={() => toast("QR code downloaded!")}>
                ⬇ Download QR
              </button>
              <button className="btn-ghost" onClick={() => toast("Link copied!")}>
                🔗 Share link
              </button>
            </div>

            <div className="card" style={{ marginTop: 20, textAlign: "left" }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>How it works</p>
              {[
                ["1", "Customer sees your badge or QR card"],
                ["2", "They scan with any phone — no app needed"],
                ["3", "They choose an amount and pay instantly"],
                ["4", "Money appears in your balance right away"],
              ].map(([n, text]) => (
                <div key={n} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: T.teal,
                      color: "white",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {n}
                  </div>
                  <span style={{ fontSize: 13, color: T.mid, paddingTop: 2 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="slide-in">
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Transaction history</p>
            {worker.tips.length === 0 && worker.payouts.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 32 }}>
                <p style={{ color: T.muted, fontSize: 14 }}>No transactions yet.</p>
              </div>
            ) : (
              <>
                {worker.tips.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>💳</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Tip received</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{t.time}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: T.green }}>+R{t.amount.toFixed(2)}</span>
                  </div>
                ))}
                {worker.payouts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 20 }}>🏦</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>Payout to bank</div>
                        <div style={{ fontSize: 11, color: T.muted }}>
                          {p.date} · {worker.bank}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: T.red }}>−R{p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "payout" && (
          <div className="slide-in">
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Request a payout</p>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              Money is sent to your bank account — usually within minutes.
            </p>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: T.mid }}>Available balance</span>
                <Money amount={worker.balance} size={18} color={T.teal} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: T.mid }}>Payout to</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{worker.bank}</span>
              </div>

              <label>Amount to withdraw (min R20)</label>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontWeight: 600,
                    color: T.mid,
                  }}
                >
                  R
                </span>
                <input
                  placeholder="0.00"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  style={{ paddingLeft: 28 }}
                  type="number"
                  min="20"
                  max={worker.balance}
                />
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[50, 100, 200].map((a) => (
                  <button
                    key={a}
                    className="btn-ghost"
                    onClick={() => setPayoutAmount(Math.min(a, worker.balance).toString())}
                    style={{ flex: 1, padding: "8px 4px", fontSize: 13 }}
                  >
                    R{a}
                  </button>
                ))}
                <button
                  className="btn-ghost"
                  onClick={() => setPayoutAmount(worker.balance.toString())}
                  style={{ flex: 1, padding: "8px 4px", fontSize: 13 }}
                >
                  All
                </button>
              </div>

              <button
                className="btn-primary"
                onClick={requestPayout}
                disabled={loading || worker.balance < 20}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  `Withdraw${payoutAmount ? ` R${parseFloat(payoutAmount) || 0}` : ""}`
                )}
              </button>
            </div>

            <div className="card" style={{ background: T.tealLt, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 12, color: T.mid }}>
                💡 SwiftTip processes payouts instantly via EFT. Funds arrive in your bank account within
                minutes to a few hours depending on your bank.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
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
