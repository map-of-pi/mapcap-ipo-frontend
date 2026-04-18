// ── IPO / Pioneer types ───────────────────────────────────────────────────

export interface IpoStats {
  ipoStatus: "active" | "locked" | "complete";
  lpStatus:  "pending" | "active" | "terminated";
  currentDay: number;
  totalInvestors: number;
  totalPiInPool: number;
  currentSpotPrice: number;
  spotPriceHistory: { day: number; price: number; timestamp: string }[];
  ipoStartDate: string;
  ipoEndDate: string;
}

export interface PioneerStats {
  uid: string;
  username?: string;
  piBalance: number;
  capitalGainEstimate: number;
  mapcapAllocated: number;
  mapcapVested: number;
  mapcapHeld: number;
  totalDividendsReceived: number;
  totalInvested: number;
  totalWithdrawn: number;
}

export interface InvestResponse {
  piBalance: number;
  txId: string;
  spotPrice: number;
}

export interface WithdrawResponse {
  amountReturned: number;
  newPiBalance: number;
  txId: string;
  spotPrice: number;
}

// ── Pi Network payment types ──────────────────────────────────────────────

export interface PaymentInfo {
  identifier: string;
  transaction?: {
    txid: string;
    _link: string;
  };
}

export interface PiAuthResult {
  user: { uid: string; username: string };
  accessToken: string;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
}