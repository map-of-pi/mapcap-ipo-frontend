import { apiFetch } from "@/config/apiFetchClient";
import { PaymentInfo } from "@/types";

export const payment = {
  approve(paymentId: string) {
    return apiFetch("/api/payment/approve", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  },

  complete(paymentId: string, txid: string) {
    return apiFetch("/api/payment/complete", {
      method: "POST",
      body: JSON.stringify({ paymentId, txid }),
    });
  },

  incomplete(paymentInfo: PaymentInfo) {
    return apiFetch("/api/payment/incomplete", {
      method: "POST",
      body: JSON.stringify({ paymentInfo }),
    });
  },

  cancel(paymentId: string) {
    return apiFetch("/api/payment/cancelled-payment", {
      method: "POST",
      body: JSON.stringify({ paymentId }),
    });
  },

  error(paymentInfo: PaymentInfo) {
    return apiFetch("/api/payment/error", {
      method: "POST",
      body: JSON.stringify(paymentInfo),
    });
  },
};