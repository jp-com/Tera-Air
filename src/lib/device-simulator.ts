import { supabase } from "@/lib/supabase";

export interface CommandResult {
  success: boolean;
  deviceId: string;
  command: string;
  timestamp: string;
}

export async function sendCommand(
  deviceId: string,
  command: string,
  payload: Record<string, unknown> = {}
): Promise<CommandResult> {
  const timestamp = new Date().toISOString();

  if (command === "activate") {
    console.log(
      `[DeviceSimulator] Activating device ${deviceId} at ${timestamp}`,
      payload
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`[DeviceSimulator] Device ${deviceId} acknowledged activation`);
    return { success: true, deviceId, command, timestamp };
  }

  if (command === "deactivate") {
    console.log(
      `[DeviceSimulator] Deactivating device ${deviceId} at ${timestamp}`,
      payload
    );
    return { success: true, deviceId, command, timestamp };
  }

  console.log(
    `[DeviceSimulator] Unknown command "${command}" for device ${deviceId}`
  );
  return { success: false, deviceId, command, timestamp };
}

let expiryCheckerInterval: ReturnType<typeof setInterval> | null = null;

async function checkExpiredSessions() {
  const now = new Date().toISOString();

  const { data: expired, error } = await supabase
    .from("sessions")
    .select("id, cart_id")
    .eq("status", "active")
    .lt("expires_at", now);

  if (error) {
    console.error("[DeviceSimulator] Error checking expired sessions:", error);
    return;
  }

  if (!expired || expired.length === 0) return;

  for (const session of expired) {
    console.log(
      `[DeviceSimulator] Session ${session.id} expired, completing...`
    );

    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: now })
      .eq("id", session.id);

    // Look up the cart's device_id to deactivate
    const { data: cart } = await supabase
      .from("carts")
      .select("device_id")
      .eq("id", session.cart_id)
      .single();

    if (cart?.device_id) {
      await sendCommand(cart.device_id, "deactivate", {
        reason: "session_expired",
        session_id: session.id,
      });
    }
  }

  console.log(
    `[DeviceSimulator] Completed ${expired.length} expired session(s)`
  );
}

export function startExpiryChecker() {
  if (expiryCheckerInterval) return;
  console.log("[DeviceSimulator] Starting expiry checker (every 30s)");
  expiryCheckerInterval = setInterval(checkExpiredSessions, 30_000);
}

export function stopExpiryChecker() {
  if (expiryCheckerInterval) {
    clearInterval(expiryCheckerInterval);
    expiryCheckerInterval = null;
    console.log("[DeviceSimulator] Stopped expiry checker");
  }
}
