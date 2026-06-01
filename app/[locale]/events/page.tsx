import { notFound } from "next/navigation";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import { getEvents } from "@/lib/db";
import { DetailPageShell } from "../components/DetailPageShell";
import { EventsDetail } from "../components/SectionDetails";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const dict = getDict(L);
  const events = await getEvents();
  return (
    <DetailPageShell dict={dict} locale={L}>
      <EventsDetail dict={dict} events={events} />
    </DetailPageShell>
  );
}
