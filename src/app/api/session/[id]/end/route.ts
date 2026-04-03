import { supabase } from "@/lib/supabase";
import { sendCommand } from "@/lib/device-simulator";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, status, cart_id")
    .eq("id", id)
    .single();

  if (fetchError || !session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "active") {
    return Response.json(
      { error: `Session cannot be ended (status: ${session.status})` },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return Response.json(
      { error: "Failed to end session" },
      { status: 500 }
    );
  }

  // Send deactivate command to the device
  const { data: cart } = await supabase
    .from("carts")
    .select("device_id")
    .eq("id", session.cart_id)
    .single();

  if (cart?.device_id) {
    await sendCommand(cart.device_id, "deactivate", {
      session_id: updated.id,
      reason: "manual_end",
    });
  }

  return Response.json({
    session_id: updated.id,
    status: updated.status,
    ended_at: updated.ended_at,
  });
}
