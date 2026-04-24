import { z } from "zod/v4";
import { eq, desc } from "drizzle-orm";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { serviceRequestNotes } from "../../drizzle/schema";

export const serviceNotesRouter = router({
  add: adminProcedure
    .input(
      z.object({
        serviceRequestId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx}) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available!");

      await db.insert(serviceRequestNotes).values({
        serviceRequestId: input.serviceRequestId,
        authorId: ctx.user.id,
        content: input.content,
      });

      return { success: true, message: `Created Note Successfuly.` };

    }),
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).optional().default(50),
          serviceRequestId: z.number(),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available!");

        const limit = input?.limit ?? 50;
        const notes = await db
          .select()
          .from(serviceRequestNotes)
          .where(eq(serviceRequestNotes.serviceRequestId, input.serviceRequestId))
          .orderBy(desc(serviceRequestNotes.createdAt))
          .limit(limit);

        return { notes };
      }),
      delete: adminProcedure
        .input(
          z.object({
            noteId: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          const db = await getDb();
          if (!db) throw new Error("Database not available!");

          await db
            .delete(serviceRequestNotes)
            .where(eq(serviceRequestNotes.id, input.noteId));

          return { success: true, message: `Note Deleted Successfuly.` };
        }),
});