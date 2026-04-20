import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // In the full app, this authenticates the request via OAuth.
  // For the assessment, focus on the router/test layer.
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
