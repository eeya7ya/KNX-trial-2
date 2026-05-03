import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Logo } from "../../[locale]/components/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-sm">
        <Logo className="h-8 w-auto" />
        <h1 className="mt-2 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink-muted">Enter the admin password to continue.</p>
        <LoginForm />
      </div>
    </div>
  );
}
