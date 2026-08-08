//src/lib/subscription-utils.ts
import { Decimal } from "@prisma/client/runtime/library"; // For Prisma's Decimal type
import {
    differenceInCalendarDays,
    parseISO, // Good for parsing date strings from DB if they are ISO
} from 'date-fns';

//function to calculate the normalised monthly cost of a subscription
export function calculateNormalizedMonthlyCost(
    cost: number | Decimal,
    billingCycle: string,
): number {

    const normalizedCost = typeof cost === 'number' ? cost : cost.toNumber();
    if (isNaN(normalizedCost) || normalizedCost < 0) {
        throw new Error('Invalid cost value');
    }

    switch (billingCycle.toUpperCase()) {

        case 'MONTHLY':
            return normalizedCost;
        case 'YEARLY':
        case 'ANNUALLY':
            return normalizedCost / 12;
        case 'QUARTERLY':
            return normalizedCost / 3;
        case 'BI-ANNUALLY': // Every 6 months
        case 'SEMI-ANNUALLY':
            return normalizedCost / 6;
        default:
            console.warn(`Unknown billing cycle for monthly cost normalization: ${billingCycle}`);
            return 0;

    }
}

// Funtion to calculate normalised yearly cost of a subscription

export function calculateNormalizedYearlyCost(
    cost: number | Decimal,
    billingCycle: string,
): number {

    const normalizedCost = typeof cost === 'number' ? cost : cost.toNumber();
    if (isNaN(normalizedCost) || normalizedCost < 0) {
        throw new Error('Invalid cost value');
    }

    switch (billingCycle.toUpperCase()) {

        case 'MONTHLY':
            return normalizedCost * 12;
        case 'YEARLY':
        case 'ANNUALLY':
            return normalizedCost;
        case 'QUARTERLY':
            return normalizedCost * 4;
        case 'BI-ANNUALLY': // Every 6 months
        case 'SEMI-ANNUALLY':
            return normalizedCost * 2;
        default:
            console.warn(`Unknown billing cycle for yearly cost normalization: ${billingCycle}`);
            return 0;

    }
}

export function convertToBaseCurrency(
    cost: number,
    currency: string,
    exchangeRates: Record<string, number>,
): number {
    return cost * (exchangeRates[currency] ?? 1);
}

export function getActiveSubscriptions<T extends { status: string | null }>(
    subscriptions: T[],
): T[] {
    return subscriptions.filter(
        (subscription) => subscription.status?.toLowerCase() === "active",
    );
}

export function getDaysRemaining(dateInput: string | Date | null | undefined): number | null {
    if (!dateInput) return null;
  
    let targetDate: Date;
    if (typeof dateInput === 'string') {
      targetDate = parseISO(dateInput); // Handles ISO strings like those from new Date().toISOString()
    } else if (dateInput instanceof Date) {
      targetDate = new Date(dateInput.getTime()); // Clone to avoid modifying original
    } else {
      return null; // Invalid input type
    }
    
    if (isNaN(targetDate.getTime())) return null; // Invalid date after parsing
  
    const today = new Date();
    
    // Normalize both dates to the start of their respective calendar days for an accurate "days between"
    today.setHours(0, 0, 0, 0); 
    targetDate.setHours(0, 0, 0, 0);
  
    return differenceInCalendarDays(targetDate, today);
  }
