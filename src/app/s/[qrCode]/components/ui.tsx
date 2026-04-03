"use client";

import { useEffect, useState } from "react";

// ─── Logo ───
export function LogoMark({ color = "#fff", size = 48 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 60 80" width={size} height={(size * 80) / 60} fill={color}>
      <text x="2" y="68" fontFamily="'DM Sans',sans-serif" fontSize="78" fontWeight="700">T</text>
      <circle cx="48" cy="14" r="6" />
      <path d="M16 18Q32 4 48 8" strokeWidth="4" stroke={color} fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function LogoFull({ color = "#1A1A1A", w = 100 }: { color?: string; w?: number }) {
  return (
    <svg viewBox="0 0 520 90" width={w} fill={color}>
      <text x="0" y="72" fontFamily="'DM Sans',sans-serif" fontSize="82" fontWeight="700" letterSpacing="-2">
        <tspan>T</tspan><tspan dx="-2">era Air</tspan>
      </text>
      <circle cx="50" cy="18" r="7" />
      <path d="M18 22Q34 8 50 12" strokeWidth="4" stroke={color} fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Breeze animation icon ───
export function Breeze({ color = "#fff", size = 64 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 70" width={size} height={size * 0.7} stroke={color} fill="none" strokeWidth="2.5" strokeLinecap="round">
      <path d="M30 60Q50 45 70 60" />
      {[...Array(7)].map((_, i) => {
        const a = ((-90 + i * 30) * Math.PI) / 180;
        return (
          <line key={i} x1={50 + Math.cos(a) * 18} y1={52 + Math.sin(a) * 18} x2={50 + Math.cos(a) * 38} y2={52 + Math.sin(a) * 38} />
        );
      })}
    </svg>
  );
}

// ��── Icons ───
export function IcoBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L6 9L12 15" />
    </svg>
  );
}

export function IcoCheck({ size = 24, color = "#fff", anim = false }: { size?: number; color?: string; anim?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12L10 17L19 7" style={anim ? { strokeDasharray: 30, animation: "checkDraw .5s ease .2s both" } : {}} />
    </svg>
  );
}

export function IcoClock({ size = 18, color = "#425B6A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6V12L15 14.5" />
    </svg>
  );
}

export function IcoSnow({ size = 15, color = "#A5C9DB" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
    </svg>
  );
}

export function IcoMail({ size = 16, color = "#425B6A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );
}

// ─── Status Bar (mock iOS) ───
export function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? "#fff" : "#1A1A1A";
  return (
    <div className="flex justify-between items-center px-7 pt-3.5 pb-1 shrink-0 z-50" style={{ color: c }}>
      <span className="text-[15px] font-semibold tracking-wide">9:41</span>
      <div className="flex gap-1.5 items-center">
        <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
          <rect x="0" y="8" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="7" rx="1" /><rect x="9" y="2" width="3" height="10" rx="1" /><rect x="13" y="0" width="3" height="12" rx="1" opacity=".3" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={c} strokeWidth="1.5">
          <path d="M1 8.5C4 4 12 4 15 8.5" strokeLinecap="round" /><path d="M4 10.5C5.5 8 10.5 8 12 10.5" strokeLinecap="round" /><circle cx="8" cy="12" r="1" fill={c} stroke="none" />
        </svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill={c}>
          <rect x=".5" y=".5" width="22" height="12" rx="3.5" stroke={light ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.25)"} fill="none" /><rect x="2" y="2" width="18" height="9" rx="2" /><path d="M24 4.5V8.5" stroke={light ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.15)"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}

// ─── Nav bar with back button ───
export function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center px-5 pt-1 pb-2 shrink-0 z-50">
      <button
        onClick={onBack}
        className="w-[38px] h-[38px] rounded-full border-none bg-mist flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
      >
        <IcoBack />
      </button>
    </div>
  );
}

// ─── Primary Button ───
export function Btn({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 rounded-2xl border-none text-base font-semibold tracking-wide transition-transform active:scale-[.97] ${
        disabled
          ? "bg-mist text-gray-400 cursor-default"
          : "bg-carbon text-white cursor-pointer shadow-[0_4px_20px_rgba(26,26,26,.2)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Section Label ───
export function Lbl({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-400 mb-3"
      style={{ animation: `fadeUp .4s ease ${delay}s both` }}
    >
      {children}
    </div>
  );
}

// ─── Phone Frame (desktop only) ───
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) {
    return <div className="w-screen h-screen fixed inset-0">{children}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5" style={{ background: "radial-gradient(ellipse at 50% 30%,#1a1f22 0%,#0e1011 100%)" }}>
      <div
        className="w-[390px] h-[844px] rounded-[48px] overflow-hidden relative"
        style={{ boxShadow: "0 0 0 11px #1a1a1a,0 0 0 13px #2a2a2a,inset 0 0 2px rgba(255,255,255,.05),0 50px 100px rgba(0,0,0,.6)" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[34px] bg-[#1a1a1a] rounded-b-[20px] z-[500]">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[60px] h-1.5 rounded-full bg-[#333]" />
        </div>
        {children}
      </div>
      <div className="mt-5 text-[rgba(255,255,255,.18)] text-[11px] font-medium tracking-[2.5px] uppercase">
        Tera Air · v3
      </div>
    </div>
  );
}
