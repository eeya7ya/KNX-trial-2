import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getPublicContent } from "@/lib/db";
import { DetailPageShell } from "../components/DetailPageShell";
import { MembersDetail } from "../components/SectionDetails";

export const dynamic = "force-dynamic";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  const { team } = await getPublicContent();
  return (
    <DetailPageShell dict={dict} locale={L}>
      <MembersDetail dict={dict} team={team} />
    </DetailPageShell>
  );
}
