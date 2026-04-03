"use client";

import { useEffect } from "react";
import { Breeze } from "./ui";

interface Props {
  cartNumber: string;
  onComplete: () => void;
}

export function ActivatingScreen({ cartNumber, onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2400);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(155deg,#A5C9DB 0%,#7fb3cc 50%,#425B6A 100%)" }}
    >
      {/* Glow */}
      <div
        className="absolute top-[20%] left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(255,255,255,.1) 0%,transparent 60%)" }}
      />

      {/* Animated breeze icon */}
      <div style={{ animation: "float 2s ease infinite", marginBottom: 32 }}>
        <div style={{ animation: "spin 6s linear infinite" }}>
          <Breeze color="#fff" size={80} />
        </div>
      </div>

      <div
        className="text-white text-xl font-semibold tracking-wide"
        style={{ animation: "fadeUp .6s ease .2s both" }}
      >
        Activating your air&hellip;
      </div>
      <div
        className="text-[rgba(255,255,255,.5)] text-[13px] mt-1.5"
        style={{ animation: "fadeUp .6s ease .4s both" }}
      >
        Cart #{cartNumber}
      </div>

      {/* Shimmer bar */}
      <div
        className="mt-6 w-[100px] h-[3px] rounded-sm overflow-hidden"
        style={{ background: "rgba(255,255,255,.2)", animation: "fadeUp .6s ease .5s both" }}
      >
        <div
          className="w-full h-full"
          style={{
            background: "#fff",
            backgroundImage: "linear-gradient(90deg,transparent,#fff,transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
