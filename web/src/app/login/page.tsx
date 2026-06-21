import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Wealthyflow Sign In</h1>
      <LoginForm />
      <p className="text-sm text-zinc-600">
        Back to <Link href="/" className="underline">home</Link>
      </p>
    </main>
  );
}
