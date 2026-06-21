"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { findUserByEmail, ensureDemoUser, verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

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

  ensureDemoUser();

  const user = findUserByEmail(email);

  if (!user || !safeEqual(email, user.email) || !verifyUserPassword(user, password)) {
    return { error: "Invalid credentials." };
  }

  await createSession(email);
  redirect("/dashboard");
}
