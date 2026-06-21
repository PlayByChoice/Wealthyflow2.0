import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "./actions";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-lg">Signed in as <strong>{session.username}</strong></p>
      <form action={logoutAction}>
        <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
          Sign out
        </button>
      </form>
    </main>
  );
}
