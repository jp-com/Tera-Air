import { supabase } from "@/lib/supabase";
import { sendCommand } from "@/lib/device-simulator";

export async function POST(request: Request) {
  const body = await request.json();
  const { session_id } = body;

  if (!session_id) {
    return Response.json(
      { error: "session_id is required" },
      { status: 400 }
    );
  }

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, status, duration_minutes, cart_id")
    .eq("id", session_id)
    .single();

  if (fetchError || !session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "pending") {
    return Response.json(
      { error: `Session cannot be confirmed (status: ${session.status})` },
      { status: 400 }
    );
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + session.duration_minutes * 60 * 1000
  );

  const { data: updated, error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", session_id)
    .select()
    .single();

  if (updateError || !updated) {
    return Response.json(
      { error: "Failed to confirm session" },
      { status: 500 }
    );
  }

  // Send activate command to the device
  const { data: cart } = await supabase
    .from("carts")
    .select("device_id")
    .eq("id", session.cart_id)
    .single();

  if (cart?.device_id) {
    await sendCommand(cart.device_id, "activate", {
      session_id: updated.id,
      duration_minutes: session.duration_minutes,
    });
  }

  return Response.json({
    session_id: updated.id,
    status: updated.status,
    started_at: updated.started_at,
    expires_at: updated.expires_at,
  });
}
