import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditableContent } from "@/lib/site-content";
import { AdminShell } from "../AdminShell";
import { SiteContentEditor } from "./SiteContentEditor";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const content = await getEditableContent();

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold tracking-tight">Homepage content</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Edit the homepage stats, the About section, the Services cards, and the FAQ. Changes
        apply to both the English and Arabic sites.
      </p>
      <SiteContentEditor initial={content} />
    </AdminShell>
  );
}
