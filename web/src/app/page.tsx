import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold">Wealthyflow</h1>
      <p className="max-w-xl text-zinc-600">
        Next.js starter with a simple cookie-based authentication flow.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white">
          Sign in
        </Link>
        <Link href="/dashboard" className="rounded-md border border-black/20 px-4 py-2">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
