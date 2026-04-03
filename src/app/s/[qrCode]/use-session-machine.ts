"use client";

import { useReducer, useEffect, useCallback } from "react";

export type Screen =
  | "scanning"
  | "plan_selection"
  | "payment"
  | "activating"
  | "active"
  | "ended"
  | "complete";

export type ErrorType = "connection" | "payment" | "unavailable" | null;

interface CartData {
  id: string;
  cart_number: string;
  qr_code: string;
  device_status: string;
}

interface ClubData {
  name: string;
  pricing_model: "per_session" | "free";
  session_durations: { label: string; minutes: number }[];
  session_prices?: Record<string, number>;
  currency: string;
}

export interface PlanOption {
  label: string;
  minutes: number;
  plan_type: string;
  price: number | null;
}

interface State {
  screen: Screen;
  cart: CartData | null;
  club: ClubData | null;
  plans: PlanOption[];
  selectedPlan: PlanOption | null;
  sessionId: string | null;
  clientSecret: string | null;
  error: ErrorType;
  errorMessage: string;
  startedAt: string | null;
  expiresAt: string | null;
}

type Action =
  | { type: "LOADED"; cart: CartData; club: ClubData; plans: PlanOption[] }
  | { type: "ERROR"; error: ErrorType; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SELECT_PLAN"; plan: PlanOption }
  | { type: "SESSION_CREATED"; sessionId: string; clientSecret: string | null }
  | { type: "GO_PAYMENT" }
  | { type: "GO_ACTIVATING"; startedAt: string; expiresAt: string }
  | { type: "GO_ACTIVE" }
  | { type: "GO_ENDED" }
  | { type: "GO_COMPLETE" }
  | { type: "RESET" };

const initialState: State = {
  screen: "scanning",
  cart: null,
  club: null,
  plans: [],
  selectedPlan: null,
  sessionId: null,
  clientSecret: null,
  error: null,
  errorMessage: "",
  startedAt: null,
  expiresAt: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOADED": {
      const screen =
        action.club.pricing_model === "free" ? "scanning" : "plan_selection";
      return {
        ...state,
        cart: action.cart,
        club: action.club,
        plans: action.plans,
        screen,
      };
    }
    case "ERROR":
      return { ...state, error: action.error, errorMessage: action.message };
    case "CLEAR_ERROR":
      return { ...state, error: null, errorMessage: "" };
    case "SELECT_PLAN":
      return { ...state, selectedPlan: action.plan };
    case "SESSION_CREATED":
      return {
        ...state,
        sessionId: action.sessionId,
        clientSecret: action.clientSecret,
      };
    case "GO_PAYMENT":
      return { ...state, screen: "payment" };
    case "GO_ACTIVATING":
      return {
        ...state,
        screen: "activating",
        startedAt: action.startedAt,
        expiresAt: action.expiresAt,
      };
    case "GO_ACTIVE":
      return { ...state, screen: "active" };
    case "GO_ENDED":
      return { ...state, screen: "ended" };
    case "GO_COMPLETE":
      return { ...state, screen: "complete" };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

function derivePlanType(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "_");
}

export function useSessionMachine(qrCode: string) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch cart data on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchCart() {
      try {
        const res = await fetch(`/api/cart/${encodeURIComponent(qrCode)}`);
        if (!res.ok) {
          dispatch({
            type: "ERROR",
            error: "connection",
            message: "Cart not found or unavailable",
          });
          return;
        }
        const data = await res.json();
        const cart: CartData = data.cart;
        const club: ClubData = data.club;
        const plans: PlanOption[] = club.session_durations.map((d) => {
          const planType = derivePlanType(d.label);
          return {
            label: d.label,
            minutes: d.minutes,
            plan_type: planType,
            price: club.session_prices?.[planType] ?? null,
          };
        });
        if (!cancelled) {
          dispatch({ type: "LOADED", cart, club, plans });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: "ERROR",
            error: "connection",
            message: "Failed to connect",
          });
        }
      }
    }
    fetchCart();
    return () => {
      cancelled = true;
    };
  }, [qrCode]);

  // Auto-start free sessions after data loads
  useEffect(() => {
    if (
      state.club?.pricing_model === "free" &&
      state.cart &&
      state.screen === "scanning" &&
      !state.sessionId
    ) {
      const timer = setTimeout(() => startFreeSession(), 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.club, state.cart, state.screen, state.sessionId]);

  const startFreeSession = useCallback(async () => {
    if (!state.cart || !state.plans[0]) return;
    try {
      const createRes = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: state.cart.id,
          plan_type: state.plans[0].plan_type,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error);

      dispatch({
        type: "SESSION_CREATED",
        sessionId: createData.session_id,
        clientSecret: null,
      });

      // For free sessions, the API already sets started_at and expires_at
      // but we still call confirm to trigger device activation
      const confirmRes = await fetch("/api/session/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: createData.session_id }),
      });
      const confirmData = await confirmRes.json();

      if (confirmRes.ok) {
        dispatch({
          type: "GO_ACTIVATING",
          startedAt: confirmData.started_at,
          expiresAt: confirmData.expires_at,
        });
      } else {
        // Free sessions are already active from create, use that data
        dispatch({
          type: "GO_ACTIVATING",
          startedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + state.plans[0].minutes * 60 * 1000
          ).toISOString(),
        });
      }
    } catch {
      dispatch({
        type: "ERROR",
        error: "connection",
        message: "Failed to start session",
      });
    }
  }, [state.cart, state.plans]);

  const selectPlan = useCallback((plan: PlanOption) => {
    dispatch({ type: "SELECT_PLAN", plan });
  }, []);

  const createPaidSession = useCallback(async () => {
    if (!state.cart || !state.selectedPlan) return;
    try {
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: state.cart.id,
          plan_type: state.selectedPlan.plan_type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      dispatch({
        type: "SESSION_CREATED",
        sessionId: data.session_id,
        clientSecret: data.client_secret,
      });
      dispatch({ type: "GO_PAYMENT" });
    } catch {
      dispatch({
        type: "ERROR",
        error: "payment",
        message: "Failed to create payment session",
      });
    }
  }, [state.cart, state.selectedPlan]);

  const confirmSession = useCallback(async () => {
    if (!state.sessionId) return;
    try {
      const res = await fetch("/api/session/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: state.sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      dispatch({
        type: "GO_ACTIVATING",
        startedAt: data.started_at,
        expiresAt: data.expires_at,
      });
    } catch {
      dispatch({
        type: "ERROR",
        error: "connection",
        message: "Failed to confirm session",
      });
    }
  }, [state.sessionId]);

  const completeActivation = useCallback(() => {
    dispatch({ type: "GO_ACTIVE" });
  }, []);

  const endSession = useCallback(async () => {
    if (!state.sessionId) return;
    try {
      const res = await fetch(`/api/session/${state.sessionId}/end`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      dispatch({ type: "GO_ENDED" });
    } catch {
      dispatch({
        type: "ERROR",
        error: "connection",
        message: "Failed to end session",
      });
    }
  }, [state.sessionId]);

  const markComplete = useCallback(() => {
    dispatch({ type: "GO_COMPLETE" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    ...state,
    selectPlan,
    createPaidSession,
    confirmSession,
    completeActivation,
    endSession,
    markComplete,
    clearError,
    reset,
  };
}
