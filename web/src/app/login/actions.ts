"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

const DEFAULT_DEMO_EMAIL = "demo@wealthyflow.com";
const DEFAULT_DEMO_PASSWORD = "ChangeMe123!";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
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

  const validEmail = process.env.AUTH_DEMO_EMAIL ?? DEFAULT_DEMO_EMAIL;
  const validPassword = process.env.AUTH_DEMO_PASSWORD ?? DEFAULT_DEMO_PASSWORD;

  if (!safeEqual(email, validEmail.toLowerCase()) || !safeEqual(password, validPassword)) {
    return { error: "Invalid credentials." };
  }

  await createSession(email);
  redirect("/dashboard");
}
