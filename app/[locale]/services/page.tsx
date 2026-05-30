import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getSiteDict } from "@/lib/site-content";
import { DetailPageShell } from "../components/DetailPageShell";
import { ServicesDetail } from "../components/SectionDetails";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = await getSiteDict(L);
  return (
    <DetailPageShell dict={dict} locale={L}>
      <ServicesDetail dict={dict} />
    </DetailPageShell>
  );
}
