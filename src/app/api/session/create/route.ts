import { supabase } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.json();
  const { cart_id, plan_type } = body;

  if (!cart_id || !plan_type) {
    return Response.json(
      { error: "cart_id and plan_type are required" },
      { status: 400 }
    );
  }

  // Look up cart and its club
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id, club_id, is_active")
    .eq("id", cart_id)
    .single();

  if (cartError || !cart) {
    return Response.json({ error: "Cart not found" }, { status: 404 });
  }

  if (!cart.is_active) {
    return Response.json({ error: "Cart is not active" }, { status: 400 });
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select(
      "id, pricing_model, session_prices, session_durations, currency"
    )
    .eq("id", cart.club_id)
    .single();

  if (clubError || !club) {
    return Response.json({ error: "Club not found" }, { status: 404 });
  }

  // Find the matching duration for the plan_type
  const durations = club.session_durations as { label: string; minutes: number }[];
  const matchedDuration = durations.find(
    (d) => d.label.toLowerCase().replace(/\s+/g, "_") === plan_type
  );

  if (!matchedDuration) {
    return Response.json(
      { error: "Invalid plan_type for this club" },
      { status: 400 }
    );
  }

  const isFree = club.pricing_model === "free";
  const prices = club.session_prices as Record<string, number>;
  const price = isFree ? null : prices[plan_type] ?? null;
  const durationMinutes = matchedDuration.minutes;

  // Build the session record
  const sessionData: Record<string, unknown> = {
    cart_id: cart.id,
    club_id: club.id,
    plan_type,
    duration_minutes: durationMinutes,
    price,
    currency: club.currency,
    status: isFree ? "active" : "pending",
  };

  if (isFree) {
    const now = new Date();
    sessionData.started_at = now.toISOString();
    sessionData.expires_at = new Date(
      now.getTime() + durationMinutes * 60 * 1000
    ).toISOString();
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert(sessionData)
    .select()
    .single();

  if (sessionError || !session) {
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }

  // For paid sessions, create a Stripe PaymentIntent
  if (!isFree && price != null) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price,
      currency: club.currency.toLowerCase(),
      metadata: {
        session_id: session.id,
        club_id: club.id,
        cart_id: cart.id,
      },
    });

    await supabase
      .from("sessions")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", session.id);

    return Response.json({
      session_id: session.id,
      status: session.status,
      client_secret: paymentIntent.client_secret,
    });
  }

  return Response.json({
    session_id: session.id,
    status: session.status,
  });
}
