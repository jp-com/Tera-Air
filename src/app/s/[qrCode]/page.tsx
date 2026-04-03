import { SessionFlow } from "./session-flow";

export default async function CartPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const { qrCode } = await params;
  return <SessionFlow qrCode={qrCode} />;
}
