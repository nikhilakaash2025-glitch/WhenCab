import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/dashboard");
  }

  return <div className="min-h-screen bg-wc-app">{children}</div>;
}
