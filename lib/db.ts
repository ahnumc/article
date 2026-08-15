import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const file = process.env.DATABASE_PATH || "./data/news.sqlite";
fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
export const db = new DatabaseSync(file);
db.exec("PRAGMA busy_timeout = 10000");
db.exec("PRAGMA journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'editor', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, abstract TEXT NOT NULL DEFAULT '', body TEXT NOT NULL, keywords TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', image_width INTEGER NOT NULL DEFAULT 0, image_height INTEGER NOT NULL DEFAULT 0, category TEXT NOT NULL DEFAULT 'News', status TEXT NOT NULL DEFAULT 'draft', author_id INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(author_id) REFERENCES users(id));`);

const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail && process.env.ADMIN_PASSWORD) {
  db.prepare("INSERT OR IGNORE INTO users(email,password_hash,role,created_at) VALUES(?,?,?,?)").run(adminEmail, hash(process.env.ADMIN_PASSWORD), "admin", new Date().toISOString());
}
export { hash };
