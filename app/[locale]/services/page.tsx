import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { DetailPageShell } from "../components/DetailPageShell";
import { ServicesDetail } from "../components/SectionDetails";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  return (
    <DetailPageShell dict={dict} locale={L}>
      <ServicesDetail dict={dict} />
    </DetailPageShell>
  );
}
