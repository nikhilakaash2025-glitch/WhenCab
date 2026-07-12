import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";
import InstallPrompt from "@/components/InstallPrompt";
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
      {children}
      <ChatWidget currentUserId={session.user.id} />
      <InstallPrompt />
    </ChatProvider>
  );
}
