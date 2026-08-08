import { type Subscription } from "@prisma/client";
import { calculateNextBillingDateAfter } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

export async function advancePastDueSubscriptions(
  subscriptions: Subscription[],
  now = new Date()
): Promise<Subscription[]> {
  return Promise.all(
    subscriptions.map(async (subscription) => {
      const isActive = subscription.status?.toLowerCase() === "active";
      if (!isActive || subscription.nextBillingDate.getTime() > now.getTime()) {
        return subscription;
      }

      const nextBillingDate = calculateNextBillingDateAfter(
        subscription.lastBillingDate,
        subscription.billingCycle,
        now
      );

      if (!nextBillingDate) return subscription;

      return prisma.subscription.update({
        where: {
          id: subscription.id,
          userId: subscription.userId,
        },
        data: { nextBillingDate },
      });
    })
  );
}
