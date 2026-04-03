"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlanOption } from "../use-session-machine";
import { StatusBar, Btn, IcoCheck, IcoClock, IcoSnow, IcoMail, Breeze } from "./ui";

interface Props {
  plan: PlanOption;
  cartNumber: string;
  clubName: string;
  sessionId: string;
  expiresAt: string;
  onEnd: () => void;
  onComplete: () => void;
}

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function ActiveSessionScreen({
  plan,
  cartNumber,
  clubName,
  sessionId,
  expiresAt,
  onEnd,
  onComplete,
}: Props) {
  const totalSecs = plan.minutes * 60;

  const calcRemaining = useCallback(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  }, [expiresAt]);

  const [secs, setSecs] = useState(calcRemaining);
  const [showEnd, setShowEnd] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Countdown
  useEffect(() => {
    const iv = setInterval(() => {
      const remaining = calcRemaining();
      setSecs(remaining);
      if (remaining <= 0) {
        clearInterval(iv);
        onComplete();
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [calcRemaining, onComplete]);

  // Poll status every 30s
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/session/${sessionId}/status`, { method: "POST" });
        const data = await res.json();
        if (data.status === "completed") {
          onComplete();
        }
      } catch {
        // Silently ignore poll errors
      }
    }, 30_000);
    return () => clearInterval(iv);
  }, [sessionId, onComplete]);

  const prog = secs / totalSecs;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const endTime = new Date(Date.now() + secs * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  // Expired state
  if (secs <= 0) {
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
            <div className="text-[13px] text-gray-300 mt-1">Cart #{cartNumber}</div>
          </div>
          <div className="w-full flex-1" />
          <div className="w-full" style={{ animation: "fadeUp .5s ease .2s both" }}>
            <Btn onClick={onComplete}>Done</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-cloud">
      <StatusBar />

      <div className="flex-1 px-6 pt-2 pb-6 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-5" style={{ animation: "fadeUp .5s ease" }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              background: "linear-gradient(135deg,#2DB566,#239e54)",
              boxShadow: "0 6px 20px rgba(45,181,102,.19)",
              animation: "scaleIn .4s cubic-bezier(.16,1,.3,1)",
            }}
          >
            <IcoCheck size={26} color="#fff" anim />
          </div>
          <div className="text-2xl font-bold text-carbon tracking-tight">Your air is on</div>
          <div className="text-xs text-gray-400 mt-1">Cart #{cartNumber} &middot; {clubName}</div>
        </div>

        {/* Timer card */}
        <div
          className="bg-white rounded-[20px] px-5 pt-6 pb-5 relative overflow-hidden mb-3.5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,.04)", animation: "fadeUp .5s ease .1s both" }}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-mist">
            <div
              className="h-full rounded-r-sm transition-[width] duration-1000 ease-linear"
              style={{
                width: `${prog * 100}%`,
                background: prog > 0.15 ? "linear-gradient(90deg,#A5C9DB,#7fb3cc)" : "#E54D4D",
                animation: prog < 0.1 ? "pulseLow 1s ease infinite" : "none",
              }}
            />
          </div>

          <div className="text-center font-mono text-5xl font-medium text-carbon tracking-tight tabular-nums">
            {h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
          <div className="text-center text-[13px] text-gray-400 mt-1 flex items-center justify-center gap-1.5">
            <IcoClock size={12} color="#bbb" /> Ends at {endTime}
          </div>
          <div className="text-center text-[11px] text-gray-300 mt-2">
            Air turns off automatically when time runs out
          </div>
        </div>

        {/* Transaction details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full bg-white rounded-[14px] px-5 py-3.5 border-none cursor-pointer flex justify-between items-center mb-3.5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,.04)", animation: "fadeUp .5s ease .15s both" }}
        >
          <span className="text-sm font-medium text-carbon">Transaction details</span>
          <span className="text-lg text-gray-300 transition-transform" style={{ transform: showDetails ? "rotate(180deg)" : "rotate(0)" }}>
            &#x2304;
          </span>
        </button>

        {showDetails && (
          <div
            className="bg-white rounded-[14px] px-5 -mt-2 mb-3.5"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,.04)", animation: "fadeUp .2s ease" }}
          >
            {[
              ["Plan", plan.label],
              ["Amount", plan.price != null ? `$${formatPrice(plan.price)}` : "Free"],
            ].map(([label, value], i) => (
              <div key={i} className="flex justify-between py-3" style={{ borderBottom: i < 1 ? "1px solid #F8F9FA" : "none" }}>
                <span className="text-[13px] text-gray-400">{label}</span>
                <span className="text-[13px] font-semibold text-carbon">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Email receipt */}
        <div
          className="bg-white rounded-[14px] px-4 py-3 mb-5"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,.04)", animation: "fadeUp .5s ease .2s both" }}
        >
          {emailSent ? (
            <div className="flex items-center gap-2.5">
              <IcoCheck size={16} color="#2DB566" />
              <span className="text-[13px] text-success font-medium">Receipt sent to {email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <IcoMail size={14} color="#aaa" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email for receipt"
                className="flex-1 h-9 border-none bg-transparent text-[13px] outline-none text-carbon"
              />
              <button
                onClick={() => { if (email.includes("@")) setEmailSent(true); }}
                className="h-8 px-3.5 rounded-lg border-none text-xs font-semibold transition-all"
                style={{
                  background: email.includes("@") ? "#1A1A1A" : "#E4E6E8",
                  color: email.includes("@") ? "#fff" : "#bbb",
                  cursor: email.includes("@") ? "pointer" : "default",
                }}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* End session */}
        <div style={{ animation: "fadeUp .5s ease .25s both" }}>
          <button
            onClick={() => setShowEnd(true)}
            className="w-full h-[50px] rounded-[14px] border-none bg-white cursor-pointer flex items-center justify-center gap-2 text-[15px] font-semibold text-graphite transition-all active:scale-[.97]"
            style={{ boxShadow: "0 0 0 1.5px #A5C9DB" }}
          >
            <IcoSnow size={14} color="#A5C9DB" /> End Session
          </button>

          {showEnd && (
            <div className="mt-3.5 px-4 py-4 bg-error-soft rounded-[14px] text-center" style={{ animation: "fadeUp .2s ease" }}>
              <p className="text-[13px] text-error mb-3 leading-relaxed">
                Unused time is non-refundable. End now?
              </p>
              <div className="flex gap-2.5 justify-center">
                <button onClick={() => setShowEnd(false)} className="border-none bg-transparent text-gray-400 text-[13px] font-semibold cursor-pointer px-4 py-2">
                  Keep going
                </button>
                <button
                  onClick={onEnd}
                  className="border-none bg-error text-white text-[13px] font-semibold px-5 py-2 rounded-[10px] cursor-pointer"
                  style={{ boxShadow: "0 2px 8px rgba(229,77,77,.25)" }}
                >
                  End now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
