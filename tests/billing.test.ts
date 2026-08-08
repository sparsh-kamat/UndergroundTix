import { describe, expect, it } from "vitest";
import {
  calculateNextBillingDate,
  calculateNextBillingDateAfter,
} from "@/lib/date-utils";
import {
  calculateNormalizedMonthlyCost,
  calculateNormalizedYearlyCost,
  convertToBaseCurrency,
  getActiveSubscriptions,
} from "@/lib/subscription-utils";

describe("renewal date calculation", () => {
  it("clamps a January 31 monthly renewal to February 28", () => {
    const result = calculateNextBillingDate(
      new Date("2023-01-31T12:00:00.000Z"),
      "Monthly",
    );

    expect(result?.toISOString()).toBe("2023-02-28T12:00:00.000Z");
  });

  it("uses February 29 during a leap year", () => {
    const result = calculateNextBillingDate(
      new Date("2024-01-31T12:00:00.000Z"),
      "Monthly",
    );

    expect(result?.toISOString()).toBe("2024-02-29T12:00:00.000Z");
  });

  it("moves a February 29 yearly renewal to February 28", () => {
    const result = calculateNextBillingDate(
      new Date("2024-02-29T12:00:00.000Z"),
      "Yearly",
    );

    expect(result?.toISOString()).toBe("2025-02-28T12:00:00.000Z");
  });

  it("clamps a January 31 quarterly renewal to April 30", () => {
    const result = calculateNextBillingDate(
      new Date("2025-01-31T12:00:00.000Z"),
      "Quarterly",
    );

    expect(result?.toISOString()).toBe("2025-04-30T12:00:00.000Z");
  });

  it("rolls an old monthly date to the first future occurrence", () => {
    const result = calculateNextBillingDateAfter(
      new Date("2025-01-31T12:00:00.000Z"),
      "Monthly",
      new Date("2026-08-08T00:00:00.000Z"),
    );

    expect(result?.toISOString()).toBe("2026-08-31T12:00:00.000Z");
  });

  it("rolls an old quarterly date to the first future quarter", () => {
    const result = calculateNextBillingDateAfter(
      new Date("2025-01-31T12:00:00.000Z"),
      "Quarterly",
      new Date("2025-08-08T00:00:00.000Z"),
    );

    expect(result?.toISOString()).toBe("2025-10-31T12:00:00.000Z");
  });
});

describe("cost normalization", () => {
  it("keeps a monthly cost unchanged for a monthly total", () => {
    expect(calculateNormalizedMonthlyCost(120, "Monthly")).toBe(120);
  });

  it("divides a yearly cost across twelve months", () => {
    expect(calculateNormalizedMonthlyCost(1200, "Yearly")).toBe(100);
  });

  it("multiplies a monthly cost by twelve for a yearly total", () => {
    expect(calculateNormalizedYearlyCost(100, "Monthly")).toBe(1200);
  });

  it("keeps a yearly cost unchanged for a yearly total", () => {
    expect(calculateNormalizedYearlyCost(1200, "Yearly")).toBe(1200);
  });
});

describe("dashboard filtering and currency conversion", () => {
  it("converts a foreign cost using its stored base-currency rate", () => {
    expect(convertToBaseCurrency(10, "USD", { USD: 83.5 })).toBe(835);
  });

  it("uses a neutral rate when a currency rate is unavailable", () => {
    expect(convertToBaseCurrency(10, "INR", {})).toBe(10);
  });

  it("excludes paused and cancelled subscriptions", () => {
    const subscriptions = [
      { id: "active", status: "Active" },
      { id: "paused", status: "Paused" },
      { id: "cancelled", status: "Cancelled" },
    ];

    expect(getActiveSubscriptions(subscriptions)).toEqual([
      { id: "active", status: "Active" },
    ]);
  });
});
