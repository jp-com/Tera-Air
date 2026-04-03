"use client";

import { Btn } from "./ui";

export function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-[200] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,.4)", animation: "fadeIn .2s ease" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white rounded-t-[22px] px-6 pt-3.5 pb-9 max-h-[70%] overflow-y-auto"
        style={{ animation: "slideUp .35s cubic-bezier(.16,1,.3,1)", boxShadow: "0 -8px 40px rgba(0,0,0,.1)" }}
      >
        <div className="w-10 h-1 bg-mist rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold text-carbon mb-3">Terms of Service</h3>
        <div className="text-[13px] text-gray-400 leading-7">
          <p className="mb-2.5">By using Tera Air, you agree to the following terms:</p>
          <p className="mb-2.5">
            Rental sessions are non-refundable once activated. The cooling system will automatically shut off
            at the end of your selected rental period. Tera Air is not responsible for any damage to personal belongings.
          </p>
          <p className="mb-2.5">
            Sessions can be ended early via the session management screen, however no partial refunds
            will be issued for unused time.
          </p>
          <p>For support, contact help@teraair.com</p>
        </div>
        <div className="mt-5">
          <Btn onClick={onClose}>Got it</Btn>
        </div>
      </div>
    </div>
  );
}
