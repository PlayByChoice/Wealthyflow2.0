import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type UserRecord = {
  username: string;
  passwordHash: string;
  salt: string;
};

const DEFAULT_ADMIN_USERNAME = "Thetymes1";
const DEFAULT_ADMIN_PASSWORD = "Pass1698$";

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

export function ensureAdminUser() {
  const username = (process.env.AUTH_ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME).trim();
  const password = process.env.AUTH_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  if (!username || !password) {
    return;
  }

  const db = getDb();
  const existing = db.prepare("SELECT email FROM users WHERE email = ?").get(username) as { email: string } | undefined;

  if (existing) {
    return;
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  db.prepare("INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)").run(username, passwordHash, salt);
}

export function findUserByUsername(username: string): UserRecord | null {
  const db = getDb();
  const user = db
    .prepare("SELECT email AS username, password_hash AS passwordHash, salt FROM users WHERE email = ?")
    .get(username) as UserRecord | undefined;

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
