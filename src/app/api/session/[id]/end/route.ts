import { supabase } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, status")
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

  return Response.json({
    session_id: updated.id,
    status: updated.status,
    ended_at: updated.ended_at,
  });
}
