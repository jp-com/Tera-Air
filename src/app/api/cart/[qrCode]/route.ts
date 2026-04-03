import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  const { qrCode } = await params;

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("id, cart_number, qr_code, device_id, device_status, is_active, club_id")
    .eq("qr_code", qrCode)
    .single();

  if (cartError || !cart) {
    return Response.json({ error: "Cart not found" }, { status: 404 });
  }

  if (!cart.is_active) {
    return Response.json({ error: "Cart is not active" }, { status: 400 });
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("name, pricing_model, session_prices, session_durations, currency")
    .eq("id", cart.club_id)
    .single();

  if (clubError || !club) {
    return Response.json({ error: "Club not found" }, { status: 404 });
  }

  const response: Record<string, unknown> = {
    cart: {
      id: cart.id,
      cart_number: cart.cart_number,
      qr_code: cart.qr_code,
      device_status: cart.device_status,
    },
    club: {
      name: club.name,
      pricing_model: club.pricing_model,
      session_durations: club.session_durations,
      currency: club.currency,
    },
  };

  if (club.pricing_model !== "free") {
    (response.club as Record<string, unknown>).session_prices = club.session_prices;
  }

  return Response.json(response);
}
