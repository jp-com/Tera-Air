"use client";

import type { PlanOption } from "../use-session-machine";
import { StatusBar, Btn, Breeze } from "./ui";

interface Props {
  plan: PlanOption;
  cartNumber: string;
  onRestart: () => void;
}

export function SessionCompleteScreen({ plan, cartNumber, onRestart }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-cloud">
      <StatusBar />
      <div className="flex-1 px-6 pt-5 pb-6 flex flex-col items-center">
        <div className="text-center mt-10 mb-8" style={{ animation: "fadeUp .5s ease" }}>
          <div className="mb-4" style={{ animation: "scaleIn .4s cubic-bezier(.16,1,.3,1)" }}>
            <Breeze color="#A5C9DB" size={56} />
          </div>
          <div className="text-2xl font-bold text-carbon">Session complete</div>
          <div className="text-sm text-gray-400 mt-1.5 leading-relaxed">Hope you enjoyed a cooler round</div>
          <div className="text-[13px] text-gray-300 mt-1">Cart #{cartNumber} &middot; {plan.label}</div>
        </div>

        <div className="w-full flex-1" />

        <div className="w-full" style={{ animation: "fadeUp .5s ease .2s both" }}>
          <Btn onClick={onRestart}>Start a new session</Btn>
          <p className="text-center mt-3.5 text-xs text-gray-300">You&apos;re all set</p>
        </div>
      </div>
    </div>
  );
}
