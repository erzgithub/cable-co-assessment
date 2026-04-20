/**
 * Example Router — demonstrates the patterns used in this codebase.
 *
 * This router manages service requests. Study this file to understand:
 * - How to define tRPC procedures (query vs mutation)
 * - How to use Zod for input validation
 * - How to use adminProcedure for access control
 * - How to interact with the database via helpers
 *
 * Your task: Create a similar router for service request notes.
 */
import { z } from "zod/v4";
import { eq, desc } from "drizzle-orm";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { serviceRequests } from "../../drizzle/schema";

export const exampleRouter = router({
  /**
   * List recent service requests (admin only).
   */
  list: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const limit = input?.limit ?? 50;
      const requests = await db
        .select()
        .from(serviceRequests)
        .orderBy(desc(serviceRequests.createdAt))
        .limit(limit);

      return { requests };
    }),

  /**
   * Get a single service request by ID (admin only).
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.id, input.id))
        .limit(1);

      if (result.length === 0) {
        return { request: null };
      }

      return { request: result[0] };
    }),

  /**
   * Update the status of a service request (admin only).
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(serviceRequests)
        .set({ status: input.status })
        .where(eq(serviceRequests.id, input.id));

      return { success: true, message: `Status updated to ${input.status}.` };
    }),
});
