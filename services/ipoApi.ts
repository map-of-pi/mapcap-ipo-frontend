import { apiFetch, authHeaders } from "@/config/apiFetchClient";
import { InvestResponse, IpoStats, PioneerStats, WithdrawResponse } from "@/types";

export const api = {
  getStats(): Promise<IpoStats> {
    return apiFetch<IpoStats>("/api/ipo/stats");
  },

  getMe(token: string): Promise<PioneerStats> {
    return apiFetch<PioneerStats>("/api/ipo/me", {
      headers: authHeaders(token),
    });
  },

  invest(token: string, amount: number): Promise<InvestResponse> {
    return apiFetch<InvestResponse>("/api/ipo/invest", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ amount }),
    });
  },

  withdraw(token: string, percentage: number): Promise<WithdrawResponse> {
    return apiFetch<WithdrawResponse>("/api/ipo/withdraw", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ percentage }),
    });
  },
};