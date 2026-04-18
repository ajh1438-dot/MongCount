import { S6WeeklyReportScreen } from "@/components/screens/s6/s6-weekly-report-screen";

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] | undefined; tier?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const view = pickFirst(params.view);
  const tier = pickFirst(params.tier);

  return <S6WeeklyReportScreen tier={tier === "premium" ? "premium" : "free"} monthlyTabActive={view === "monthly"} />;
}
