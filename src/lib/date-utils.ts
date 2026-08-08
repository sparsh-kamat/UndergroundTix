import { addMonths, addYears, getDate, lastDayOfMonth, setDate } from "date-fns";

function addClampedMonths(date: Date, months: number): Date {
  const originalDay = getDate(date);
  const targetMonth = addMonths(date, months);
  const lastDay = getDate(lastDayOfMonth(targetMonth));

  return setDate(targetMonth, Math.min(originalDay, lastDay));
}

function calculateOccurrence(
  lastBillingDate: Date,
  billingCycle: string,
  occurrence: number
): Date | null {
  switch (billingCycle.toUpperCase()) {
    case "MONTHLY":
      return addClampedMonths(lastBillingDate, occurrence);
    case "QUARTERLY":
      return addClampedMonths(lastBillingDate, occurrence * 3);
    case "YEARLY":
    case "ANNUALLY":
      return addYears(lastBillingDate, occurrence);
    case "ONE-TIME":
      return null;
    default:
      return null;
  }
}

export function calculateNextBillingDate(
  lastBillingDate: Date,
  billingCycle: string
): Date | null {
  if (!(lastBillingDate instanceof Date) || Number.isNaN(lastBillingDate.getTime())) {
    return null;
  }

  return calculateOccurrence(lastBillingDate, billingCycle, 1);
}

export function calculateNextBillingDateAfter(
  lastBillingDate: Date,
  billingCycle: string,
  afterDate = new Date()
): Date | null {
  if (
    !(lastBillingDate instanceof Date) ||
    Number.isNaN(lastBillingDate.getTime()) ||
    !(afterDate instanceof Date) ||
    Number.isNaN(afterDate.getTime())
  ) {
    return null;
  }

  for (let occurrence = 1; occurrence <= 1200; occurrence += 1) {
    const candidate = calculateOccurrence(lastBillingDate, billingCycle, occurrence);
    if (!candidate) return null;
    if (candidate.getTime() > afterDate.getTime()) return candidate;
  }

  return null;
}
