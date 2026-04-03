"use client";

import type { PlanOption } from "../use-session-machine";
import { StatusBar, Btn } from "./ui";

interface Props {
  plan: PlanOption;
  cartNumber: string;
  onRestart: () => void;
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function SessionEndedScreen({ plan, cartNumber, onRestart }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-cloud">
      <StatusBar />
      <div className="flex-1 px-6 pt-5 pb-6 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 mt-3" style={{ animation: "fadeUp .5s ease" }}>
          <div
            className="w-[52px] h-[52px] rounded-full bg-mist flex items-center justify-center mx-auto mb-4"
            style={{ animation: "scaleIn .4s cubic-bezier(.16,1,.3,1)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#425B6A" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="8" x2="16" y2="16" />
            </svg>
          </div>
          <div className="text-[22px] font-bold text-carbon">Session ended</div>
          <div className="text-[13px] text-gray-400 mt-1.5">Cart #{cartNumber} &middot; Air is off</div>
        </div>

        {/* Summary card */}
        <div
          className="bg-white rounded-2xl px-5 mb-6"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,.04)", animation: "fadeUp .5s ease .1s both" }}
        >
          {[
            ["Plan", plan.label],
            ["Amount", plan.price != null ? `$${formatPrice(plan.price)}` : "Free"],
            ["Status", "Ended early"],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="flex justify-between py-3.5"
              style={{ borderBottom: i < 2 ? "1px solid #F8F9FA" : "none" }}
            >
              <span className="text-sm text-gray-400">{label}</span>
              <span
                className="text-sm font-medium"
                style={{
                  color: value === "Ended early" ? "#E54D4D" : "#1A1A1A",
                  fontWeight: value === "Ended early" ? 600 : 500,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div style={{ animation: "fadeUp .5s ease .2s both" }}>
          <Btn onClick={onRestart}>Scan another cart</Btn>
          <p className="text-center mt-3.5 text-xs text-gray-300">You&apos;re all set</p>
        </div>
      </div>
    </div>
  );
}
