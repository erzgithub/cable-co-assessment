import { describe, it, expect, vi, beforeEach } from "vitest";
import { serviceNotesRouter } from "./service-notes"; 
import { getDb } from "../db";

// Mock DB
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("serviceNotesRouter", () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getDb as any).mockResolvedValue(mockDb);
  });

  // Helper contexts
  const adminCtx = {
    user: { id: 1, role: "admin" },
  };

  const userCtx = {
    user: { id: 2, role: "user" },
  };

  const noAuthCtx = {};

  // ---------------------------
  // AUTH TESTS
  // ---------------------------
  it("rejects unauthenticated users", async () => {
    await expect(
      serviceNotesRouter.createCaller(noAuthCtx as any).list({
        serviceRequestId: 1,
      })
    ).rejects.toThrow();
  });

  it("rejects non-admin users", async () => {
    await expect(
      serviceNotesRouter.createCaller(userCtx as any).list({
        serviceRequestId: 1,
      })
    ).rejects.toThrow();
  });

  // ---------------------------
  // VALIDATION TEST
  // ---------------------------
  it("rejects empty content on add", async () => {
    await expect(
      serviceNotesRouter.createCaller(adminCtx as any).add({
        serviceRequestId: 1,
        content: "",
      })
    ).rejects.toThrow();
  });

  // ---------------------------
  // SUCCESS: ADD
  // ---------------------------
  it("allows admin to add note", async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(true),
    });

    const result = await serviceNotesRouter
      .createCaller(adminCtx as any)
      .add({
        serviceRequestId: 1,
        content: "Test note",
      });

    expect(mockDb.insert).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  // ---------------------------
  // SUCCESS: DELETE
  // ---------------------------
  it("allows admin to delete note", async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(true),
    });

    const result = await serviceNotesRouter
      .createCaller(adminCtx as any)
      .delete({
        noteId: 1,
      });

    expect(mockDb.delete).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("returns notes list for admin", async () => {
    mockDb.select.mockReturnValue({
        from: () => ({
        where: () => ({
            orderBy: () => Promise.resolve([{ id: 1, content: "Note" }]),
        }),
        }),
    });

    const result = await serviceNotesRouter
        .createCaller(adminCtx as any)
        .list({ serviceRequestId: 1 });

    expect(result.notes.length).toBe(1);
  });
});