import { S10PaywallScreen } from "@/components/screens/s10/s10-paywall-screen";

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value;
}

export default async function PaywallPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return <S10PaywallScreen source={pickFirst(params.source)} />;
}
