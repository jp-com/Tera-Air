"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { PlanOption } from "../use-session-machine";
import { LogoFull, Btn, Lbl } from "./ui";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  plan: PlanOption;
  cartNumber: string;
  clientSecret: string;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
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

function PaymentForm({ plan, cartNumber, clientSecret, currency, onConfirm, onCancel, onError }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });
      if (error) {
        onError(error.message || "Payment failed");
        setProcessing(false);
      } else if (paymentIntent?.status === "succeeded") {
        onConfirm();
      }
    } catch {
      onError("Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  // Attempt to use Payment Request (Apple Pay / Google Pay)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canPayWallet, setCanPayWallet] = useState(false);
  const [payMethod, setPayMethod] = useState<"card" | "wallet">("card");

  useEffect(() => {
    if (!stripe || !plan.price) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: currency.toLowerCase(),
      total: { label: `Tera Air - ${plan.label}`, amount: plan.price },
      requestPayerName: true,
    });
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanPayWallet(true);
        setPayMethod("wallet");
      }
    });
    pr.on("paymentmethod", async (ev) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      );
      if (error) {
        ev.complete("fail");
        onError(error.message || "Payment failed");
      } else if (paymentIntent?.status === "requires_action") {
        ev.complete("success");
        const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) {
          onError(actionError.message || "Payment failed");
        } else {
          onConfirm();
        }
      } else {
        ev.complete("success");
        onConfirm();
      }
    });
    // We intentionally only set this up once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe]);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col justify-end">
      <div onClick={onCancel} className="absolute inset-0" style={{ background: "rgba(0,0,0,.4)", animation: "fadeIn .2s ease" }} />
      <div
        className="relative z-[2] bg-white rounded-t-3xl px-6 pt-3.5 pb-9 max-h-[90%] overflow-y-auto"
        style={{ animation: "slideUp .4s cubic-bezier(.16,1,.3,1)", boxShadow: "0 -8px 40px rgba(0,0,0,.12)" }}
      >
        <div className="w-10 h-1 bg-mist rounded-full mx-auto mb-5" />
        <div className="text-center mb-4"><LogoFull w={90} /></div>

        {/* Summary */}
        <div className="bg-cloud rounded-[14px] px-4 py-3.5 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-carbon">Cart #{cartNumber} &middot; {formatDuration(plan.minutes)}</div>
              <div className="text-xs text-gray-400 mt-0.5">{plan.label}</div>
            </div>
            <span className="text-xl font-bold text-carbon">${plan.price != null ? formatPrice(plan.price) : "0.00"}</span>
          </div>
        </div>

        {/* Payment method tabs */}
        {canPayWallet && (
          <>
            <Lbl>Pay with</Lbl>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPayMethod("wallet")}
                className="flex-1 h-[52px] rounded-xl border-none flex items-center justify-center gap-1.5 cursor-pointer text-[11px] font-semibold transition-all"
                style={{
                  background: payMethod === "wallet" ? "#1A1A1A" : "#F8F9FA",
                  color: payMethod === "wallet" ? "#fff" : "#1A1A1A",
                  boxShadow: payMethod === "wallet" ? "0 2px 12px rgba(26,26,26,.2)" : "0 0 0 1px #E4E6E8",
                }}
              >
                Wallet
              </button>
              <button
                onClick={() => setPayMethod("card")}
                className="flex-1 h-[52px] rounded-xl border-none flex items-center justify-center gap-1.5 cursor-pointer text-[11px] font-semibold transition-all"
                style={{
                  background: payMethod === "card" ? "#1A1A1A" : "#F8F9FA",
                  color: payMethod === "card" ? "#fff" : "#1A1A1A",
                  boxShadow: payMethod === "card" ? "0 2px 12px rgba(26,26,26,.2)" : "0 0 0 1px #E4E6E8",
                }}
              >
                Card
              </button>
            </div>
          </>
        )}

        {/* Wallet pay (hidden button — PaymentRequestButton triggers native UI) */}
        {payMethod === "wallet" && paymentRequest && (
          <div className="mb-4">
            <p className="text-center text-[13px] text-gray-400 mb-4">Tap the button below to pay with your digital wallet</p>
            <Btn onClick={() => paymentRequest.show()}>Pay with Wallet</Btn>
          </div>
        )}

        {/* Card form */}
        {payMethod === "card" && (
          <div className="bg-cloud rounded-2xl p-4 mb-5" style={{ animation: "fadeUp .25s ease" }}>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">Card details</label>
            <div className="bg-white rounded-xl border border-mist p-3.5">
              <CardElement
                onChange={(e) => setCardComplete(e.complete)}
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      fontFamily: "'DM Sans', sans-serif",
                      color: "#1A1A1A",
                      "::placeholder": { color: "#bbb" },
                    },
                    invalid: { color: "#E54D4D" },
                  },
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="6" width="10" height="7" rx="1.5" /><path d="M3 6V4a3 3 0 016 0v2" />
              </svg>
              <span className="text-[11px] text-gray-300">Secured with 256-bit encryption</span>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center mb-4 px-0.5">
          <span className="text-[15px] font-medium text-gray-400">Total</span>
          <span className="text-[26px] font-bold text-carbon">${plan.price != null ? formatPrice(plan.price) : "0.00"}</span>
        </div>

        {payMethod === "card" && (
          <Btn onClick={handleSubmit} disabled={!cardComplete || processing}>
            {processing ? "Processing..." : "Confirm Payment"}
          </Btn>
        )}

        <button onClick={onCancel} className="block w-full border-none bg-transparent text-gray-300 text-[13px] mt-3.5 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PaymentSheet(props: Props) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1A1A1A",
            fontFamily: "'DM Sans', sans-serif",
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
