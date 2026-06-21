"use server";

import { redirect } from "next/navigation";
import { findUserByEmail, ensureDemoUser, verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  ensureDemoUser();

  const user = findUserByEmail(email);

  if (!user || !verifyUserPassword(user, password)) {
    return { error: "Invalid credentials." };
  }

  await createSession(email);
  redirect("/dashboard");
}
