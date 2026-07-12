import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Signature element: a dashed centerline receding toward the glow,
          standing in for the road these rides actually travel */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 34px, rgba(247,127,0,0.5) 34px, rgba(247,127,0,0.5) 58px)",
          maskImage: "linear-gradient(180deg, black 0%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(180deg, black 0%, transparent 80%)",
          width: "3px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      <div className="max-w-sm w-full text-center relative">
        <p className="text-xs tracking-[0.3em] text-flare uppercase mb-3 font-semibold">
          Before you head home
        </p>
        <h1 className="font-display text-5xl text-cream tracking-tight mb-3 leading-none">
          When<span className="text-flare-bright">Cab</span>
        </h1>
        <p className="text-sm text-smoke mb-10 leading-relaxed">
          Coordinate cab-pooling to airports and stations before the holidays —
          with fellow VIT students only.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-black border-2 border-flare text-flare-bright rounded-lg py-3 text-sm font-semibold hover:bg-flare hover:text-black transition wc-focus"
          >
            Continue with Google
          </button>
        </form>

        <div className="wc-roadline mt-8 mb-4" />

        <p className="text-xs text-smoke/70">
          Only @vitstudent.ac.in email addresses can sign in.
        </p>
      </div>
    </div>
  );
}
