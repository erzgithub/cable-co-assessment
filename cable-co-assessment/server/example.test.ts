/**
 * Example Tests — demonstrates the testing patterns used in this codebase.
 *
 * Study this file to understand:
 * - How to create mock contexts (public, authenticated, admin)
 * - How to test auth gates (unauthenticated / wrong role → rejected)
 * - How to test input validation
 * - How to mock the database layer
 * - How to test success paths
 *
 * Your task: Write similar tests for your service notes router.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ───
// vi.hoisted runs before imports, so mock functions are available for vi.mock
const mocks = vi.hoisted(() => ({
  serviceRequests: [] as Array<Record<string, unknown>>,
}));

// Mock the database module
vi.mock("./db", () => {
  // Build a chainable mock that resolves to mocks.serviceRequests
  // regardless of the chain order (from→where→limit or from→orderBy→limit)
  const createChain = () => {
    const chain: Record<string, any> = {};
    chain.from = vi.fn().mockReturnValue(chain);
    chain.where = vi.fn().mockReturnValue(chain);
    chain.orderBy = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockImplementation(() => Promise.resolve(mocks.serviceRequests));
    return chain;
  };

  return {
    getDb: vi.fn().mockImplementation(async () => ({
      select: vi.fn().mockImplementation(() => createChain()),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    })),
  };
});

// Import AFTER mocks are set up
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context helpers ───

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

/** Creates a context with no authenticated user (public access). */
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

/** Creates a context with an authenticated regular user. */
function createUserContext(
  overrides?: Partial<AuthenticatedUser>
): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "user-002",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

/** Creates a context with an authenticated admin user. */
function createAdminContext(
  overrides?: Partial<AuthenticatedUser>
): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-001",
    email: "admin@cable-co.com.au",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.serviceRequests = [];
});

// ═══════════════════════════════════════════════════════════════
// AUTH GATES — Verify access control
// ═══════════════════════════════════════════════════════════════

describe("example.list — auth gates", () => {
  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.example.list()).rejects.toThrow();
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.example.list()).rejects.toThrow();
  });

  it("allows admin users", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.example.list();
    expect(result).toHaveProperty("requests");
  });
});

// ═══════════════════════════════════════════════════════════════
// INPUT VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("example.updateStatus — input validation", () => {
  it("rejects invalid status value", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      // @ts-expect-error testing invalid input
      caller.example.updateStatus({ id: 1, status: "invalid_status" })
    ).rejects.toThrow();
  });

  it("accepts valid status values", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.example.updateStatus({
      id: 1,
      status: "resolved",
    });
    expect(result.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// SUCCESS PATHS
// ═══════════════════════════════════════════════════════════════

describe("example.getById — success path", () => {
  it("returns null when service request not found", async () => {
    mocks.serviceRequests = [];
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.example.getById({ id: 999 });
    expect(result.request).toBeNull();
  });

  it("returns the service request when found", async () => {
    mocks.serviceRequests = [
      {
        id: 1,
        clientName: "Test Client",
        clientEmail: "test@example.com",
        subject: "Test Request",
        status: "open",
      },
    ];
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.example.getById({ id: 1 });
    expect(result.request).toBeTruthy();
    expect(result.request?.clientName).toBe("Test Client");
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTH LOGOUT — Pattern reference for testing mutations
// ═══════════════════════════════════════════════════════════════

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const clearedCookies: Array<{
      name: string;
      options: Record<string, unknown>;
    }> = [];

    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "sample-user",
        email: "sample@example.com",
        name: "Sample User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe("app_session_id");
  });
});
