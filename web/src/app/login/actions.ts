"use server";

import { redirect } from "next/navigation";
import { ensureAdminUser, findUserByUsername, verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  ensureAdminUser();

  const user = findUserByUsername(username);

  if (!user || !verifyUserPassword(user, password)) {
    return { error: "Invalid credentials." };
  }

  await createSession(username);
  redirect("/dashboard");
}
