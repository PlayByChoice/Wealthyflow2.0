"use server";

import { redirect } from "next/navigation";
import { ensureAdminUser, findUserByUsername, verifyUserPassword } from "@/lib/db";
import { createSession } from "@/lib/session";

export type LoginState = {
  error: string | null;
};

function sanitizeNextPath(nextValue: FormDataEntryValue | null) {
  const nextPath = String(nextValue ?? "").trim();

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(formData.get("next"));

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  if (!ensureAdminUser()) {
    return { error: "Server auth configuration is missing." };
  }

  const user = findUserByUsername(username);

  if (!user || !verifyUserPassword(user, password)) {
    return { error: "Invalid credentials." };
  }

  await createSession(username);
  redirect(nextPath);
}
