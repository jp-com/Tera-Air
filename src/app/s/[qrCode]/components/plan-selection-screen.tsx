"use client";

import { useState } from "react";
import type { PlanOption } from "../use-session-machine";
import { StatusBar, NavBar, Btn, Lbl, IcoClock, IcoSnow } from "./ui";
import { TermsModal } from "./terms-modal";

interface Props {
  clubName: string;
  cartNumber: string;
  plans: PlanOption[];
  selectedPlan: PlanOption | null;
  currency: string;
  onSelectPlan: (plan: PlanOption) => void;
  onContinue: () => void;
  onBack: () => void;
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function PlanSelectionScreen({
  clubName,
  cartNumber,
  plans,
  selectedPlan,
  currency,
  onSelectPlan,
  onContinue,
  onBack,
}: Props) {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-cloud">
      <StatusBar />
      <NavBar onBack={onBack} />

      <div className="flex-1 px-6 overflow-y-auto pb-[120px]">
        {/* Header */}
        <div className="mb-6" style={{ animation: "fadeUp .4s ease" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-semibold text-graphite tracking-wide">
              Cart #{cartNumber} &middot; {clubName}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-carbon tracking-tight leading-tight">
            Activate cool air<br />for your cart
          </h1>
        </div>

        {/* Plans */}
        <Lbl delay={0.05}>Choose your plan</Lbl>
        <div className="flex flex-col gap-3">
          {plans.map((plan, i) => {
            const sel = selectedPlan?.plan_type === plan.plan_type;
            return (
              <button
                key={plan.plan_type}
                onClick={() => onSelectPlan(plan)}
                className="flex items-center justify-between p-5 rounded-[18px] border-none bg-white cursor-pointer text-left relative overflow-hidden transition-all"
                style={{
                  boxShadow: sel
                    ? "0 0 0 2px #A5C9DB,0 4px 20px rgba(165,201,219,.09)"
                    : "0 0 0 1px #E4E6E8,0 2px 8px rgba(0,0,0,.04)",
                  animation: `fadeUp .4s ease ${0.1 + i * 0.08}s both`,
                }}
              >
                {sel && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky rounded-r-sm" />}
                {i === 0 && (
                  <div
                    className="absolute -top-px right-4 text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-b-lg uppercase"
                    style={{ background: sel ? "#A5C9DB" : "#E4E6E8", color: sel ? "#fff" : "#425B6A" }}
                  >
                    Most popular
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: sel ? "#EAF3F8" : "#F1F2F3" }}
                  >
                    <IcoClock size={20} color={sel ? "#425B6A" : "#bbb"} />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-carbon">{formatDuration(plan.minutes)}</div>
                    <div className="text-[13px] text-gray-400 mt-0.5">{plan.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-carbon">
                    ${plan.price != null ? formatPrice(plan.price) : "Free"}
                  </span>
                  {plan.price != null && <div className="text-[10px] text-gray-300 font-medium mt-0.5">{currency}</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-7" style={{ animation: "fadeUp .4s ease .25s both" }}>
          <Lbl>How it works</Lbl>
          <div className="bg-white rounded-2xl p-4 shadow-[0_0_0_1px_#E4E6E8,0_2px_8px_rgba(0,0,0,.04)]">
            {[
              ["Scan & pay", "Cool air starts instantly after payment"],
              ["Auto shut-off", "Air turns off when your time runs out"],
              ["Extend anytime", "Add more time from your phone mid-round"],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3.5 py-2.5" style={{ borderBottom: i < 2 ? "1px solid #F8F9FA" : "none" }}>
                <div className="w-6 h-6 rounded-lg bg-sky-pale flex items-center justify-center shrink-0 mt-0.5">
                  <IcoSnow size={12} color="#A5C9DB" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-carbon">{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-7" style={{ background: "linear-gradient(transparent,#F8F9FA 25%)" }}>
        <Btn onClick={onContinue} disabled={!selectedPlan}>
          {selectedPlan
            ? `Pay $${selectedPlan.price != null ? formatPrice(selectedPlan.price) : "0.00"}`
            : "Select a plan"}
        </Btn>
        <div className="text-center mt-2.5">
          <span className="text-[11px] text-gray-300">By paying, you agree to the </span>
          <button onClick={() => setShowTerms(true)} className="text-[11px] text-graphite font-semibold border-none bg-transparent cursor-pointer underline decoration-gray-300">
            Terms of Service
          </button>
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}
