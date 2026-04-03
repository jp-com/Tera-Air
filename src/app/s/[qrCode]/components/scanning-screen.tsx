"use client";

import { LogoMark } from "./ui";

export function ScanningScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 40%,#425B6A 0%,#1A1A1A 70%)" }}>
      {/* Glow */}
      <div className="absolute top-[35%] left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle,rgba(165,201,219,.08) 0%,transparent 70%)" }} />

      {/* Pulse rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full"
          style={{
            border: "1px solid rgba(165,201,219,.25)",
            animation: `pulse 3s ease-out ${i * 0.7}s infinite`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-[2] text-center">
        <div className="mb-5" style={{ animation: "fadeUp .5s ease" }}>
          <LogoMark color="#A5C9DB" size={48} />
        </div>
        <div
          className="text-[rgba(255,255,255,.5)] text-sm font-medium uppercase tracking-wider mb-1.5"
          style={{ animation: "fadeUp .7s ease" }}
        >
          Golf cart cooling
        </div>
        <div
          className="text-[rgba(255,255,255,.3)] text-[13px]"
          style={{ animation: "fadeUp .85s ease" }}
        >
          Connecting to your cart&hellip;
        </div>
        <div className="flex gap-2 justify-center mt-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-[5px] h-[5px] rounded-full bg-sky"
              style={{ animation: `breathe 1.4s ease ${i * 0.35}s infinite` }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-11 text-[rgba(255,255,255,.12)] text-[10px] font-medium tracking-[2.5px] uppercase">
        Powered by Tera Air
      </div>
    </div>
  );
}
