import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "wf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

type SessionPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  if (process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === "production" && process.env.SESSION_SECRET.length < 32) {
      throw new Error("SESSION_SECRET must be at least 32 characters in production.");
    }

    return process.env.SESSION_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return "dev-only-session-secret-change-me";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function createToken(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (typeof parsed.email !== "string" || typeof parsed.exp !== "number") {
      return null;
    }

    if (Date.now() > parsed.exp * 1000) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createSession(email: string) {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, createToken({ email, exp: expiry }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return parseToken(token);
}
