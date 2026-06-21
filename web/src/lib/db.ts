import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type UserRecord = {
  email: string;
  passwordHash: string;
  salt: string;
};

const DEFAULT_DEMO_EMAIL = "demo@wealthyflow.com";
const DEFAULT_DEMO_PASSWORD = "ChangeMe123!";

let dbInstance: Database.Database | null = null;

function getDatabasePath() {
  const configured = process.env.DATABASE_PATH ?? "./data/wealthyflow.db";
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();
  const dbDir = path.dirname(dbPath);

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  dbInstance = db;
  return db;
}

export function ensureDemoUser() {
  const email = (process.env.AUTH_DEMO_EMAIL ?? DEFAULT_DEMO_EMAIL).trim().toLowerCase();
  const password = process.env.AUTH_DEMO_PASSWORD ?? DEFAULT_DEMO_PASSWORD;

  if (!email || !password) {
    return;
  }

  const db = getDb();
  const existing = db.prepare("SELECT email FROM users WHERE email = ?").get(email) as { email: string } | undefined;

  if (existing) {
    return;
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  db.prepare("INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)").run(email, passwordHash, salt);
}

export function findUserByEmail(email: string): UserRecord | null {
  const db = getDb();
  const user = db
    .prepare("SELECT email, password_hash AS passwordHash, salt FROM users WHERE email = ?")
    .get(email) as UserRecord | undefined;

  return user ?? null;
}

export function verifyUserPassword(user: UserRecord, password: string) {
  const provided = Buffer.from(hashPassword(password, user.salt), "hex");
  const stored = Buffer.from(user.passwordHash, "hex");

  if (provided.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(provided, stored);
}
