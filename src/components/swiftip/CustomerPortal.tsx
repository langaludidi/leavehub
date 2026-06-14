"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { T } from "./tokens";
import { Money } from "./Money";
import type { Worker, Station, PayMethod } from "./types";

type Step = "scan" | "tip" | "done";

interface CustomerPortalProps {
  workers: Worker[];
  setWorkers: Dispatch<SetStateAction<Worker[]>>;
  setStations: Dispatch<SetStateAction<Station[]>>;
  toast: (msg: string) => void;
}

const TIP_PRESETS = [10, 15, 20, 30, 50] as const;

const PAY_METHODS: { id: PayMethod; label: string }[] = [
  { id: "card",     label: "💳 Card" },
  { id: "snapscan", label: "📱 SnapScan" },
  { id: "ozow",     label: "🏦 Ozow EFT" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("");
}

export function CustomerPortal({ workers, setWorkers, setStations, toast }: CustomerPortalProps) {
  const [step, setStep]                   = useState<Step>("scan");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [tipAmount, setTipAmount]         = useState<number | null>(null);
  const [customAmt, setCustomAmt]         = useState("");
  const [payMethod, setPayMethod]         = useState<PayMethod>("card");
  const [loading, setLoading]             = useState(false);
  const [rating, setRating]               = useState(0);

  const resolvedAmount = tipAmount ?? (customAmt ? parseFloat(customAmt) : null);

  const selectWorker = (w: Worker) => { setSelectedWorker(w); setStep("tip"); };

  const pay = () => {
    const amt = resolvedAmount;
    if (!amt || amt < 5) { toast("Minimum tip is R5"); return; }
    if (!selectedWorker) return;
    setLoading(true);
    setTimeout(() => {
      const newTip = {
        id: `T${Date.now()}`,
        amount: amt,
        from: "Customer",
        time: "Just now",
        status: "received" as const,
      };
      const updatedWorker: Worker = {
        ...selectedWorker,
        balance: selectedWorker.balance + amt,
        tips: [newTip, ...selectedWorker.tips],
      };
      setWorkers((prev: Worker[]) => prev.map((w: Worker) => (w.id === selectedWorker.id ? updatedWorker : w)));
      setStations((prev: Station[]) =>
        prev.map((s: Station) =>
          s.workers.includes(selectedWorker.id) ? { ...s, monthlyTips: s.monthlyTips + amt } : s
        )
      );
      setSelectedWorker(updatedWorker);
      setLoading(false);
      setStep("done");
    }, 1600);
  };

  const reset = () => {
    setStep("scan");
    setSelectedWorker(null);
    setTipAmount(null);
    setCustomAmt("");
    setRating(0);
  };

  // ── Scan / select worker ──────────────────────────────────────────────────
  if (step === "scan") {
    return (
      <div className="fade-in" style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ padding: "24px 16px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>💳</div>
            <h2 style={{ fontWeight: 800, fontSize: 22 }}>Tip a worker</h2>
            <p style={{ color: T.mid, fontSize: 14, marginTop: 4 }}>
              Great service deserves recognition.
              <br />
              Scan a worker&apos;s QR or select below.
            </p>
          </div>

          <div
            style={{
              background: `linear-gradient(135deg, ${T.dark} 0%, #2A4A47 100%)`,
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                border: "2px dashed rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: 24,
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>◻</div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                Point your camera at a worker&apos;s SwiftTip badge
              </p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
              Camera access required — or select a worker below
            </p>
          </div>

          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: T.mid }}>
            Or select a worker at this station:
          </p>
          {workers.filter((w) => w.active).map((w) => (
            <button
              key={w.id}
              onClick={() => selectWorker(w)}
              style={{
                width: "100%",
                textAlign: "left",
                background: T.white,
                border: `1.5px solid ${T.border}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = T.teal;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${T.teal}, ${T.tealDk})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>{initials(w.name)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.dark }}>{w.name}</div>
                <div style={{ fontSize: 12, color: T.muted }}>Fuel Attendant · {w.station}</div>
              </div>
              <span style={{ color: T.teal, fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Choose tip amount ─────────────────────────────────────────────────────
  if (step === "tip" && selectedWorker) {
    return (
      <div className="slide-in" style={{ padding: "24px 16px", maxWidth: 420, margin: "0 auto" }}>
        <button
          onClick={() => setStep("scan")}
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

        <div
          className="card"
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            marginBottom: 24,
            background: `linear-gradient(135deg, ${T.tealLt}, white)`,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.teal}, ${T.tealDk})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "white", fontWeight: 800, fontSize: 20 }}>
              {initials(selectedWorker.name)}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: T.dark }}>{selectedWorker.name}</div>
            <div style={{ fontSize: 13, color: T.mid }}>Fuel Attendant</div>
            <div style={{ fontSize: 12, color: T.muted }}>{selectedWorker.station}</div>
          </div>
          <span className="tag tag-green" style={{ marginLeft: "auto" }}>✓ Verified</span>
        </div>

        <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Choose tip amount</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
          {TIP_PRESETS.map((a) => (
            <button
              key={a}
              onClick={() => { setTipAmount(a); setCustomAmt(""); }}
              style={{
                border: `2px solid ${tipAmount === a ? T.teal : T.border}`,
                background: tipAmount === a ? T.tealLt : T.white,
                borderRadius: 10,
                padding: "10px 4px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                color: tipAmount === a ? T.teal : T.dark,
                transition: "all 0.15s",
              }}
            >
              R{a}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 20 }}>
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
            placeholder="Custom amount"
            value={customAmt}
            onChange={(e) => { setCustomAmt(e.target.value); setTipAmount(null); }}
            style={{ paddingLeft: 28 }}
            type="number"
            min="5"
          />
        </div>

        <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: T.mid }}>Pay with</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {PAY_METHODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPayMethod(id)}
              style={{
                flex: 1,
                border: `2px solid ${payMethod === id ? T.teal : T.border}`,
                background: payMethod === id ? T.tealLt : T.white,
                borderRadius: 10,
                padding: "9px 4px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: 600,
                color: payMethod === id ? T.teal : T.mid,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="btn-amber"
          onClick={pay}
          disabled={loading || (!tipAmount && !customAmt)}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            `Tip R${resolvedAmount ?? "—"} to ${selectedWorker.name.split(" ")[0]}`
          )}
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: T.muted, marginTop: 10 }}>
          🔒 Secured by bank-level encryption · POPIA compliant
        </p>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  return (
    <div
      className="slide-in"
      style={{ padding: "48px 24px", textAlign: "center", maxWidth: 420, margin: "0 auto" }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: T.tealLt,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 36,
        }}
      >
        ✅
      </div>
      <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Tip sent!</h2>
      <p style={{ color: T.mid, fontSize: 14, marginBottom: 8 }}>
        <strong style={{ color: T.dark }}>{selectedWorker?.name}</strong> received your tip instantly.
      </p>

      <div style={{ background: T.tealLt, borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>Amount tipped</div>
        {resolvedAmount != null && <Money amount={resolvedAmount} size={32} color={T.teal} />}
      </div>

      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>How was your service today?</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => { setRating(s); toast("Thanks for your feedback!"); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 28,
              opacity: s <= rating ? 1 : 0.3,
              transition: "all 0.15s",
              transform: s <= rating ? "scale(1.1)" : "scale(1)",
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={reset}>Done</button>
      <p style={{ fontSize: 12, color: T.muted, marginTop: 12 }}>
        You&apos;ll receive a confirmation SMS to your number.
      </p>
    </div>
  );
}
