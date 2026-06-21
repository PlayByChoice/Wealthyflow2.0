import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

function sanitizeNextPath(nextPath: string | undefined) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const nextPath = sanitizeNextPath(params.next);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Wealthyflow Sign In</h1>
      <LoginForm nextPath={nextPath} />
      <p className="text-sm text-zinc-600">
        Back to <Link href="/" className="underline">home</Link>
      </p>
    </main>
  );
}
