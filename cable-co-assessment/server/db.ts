import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, serviceRequests } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily create the Drizzle instance.
 * Returns null if DATABASE_URL is not set (e.g. in tests).
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── User helpers ──

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Service Request helpers ──

export async function getServiceRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRecentServiceRequests(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(limit);
}
