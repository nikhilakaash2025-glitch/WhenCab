import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">VIT Carpool</h1>
        <p className="text-sm text-gray-600 mb-8">
          Coordinate cab-pooling to airports and stations before holidays — with fellow VIT
          students only.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Only @vitstudent.ac.in email addresses can sign in.
        </p>
      </div>
    </div>
  );
}
