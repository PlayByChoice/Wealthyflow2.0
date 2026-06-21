"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

const FALLBACK_EMAIL = "demo@wealthyflow.com";
const FALLBACK_PASSWORD = "ChangeMe123!";

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (process.env.NODE_ENV === "production" && (!process.env.AUTH_DEMO_EMAIL || !process.env.AUTH_DEMO_PASSWORD)) {
    return { error: "Server auth configuration is missing." };
  }

  const validEmail = process.env.AUTH_DEMO_EMAIL ?? FALLBACK_EMAIL;
  const validPassword = process.env.AUTH_DEMO_PASSWORD ?? FALLBACK_PASSWORD;

  if (email !== validEmail.toLowerCase() || !safeEqual(password, validPassword)) {
    return { error: "Invalid credentials." };
  }

  await createSession(email);
  redirect("/dashboard");
}
