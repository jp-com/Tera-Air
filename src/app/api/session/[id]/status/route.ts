import { supabase } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: session, error } = await supabase
    .from("sessions")
    .select("id, status, started_at, expires_at, ended_at")
    .eq("id", id)
    .single();

  if (error || !session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  let seconds_remaining: number | null = null;

  if (session.status === "active" && session.expires_at) {
    const now = new Date();
    const expires = new Date(session.expires_at);
    seconds_remaining = Math.max(
      0,
      Math.floor((expires.getTime() - now.getTime()) / 1000)
    );
  }

  return Response.json({
    session_id: session.id,
    status: session.status,
    seconds_remaining,
  });
}
