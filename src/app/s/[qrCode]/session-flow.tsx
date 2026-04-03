"use client";

import { useSessionMachine } from "./use-session-machine";
import { PhoneFrame } from "./components/ui";
import { ScanningScreen } from "./components/scanning-screen";
import { PlanSelectionScreen } from "./components/plan-selection-screen";
import { PaymentSheet } from "./components/payment-sheet";
import { ActivatingScreen } from "./components/activating-screen";
import { ActiveSessionScreen } from "./components/active-session-screen";
import { SessionEndedScreen } from "./components/session-ended-screen";
import { SessionCompleteScreen } from "./components/session-complete-screen";
import { ErrorModal } from "./components/error-modal";

export function SessionFlow({ qrCode }: { qrCode: string }) {
  const machine = useSessionMachine(qrCode);

  const currentPlan = machine.selectedPlan || machine.plans[0];

  return (
    <PhoneFrame>
      <div className="w-full h-full relative overflow-hidden bg-cloud font-sans">
        {/* Scanning */}
        {machine.screen === "scanning" && (
          <div className="absolute inset-0 flex flex-col">
            <ScanningScreen />
          </div>
        )}

        {/* Plan Selection (paid flow) */}
        {machine.screen === "plan_selection" && (
          <div className="absolute inset-0 flex flex-col" style={{ animation: "fadeUp .4s ease" }}>
            <PlanSelectionScreen
              clubName={machine.club?.name || ""}
              cartNumber={machine.cart?.cart_number || ""}
              plans={machine.plans}
              selectedPlan={machine.selectedPlan}
              currency={machine.club?.currency || "USD"}
              onSelectPlan={machine.selectPlan}
              onContinue={machine.createPaidSession}
              onBack={() => window.history.back()}
            />
          </div>
        )}

        {/* Payment (paid flow) */}
        {machine.screen === "payment" && machine.clientSecret && currentPlan && (
          <div className="absolute inset-0 flex flex-col">
            <PlanSelectionScreen
              clubName={machine.club?.name || ""}
              cartNumber={machine.cart?.cart_number || ""}
              plans={machine.plans}
              selectedPlan={machine.selectedPlan}
              currency={machine.club?.currency || "USD"}
              onSelectPlan={machine.selectPlan}
              onContinue={machine.createPaidSession}
              onBack={() => window.history.back()}
            />
            <PaymentSheet
              plan={currentPlan}
              cartNumber={machine.cart?.cart_number || ""}
              clientSecret={machine.clientSecret}
              currency={machine.club?.currency || "USD"}
              onConfirm={machine.confirmSession}
              onCancel={() => window.history.back()}
              onError={() => {
                /* payment errors show in the sheet itself */
              }}
            />
          </div>
        )}

        {/* Activating */}
        {machine.screen === "activating" && (
          <div className="absolute inset-0 flex flex-col">
            <ActivatingScreen
              cartNumber={machine.cart?.cart_number || ""}
              onComplete={machine.completeActivation}
            />
          </div>
        )}

        {/* Active Session */}
        {machine.screen === "active" && currentPlan && machine.expiresAt && (
          <div className="absolute inset-0 flex flex-col" style={{ animation: "fadeUp .4s ease" }}>
            <ActiveSessionScreen
              plan={currentPlan}
              cartNumber={machine.cart?.cart_number || ""}
              clubName={machine.club?.name || ""}
              sessionId={machine.sessionId || ""}
              expiresAt={machine.expiresAt}
              onEnd={machine.endSession}
              onComplete={machine.markComplete}
            />
          </div>
        )}

        {/* Session Ended (manual) */}
        {machine.screen === "ended" && currentPlan && (
          <div className="absolute inset-0 flex flex-col" style={{ animation: "fadeUp .4s ease" }}>
            <SessionEndedScreen
              plan={currentPlan}
              cartNumber={machine.cart?.cart_number || ""}
              onRestart={() => window.location.reload()}
            />
          </div>
        )}

        {/* Session Complete (timer expired) */}
        {machine.screen === "complete" && currentPlan && (
          <div className="absolute inset-0 flex flex-col" style={{ animation: "fadeUp .4s ease" }}>
            <SessionCompleteScreen
              plan={currentPlan}
              cartNumber={machine.cart?.cart_number || ""}
              onRestart={() => window.location.reload()}
            />
          </div>
        )}

        {/* Error overlay */}
        {machine.error && (
          <ErrorModal
            type={machine.error}
            message={machine.errorMessage}
            onRetry={machine.clearError}
            onDismiss={machine.clearError}
          />
        )}
      </div>
    </PhoneFrame>
  );
}
