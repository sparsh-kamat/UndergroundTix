import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  advancePastDueSubscriptions: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));
vi.mock("@/lib/renewals", () => ({
  advancePastDueSubscriptions: mocks.advancePastDueSubscriptions,
}));

import { GET as getSubscriptions } from "@/app/api/subscriptions/route";
import { GET as getSubscription } from "@/app/api/subscriptions/[id]/route";

describe("subscription API authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("rejects an unauthenticated subscriptions request", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await getSubscriptions();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mocks.findMany).not.toHaveBeenCalled();
  });

  it("does not return a subscription owned by another user", async () => {
    mocks.auth.mockResolvedValue({ user: { id: "current-user" } });
    mocks.findUnique.mockResolvedValue(null);

    const response = await getSubscription(
      new NextRequest("http://localhost/api/subscriptions/other-subscription"),
      { params: Promise.resolve({ id: "other-subscription" }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: {
        id: "other-subscription",
        userId: "current-user",
      },
    });
  });
});
