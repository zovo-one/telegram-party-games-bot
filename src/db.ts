import { BaseStore, now } from "./kit.ts";
import type { FleetStats } from "./kit.ts";
import type { Member } from "./logic.ts";

const QA_CHAT = -1001234567890;
/** Mini App pseudo-chat ids are -(9_000_000_000_000 + userId); real Telegram chat ids never reach that magnitude. */
const WEB_CHAT_FLOOR = -9_000_000_000_000;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS chats (chat_id INTEGER PRIMARY KEY, title TEXT NOT NULL DEFAULT '', spicy INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS members (chat_id INTEGER NOT NULL, user_id INTEGER NOT NULL, name TEXT NOT NULL DEFAULT '', last_seen INTEGER NOT NULL, PRIMARY KEY (chat_id, user_id));
CREATE INDEX IF NOT EXISTS members_recent ON members(chat_id, last_seen);
CREATE TABLE IF NOT EXISTS seen (chat_id INTEGER NOT NULL, category TEXT NOT NULL, idx INTEGER NOT NULL, PRIMARY KEY (chat_id, category, idx));
CREATE TABLE IF NOT EXISTS roll_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, chat_id INTEGER NOT NULL, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sources (user_id INTEGER PRIMARY KEY, src TEXT NOT NULL, ts INTEGER NOT NULL);`;

export class Store extends BaseStore {
  constructor(ctx: DurableObjectState, env: Record<string, unknown>) { super(ctx, env, SCHEMA); }

  /** Upsert a chat row (private/pseudo chats get one too, keyed by their own id). An empty title never
   * blanks a previously-known one (private/Mini App touches always pass ""). */
  async touchChat(chatId: number, title: string): Promise<void> {
    this.run(`INSERT INTO chats (chat_id, title, created) VALUES (?1, ?2, ?3)
              ON CONFLICT(chat_id) DO UPDATE SET title = CASE WHEN ?2 = '' THEN title ELSE ?2 END`, chatId, title, now());
  }
  async setSpicy(chatId: number, on: boolean): Promise<void> { this.run("UPDATE chats SET spicy = ?2 WHERE chat_id = ?1", chatId, on ? 1 : 0); }
  async chatSpicy(chatId: number): Promise<boolean> {
    return (this.one<{ spicy: number }>("SELECT spicy FROM chats WHERE chat_id = ?1", chatId)?.spicy ?? 0) === 1;
  }
  async touchMember(chatId: number, userId: number, name: string): Promise<void> {
    this.run(`INSERT INTO members (chat_id, user_id, name, last_seen) VALUES (?1, ?2, ?3, ?4)
              ON CONFLICT(chat_id, user_id) DO UPDATE SET name = ?3, last_seen = ?4`, chatId, userId, name, now());
  }
  async recentMembers(chatId: number, limit = 50): Promise<Member[]> {
    return this.all<{ id: number; name: string }>(
      "SELECT user_id AS id, name FROM members WHERE chat_id = ?1 ORDER BY last_seen DESC LIMIT ?2", chatId, limit);
  }
  /** bucket is `${category}:${tier}` (see logic.ts seenBucket) — keeping tiers apart means a free
   * user's exhaustion/reset can never clear or interfere with a Pro (or Spicy) user's progress. */
  async getSeen(chatId: number, bucket: string): Promise<Set<number>> {
    const rows = this.all<{ idx: number }>("SELECT idx FROM seen WHERE chat_id = ?1 AND category = ?2", chatId, bucket);
    return new Set(rows.map((r) => r.idx));
  }
  async markSeen(chatId: number, bucket: string, idx: number): Promise<void> {
    this.run("INSERT OR IGNORE INTO seen (chat_id, category, idx) VALUES (?1, ?2, ?3)", chatId, bucket, idx);
  }
  async resetSeen(chatId: number, bucket: string): Promise<void> {
    this.run("DELETE FROM seen WHERE chat_id = ?1 AND category = ?2", chatId, bucket);
  }
  async logRoll(userId: number, chatId: number): Promise<void> {
    this.run("INSERT INTO roll_log (user_id, chat_id, ts) VALUES (?1, ?2, ?3)", userId, chatId, now());
  }
  /** First-touch attribution for /start payloads like "site"/"share"/"list"/"x" (see logic.ts isSourcePayload). */
  async recordSource(userId: number, src: string): Promise<void> {
    this.run("INSERT OR IGNORE INTO sources (user_id, src, ts) VALUES (?1, ?2, ?3)", userId, src, now());
  }
  private sourceStats(): Record<string, number> {
    const rows = this.all<{ src: string; n: number }>(
      `SELECT src, COUNT(*) AS n FROM sources WHERE ${this.notTestUser("user_id")} GROUP BY src`);
    const out: Record<string, number> = {};
    for (const r of rows) out["src_" + r.src] = r.n;
    return out;
  }

  /** Real groups only: negative chat ids, excluding the QA group and the Mini App's synthetic
   * per-user pseudo-chats (which live far below any real Telegram chat id). */
  async stats(): Promise<FleetStats> {
    const u = this.userStats();
    const e = this.one<{ n: number }>(`SELECT COUNT(*) AS n FROM roll_log WHERE ${this.notTestUser("user_id")} AND chat_id != ?1`, QA_CHAT);
    const realGroup = "chat_id < 0 AND chat_id > ?2 AND chat_id != ?1";
    const g = this.one<{ n: number }>(`SELECT COUNT(*) AS n FROM chats WHERE ${realGroup}`, QA_CHAT, WEB_CHAT_FLOOR);
    const s = this.one<{ n: number }>(`SELECT COUNT(*) AS n FROM chats WHERE spicy = 1 AND ${realGroup}`, QA_CHAT, WEB_CHAT_FLOOR);
    return { ...u, events: e?.n ?? 0, groups: g?.n ?? 0, spicy_chats: s?.n ?? 0, ...this.sourceStats() };
  }
}
