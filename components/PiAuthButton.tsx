"use client";

/**
 * PiAuthButton.tsx
 *
 * Handles Pi Network authentication ONLY — no payment.
 * Calls window.Pi.authenticate and surfaces the accessToken + user info
 * to the parent via onAuthSuccess.
 *
 * Separated from PiPayButton so auth state can be established once
 * (e.g. on the splash screen) before any payment is initiated.
 */

import React, { useState, useEffect } from "react";
import { PiAuthResult, PaymentInfo } from "@/types";
import { payment } from "@/services/paymentApi";

declare global {
  interface Window {
    Pi?: {
      init(opts: { version: string; sandbox?: boolean }): void;
      authenticate(
        scopes: string[],
        onIncompletePaymentFound: (p: PaymentInfo) => void
      ): Promise<PiAuthResult>;
      createPayment(data: unknown, callbacks: unknown): void;
    };
  }
}

export interface PiAuthButtonProps {
  onAuthSuccess: (accessToken: string, uid: string, username: string) => void;
  onError?: (err: Error) => void;
  showToast: (msg: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PiAuthButton({
  onAuthSuccess,
  onError,
  showToast,
  disabled = false,
  className = "",
  children,
}: PiAuthButtonProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [busy,     setBusy]     = useState(false);

  // Poll until window.Pi is injected by the SDK script
  useEffect(() => {
    let attempts = 0;
    const check = setInterval(() => {
      if (window.Pi) { setSdkReady(true); clearInterval(check); }
      if (++attempts > 50) clearInterval(check);
    }, 100);
    return () => clearInterval(check);
  }, []);

  const handleClick = async () => {
    if (!window.Pi || busy || disabled) return;
    setBusy(true);

    try {
      const auth = await window.Pi.authenticate(
        ["username", "payments", "wallet_address"],
        async (incompletePmt: PaymentInfo) => {
          // Resolve any dangling payment from a previous session
          try {
            await payment.incomplete(incompletePmt);
          } catch {
            // Non-fatal — log and continue
            console.warn("[Pi] Failed to resolve incomplete payment:", incompletePmt.identifier);
          }
        }
      );

      onAuthSuccess(auth.accessToken, auth.user.uid, auth.user.username);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Authentication failed");
      onError?.(error);
      showToast(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !sdkReady || busy}
      className={className}
      style={{ opacity: !sdkReady || busy ? 0.6 : 1 }}
    >
      {busy ? "Connecting…" : children ?? "Connect Pi Wallet"}
    </button>
  );
}
