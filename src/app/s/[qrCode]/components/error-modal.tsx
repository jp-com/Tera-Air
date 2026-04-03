"use client";

import type { ErrorType } from "../use-session-machine";
import { Btn } from "./ui";

interface Props {
  type: ErrorType;
  message: string;
  onRetry: () => void;
  onDismiss: () => void;
}

const ERROR_CONFIG: Record<string, { title: string; defaultMessage: string; cta: string }> = {
  connection: {
    title: "Connection failed",
    defaultMessage: "Couldn't connect to this cart. Make sure Bluetooth is on and you're nearby.",
    cta: "Try Again",
  },
  payment: {
    title: "Payment declined",
    defaultMessage: "Your payment couldn't be processed. Try a different method.",
    cta: "Try Again",
  },
  unavailable: {
    title: "Unit unavailable",
    defaultMessage: "This cart's cooling is temporarily offline. Try another cart.",
    cta: "Scan Another Cart",
  },
};

export function ErrorModal({ type, message, onRetry, onDismiss }: Props) {
  const config = ERROR_CONFIG[type || "connection"] || ERROR_CONFIG.connection;

  return (
    <div
      className="absolute inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,.4)", animation: "fadeIn .2s ease" }}
    >
      <div
        className="w-[84%] bg-white rounded-3xl px-6 pt-8 pb-6 text-center"
        style={{ animation: "fadeUp .3s cubic-bezier(.16,1,.3,1)", boxShadow: "0 20px 60px rgba(0,0,0,.15)" }}
      >
        <div className="w-12 h-12 rounded-full bg-error-soft flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E54D4D" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r=".5" fill="#E54D4D" />
          </svg>
        </div>
        <div className="text-lg font-bold text-carbon mb-2">{config.title}</div>
        <div className="text-sm text-gray-400 leading-relaxed mb-5">{message || config.defaultMessage}</div>
        <Btn onClick={onRetry}>{config.cta}</Btn>
        <button onClick={onDismiss} className="block w-full border-none bg-transparent text-gray-300 text-[13px] mt-3 cursor-pointer">
          Get help
        </button>
      </div>
    </div>
  );
}
