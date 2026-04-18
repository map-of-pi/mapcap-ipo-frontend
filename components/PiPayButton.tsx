"use client";

/**
 * PiPayButton.tsx
 *
 * Handles Pi Network payment ONLY.
 * Requires the pioneer to already be authenticated (accessToken must be set).
 * Auth is done separately via PiAuthButton on the splash screen.
 *
 * Flow:
 *  1. window.Pi.createPayment is called with the provided paymentData.
 *  2. onReadyForServerApproval  → parent calls backend /api/payment/approve
 *  3. onReadyForServerCompletion → parent calls backend /api/payment/complete
 */

import React, { useState, useEffect, useCallback } from "react";
import { PaymentInfo, PiPaymentData } from "@/types";
import { payment } from "@/services/paymentApi";

export interface PiPayButtonProps {
  paymentData: PiPaymentData;
  /** Must be set — payment is only allowed after auth */
  accessToken: string | null;
  /** Called after the full payment cycle completes (server completion confirmed) */
  onPaymentComplete?: () => void;
  onError?: (err: Error) => void;
  showToast: (msg: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PiPayButton({
  paymentData,
  accessToken,
  onPaymentComplete,
  onError,
  showToast,
  disabled = false,
  className = "",
  children,
}: PiPayButtonProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [busy,     setBusy]     = useState(false);

  useEffect(() => {
    let attempts = 0;
    const check = setInterval(() => {
      if (window.Pi) { setSdkReady(true); clearInterval(check); }
      if (++attempts > 50) clearInterval(check);
    }, 100);
    return () => clearInterval(check);
  }, []);

  const handleApproval = useCallback(async (paymentId: string) => {
    try {
      await payment.approve(paymentId);
    } catch (err) {
      showToast("Payment approval failed");
      console.error("[PiPay] approve error:", err);
    }
  }, [showToast]);

  const handleCompletion = useCallback(async (paymentId: string, txid: string) => {
    try {
      await payment.complete(paymentId, txid);
      onPaymentComplete?.();
    } catch (err) {
      showToast("Payment completion failed");
      console.error("[PiPay] complete error:", err);
    } finally {
      setBusy(false);
    }
  }, [showToast, onPaymentComplete]);

  const handleError = useCallback(async (err: Error, paymentInfo?: PaymentInfo) => {
    try {
      if (paymentInfo) await payment.error(paymentInfo);
    } catch {
      // swallow secondary error
    }
    onError?.(err);
    showToast(err.message || "Payment error");
    setBusy(false);
  }, [showToast, onError]);

  const handleClick = async () => {
    if (!window.Pi || busy || disabled || !accessToken) return;
    setBusy(true);

    try {
      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: (paymentId: string) => {
          handleApproval(paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          handleCompletion(paymentId, txid);
        },
        onCancel: async (paymentId: string) => {
          try { await payment.cancel(paymentId); } catch { /* ignore */ }
          setBusy(false);
        },
        onError: (err: Error, info?: PaymentInfo) => {
          handleError(err, info);
        },
      });
    } catch (err) {
      handleError(err instanceof Error ? err : new Error("Payment initiation failed"));
    }
  };

  const isDisabled = disabled || !sdkReady || busy || !accessToken;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      style={{ opacity: isDisabled ? 0.55 : 1 }}
      title={!accessToken ? "Connect your Pi wallet first" : undefined}
    >
      {busy ? "Processing…" : children ?? "Pay with π"}
    </button>
  );
}
