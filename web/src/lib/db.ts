import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type UserRecord = {
  username: string;
  passwordHash: string;
  salt: string;
};

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

function migrateUsersTable(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;

  const hasUsername = columns.some((column) => column.name === "username");
  const hasEmail = columns.some((column) => column.name === "email");

  if (!hasUsername && hasEmail) {
    db.prepare("ALTER TABLE users RENAME TO users_legacy").run();
    db.prepare(
      `CREATE TABLE users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();
    db.prepare(
      `INSERT INTO users (username, password_hash, salt, created_at)
       SELECT email, password_hash, salt, created_at FROM users_legacy`
    ).run();
    db.prepare("DROP TABLE users_legacy").run();
  }
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
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ).run();

  migrateUsersTable(db);

  dbInstance = db;
  return db;
}

export function ensureAdminUser() {
  const username = (process.env.AUTH_ADMIN_USERNAME ?? "").trim();
  const password = process.env.AUTH_ADMIN_PASSWORD ?? "";

  if (!username || !password) {
    return false;
  }

  const db = getDb();
  const existing = db.prepare("SELECT username FROM users WHERE username = ?").get(username) as { username: string } | undefined;

  if (!existing) {
    const salt = randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);

    db.prepare("INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)").run(username, passwordHash, salt);
  }

  return true;
}

export function findUserByUsername(username: string): UserRecord | null {
  const db = getDb();
  const user = db
    .prepare("SELECT username, password_hash AS passwordHash, salt FROM users WHERE username = ?")
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
