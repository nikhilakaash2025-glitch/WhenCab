import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";
import InstallPrompt from "@/components/InstallPrompt";
import TopMenu from "@/components/TopMenu";
import { ChatProvider } from "@/context/ChatContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phoneNumber: true },
  });

  // Google never supplies a phone number, so new users are routed to
  // complete their profile once before they can post or message.
  if (!user?.phoneNumber) {
    redirect("/complete-profile");
  }

  return (
    <ChatProvider>
      <div className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-ink-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-display text-sm tracking-wide text-flare-bright">
            When<span className="text-cream">Cab</span>
          </span>
          <TopMenu />
        </div>
      </div>
      {children}
      <ChatWidget currentUserId={session.user.id} />
      <InstallPrompt />
    </ChatProvider>
  );
