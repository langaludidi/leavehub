import type { Worker, Station } from "./types";

export const SEED_WORKERS: Worker[] = [
  {
    id: "W001",
    name: "Sipho Dlamini",
    station: "Engen Gqeberha North",
    phone: "0821234567",
    bank: "Capitec ****3421",
    balance: 347.50,
    tips: [
      { id: "T1", amount: 20, from: "Customer", time: "Today 14:32", status: "received" },
      { id: "T2", amount: 15, from: "Customer", time: "Today 13:10", status: "received" },
      { id: "T3", amount: 10, from: "Customer", time: "Today 11:45", status: "received" },
      { id: "T4", amount: 50, from: "Customer", time: "Yesterday 16:20", status: "received" },
    ],
    payouts: [{ id: "P1", amount: 200, date: "12 Jun 2026", status: "paid" }],
    active: true,
  },
  {
    id: "W002",
    name: "Thandi Mokoena",
    station: "Engen Gqeberha North",
    phone: "0839876543",
    bank: "FNB ****8812",
    balance: 182.00,
    tips: [
      { id: "T5", amount: 20, from: "Customer", time: "Today 13:55", status: "received" },
      { id: "T6", amount: 10, from: "Customer", time: "Today 10:30", status: "received" },
    ],
    payouts: [],
    active: true,
  },
];

export const SEED_STATIONS: Station[] = [
  {
    id: "S001",
    name: "Engen Gqeberha North",
    dealer: "Dealers Group (Pty) Ltd",
    workers: ["W001", "W002"],
    monthlyTips: 8420,
    activeWorkers: 2,
    totalWorkers: 5,
  },
];

export const AVAILABLE_STATIONS = [
  "Engen Gqeberha North",
  "Engen Gqeberha South",
  "BP Sunridge Park",
  "Total Walmer",
] as const;

export const BANKS = [
  "Capitec",
  "FNB",
  "Standard Bank",
  "ABSA",
  "Nedbank",
  "TymeBank",
  "African Bank",
] as const;
