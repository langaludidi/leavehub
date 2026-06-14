"use client";

import { useState } from "react";
import { globalCss, T } from "./tokens";
import { SEED_WORKERS, SEED_STATIONS } from "./seed";
import { TopNav } from "./TopNav";
import { Toast } from "./Toast";
import { WorkerPortal } from "./WorkerPortal";
import { CustomerPortal } from "./CustomerPortal";
import { EmployerDashboard } from "./EmployerDashboard";
import type { Worker, Station, Role } from "./types";

export function SwiftTipApp() {
  const [role, setRole]         = useState<Role>("worker");
  const [workers, setWorkers]   = useState<Worker[]>(SEED_WORKERS);
  const [stations, setStations] = useState<Station[]>(SEED_STATIONS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = (msg: string) => setToastMsg(msg);

  return (
    <>
      <style>{globalCss}</style>
      <div style={{ minHeight: "100vh", background: T.bg }}>
        <TopNav role={role} setRole={setRole} />

        {role === "worker" && (
          <WorkerPortal workers={workers} setWorkers={setWorkers} toast={toast} />
        )}
        {role === "customer" && (
          <CustomerPortal
            workers={workers}
            setWorkers={setWorkers}
            setStations={setStations}
            toast={toast}
          />
        )}
        {role === "employer" && (
          <EmployerDashboard workers={workers} stations={stations} toast={toast} />
        )}

        {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
      </div>
    </>
  );
}
