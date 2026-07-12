"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason");

  const message =
    reason === "suspended"
      ? "Your account has been suspended due to a policy violation. If you believe this is a mistake, contact support."
      : "Sign-in failed. Please use your VIT student email (@vitstudent.ac.in).";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-2xl text-cream mb-3">Unable to Sign In</h1>
        <p className="text-sm text-smoke">{message}</p>
        <a
          href="/"
          className="inline-block mt-8 bg-black border border-flare/50 text-flare-bright px-4 py-2 rounded-lg text-sm font-medium hover:bg-flare hover:text-black transition"
        >
          Back to sign in
        </a>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  );
}
