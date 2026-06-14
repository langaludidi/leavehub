export interface Tip {
  id: string;
  amount: number;
  from: string;
  time: string;
  status: "received";
}

export interface Payout {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

export interface Worker {
  id: string;
  name: string;
  station: string;
  phone: string;
  bank: string;
  balance: number;
  tips: Tip[];
  payouts: Payout[];
  active: boolean;
}

export interface Station {
  id: string;
  name: string;
  dealer: string;
  workers: string[];
  monthlyTips: number;
  activeWorkers: number;
  totalWorkers: number;
}

export type Role = "worker" | "customer" | "employer";
export type PayMethod = "card" | "snapscan" | "ozow";
