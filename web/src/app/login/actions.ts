"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

const FALLBACK_EMAIL = "demo@wealthyflow.com";
const FALLBACK_PASSWORD = "ChangeMe123!";

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const validEmail = process.env.AUTH_DEMO_EMAIL ?? FALLBACK_EMAIL;
  const validPassword = process.env.AUTH_DEMO_PASSWORD ?? FALLBACK_PASSWORD;

  if (email !== validEmail.toLowerCase() || password !== validPassword) {
    return { error: "Invalid credentials." };
  }

  await createSession(email);
  redirect("/dashboard");
}
