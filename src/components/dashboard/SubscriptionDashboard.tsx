"use client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import AddSubscriptionCard from "@/components/subscription/AddSubscriptionCard";
import SubscriptionList from "@/components/dashboard/SubscriptionList";
import SpendPieChart from "./SpendCategoryPieChart";
import RenewingSubscriptions from "./RenewingSubscriptions";
import { useEffect, useState } from "react";

import { type DashboardData } from "@/app/api/dashboard/route";
import { type Subscription } from "@prisma/client";

//loading skeleton for  dashboard
import { Skeleton } from "../ui/skeleton";
import TopCards from "./TopCards";

function DashboardSkeleton() {
  return (
    <Card className="flex flex-col border w-full items-center gap-0 p-0 animate-pulse">
      <div className="flex flex-col sm:flex-row h-fit justify-between w-full p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold"> Dashboard</h1>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Skeleton className="w-[170px] h-[40px]" />
        </div>
      </div>
      <div className="grid gap-4 xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-fit p-4 w-full">
        {/* Create 4 skeleton cards for the top stats */}
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="gap-3 p-4">
            <Skeleton className="w-3/4 h-[24px] mb-2" />
            <Skeleton className="w-1/2 h-[32px]" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-5 lg:grid-cols-7 p-4 w-full">
        <Card className="md:col-span-3 lg:col-span-4 p-4">
          <Skeleton className="w-1/3 h-[28px] mb-4" />
          <Skeleton className="w-full h-[200px]" />
        </Card>
        <Card className="lg:col-span-3 md:col-span-2 p-4">
          <Skeleton className="w-1/2 h-[28px] mb-4" />
          <Skeleton className="w-full h-[40px] mb-2" />
          <Skeleton className="w-full h-[40px] mb-2" />
          <Skeleton className="w-full h-[40px]" />
        </Card>
      </div>
    </Card>
  );
}

export default function SubscriptionsDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setIsError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  
  // State to manage which subscription is currently being edited
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);


  const fetchData = async () => {
    setIsLoading(true);
    setIsError(null);

    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch dashboard data");
      }
      const data: DashboardData = await response.json();
      setDashboardData(data);
    } catch (error) {
      if (error instanceof Error) setIsError(error.message);
      else setIsError("an unknown problem occured ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // Handler to set the subscription to be edited, which opens the form modal
  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
  };

  // Handler to close the edit form modal
  const handleCloseForm = () => {
    setEditingSubscription(null);
  };

  // This function is called when a subscription is successfully deleted, added, or updated
  const handleSuccess = () => {
    setEditingSubscription(null); // Close the form if it was open
    fetchData(); // And refresh all the dashboard data
  };

  // 1. While loading, show a skeleton or loading state
  if (isLoading) return <DashboardSkeleton />;

  // 2. If an error occurred, show an error message
  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 w-full text-center">
        <h2 className="text-xl font-semibold text-destructive">
          Could not load dashboard
        </h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  // 3. If there's no data show a welcome/empty state
  if (!dashboardData || dashboardData.activeSubscriptions === 0) {
    return (
      
      <Card className="flex flex-col border w-full items-center gap-4 p-6 text-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          You haven&apos;t added any subscriptions yet. Get started by adding
          your first one!
        </p>
        <Link href="/add">
          <Button className="gap-1 mt-4">
            <PlusCircle className="h-4 w-4" />
            Add Subscription
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <>

     {/* If a subscription is being edited, show the form in a modal overlay */}
     {editingSubscription && (
         <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <AddSubscriptionCard 
                    subscriptionToEdit={editingSubscription}
                    onSuccess={handleSuccess}
                    onClose={handleCloseForm}
                />
            </div>
         </div>
      )}
    <Card className="flex flex-col border  w-full items-center gap-0 p-0 ">
      <div className=" flex flex-col sm:flex-row h-fit justify-between  w-full p-4">
        <div className="flex items-center gap-4 ">
          <h1 className="text-2xl font-bold "> Dashboard</h1>
        </div>
        <div className="flex items-center justify-end gap-4 ">
          <Link href="/add">
            <Button className="gap-1 ">
              <PlusCircle className="h-4 w-4" />
              Add Subscription
            </Button>
          </Link>
        </div>
      </div>

      {/* display top stats */}
      <TopCards
        totalMonthlyCost={dashboardData.totalMonthlyCost}
        activeSubscriptionsCount={dashboardData.activeSubscriptions}
        totalYearlyCost={dashboardData.totalYearlyCost}
        upcomingRenewalsCount={dashboardData.numberOfUpcomingRenewals}
      />
      <div className="grid gap-4 sm:grid-cols-1  md:grid-cols-5 lg:grid-cols-7  p-4  w-full">
        <Card className="md:col-span-3 lg:col-span-4 ">
          {/* pie chart of spends by catergory */}
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of your subscription spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendPieChart data={dashboardData.categorySpending} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 md:col-span-2">
          {/* Upcoming subcription payments */}
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
            <CardDescription>
              Subscriptions renewing in the next 15 days
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto md:max-h-[200px] lg:max-h-[225px] xl:max-h-[250px] hide-scrollbar-track">
            <RenewingSubscriptions
              upcomingRenewals={dashboardData.upcomingRenewals}
            />
          </CardContent>
        </Card>
      </div>
      <div className=" flex p-4   w-full">
        <Card className="flex w-full ">
          <CardHeader>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Manage your active subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionList
              recentSubscriptions={dashboardData.recentSubscriptions}
              onSubscriptionDeleted={fetchData} // Re-fetch data after deletion
              onEditSubscription={handleEdit} // Pass the edit handler
            />
          </CardContent>
          <CardFooter>
            <Link href="/subscriptions">
              <Button variant="outline">View All</Button>
            </Link>
          </CardFooter>

          {/* all subscriptions */}
        </Card>
      </div>
    </Card>
    </>
  );
}
