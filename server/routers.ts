import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, router } from "./_core/trpc";
import { exampleRouter } from "./routers/example";
import { serviceNotesRouter } from "./routers/service-notes";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Example router — study this pattern
  example: exampleRouter,

  // ─────────────────────────────────────────────────────────────
  // YOUR TASK: Wire your serviceNotes router here.
  // Import it and add it to this object, e.g.:
  //   serviceNotes: serviceNotesRouter,
  // ─────────────────────────────────────────────────────────────
  serviceNotes: serviceNotesRouter,
});

export type AppRouter = typeof appRouter;
