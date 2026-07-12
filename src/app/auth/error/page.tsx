"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const reason = params.get("reason");

  const message =
    reason === "suspended"
      ? "Your account has been suspended due to a policy violation. If you believe this is a mistake, contact support."
      : "Sign-in failed. Please use your VIT student email (@vitstudent.ac.in).";

  return (
    <div className="max-w-md mx-auto mt-20 text-center px-4">
      <h1 className="text-lg font-semibold mb-2">Unable to Sign In</h1>
      <p className="text-sm text-gray-600">{message}</p>
      <a href="/" className="inline-block mt-6 text-sm text-blue-600 font-medium">
        Back to sign in
      </a>
    </div>
  );
}
