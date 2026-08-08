"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Define the props that this component will receive
interface TopCardsProps {
  totalMonthlyCost: number;
  currency?: string; // Optional, can be used to display currency symbol
  activeSubscriptionsCount: number;
  totalYearlyCost: number;
  upcomingRenewalsCount: number;
}

import { formatCurrency } from "@/lib/currency";

export default function TopCards({
  totalMonthlyCost,
  activeSubscriptionsCount,
  totalYearlyCost,
  currency = "INR", // Default to "Rs." if not provided
  upcomingRenewalsCount,
}: TopCardsProps) {
  return (
    <div className="grid gap-4 xs:grid-cols-1 md:grid-cols-2  lg:grid-cols-4 h-fit p-4  w-full">
      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between  ">
          <CardTitle className="text-m font-medium">
            Total Monthly Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalMonthlyCost, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on active subscriptions
          </p>
        </CardContent>
      </Card>
      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between ">
          <CardTitle className="text-m font-medium">
            Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold"> {activeSubscriptionsCount}</div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>
      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between ">
          <CardTitle className="text-m font-medium">Annual Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalYearlyCost, currency)}
          </div>
          <p className="text-xs text-muted-foreground">
            Based on current subscriptions
          </p>
        </CardContent>
      </Card>
      <Card className="gap-3">
        <CardHeader className="flex flex-row items-center justify-between ">
          <CardTitle>Upcoming Renewals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingRenewalsCount}</div>
          <p className="text-xs text-muted-foreground">In the next 15 days</p>
        </CardContent>
      </Card>
    </div>
  );
}
