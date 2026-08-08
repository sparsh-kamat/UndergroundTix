// File: src/components/subscription/AddSubscriptionCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Optional, if you want to add a description
} from "@/components/ui/card"; // Assuming you have a Card component

import {
  subscriptionSchema,
  type SubscriptionFormData,
} from "@/lib/validations/subscription"; // Make sure SubscriptionFormData is exported
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { cn } from "@/lib/utils"; // For conditional class names
import { format } from "date-fns"; // For formatting dates
import { type Subscription } from "@prisma/client";
// You might want to define these lists centrally or fetch them if they become dynamic
const billingCycles = ["Monthly", "Yearly", "Quarterly"]; // Add more as needed
const currencies = ["USD", "INR", "EUR", "GBP"]; // Example currencies
// Updated and expanded list of categories
const categories = [
  "Streaming", 
  "Software", 
  "Gaming", 
  "Utilities", 
  "Health & Fitness", 
  "Education", 
  "Shopping", 
  "Cloud Storage", 
  "Productivity", 
  "News & Media",
  "Music",
  "Other"
];
const folders = ["Work", "Personal", "Default", "Other"]; // Example folders
const statuses = ["Active", "Paused", "Cancelled"];

function normalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

interface SubscriptionFormCardProps {
  subscriptionToEdit?: Subscription | null; // Optional prop for editing an existing subscription
  onSuccess: () => void; // Callback for successful submission
  onClose?: () => void; // Callback to close the form, if needed
}

export default function AddSubscriptionCard({
  subscriptionToEdit,
  onSuccess,
  onClose,
}: SubscriptionFormCardProps) {
  const isEditMode = !!subscriptionToEdit; // Check if we are in edit mode

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // For form submission loading state

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: "",
      cost: 0,
      currency: "INR",
      billingCycle: "",
      lastBillingDate: undefined, // Default to current date
      status: "Active",
      category: "",
      folder: "Default",
      notes: "", // Optional field
    },
  });

  // If editing, set the form values to the subscriptionToEdit data
  useEffect(() => {
    if (isEditMode && subscriptionToEdit) {
      // Use form.reset to update all fields
      form.reset({
        ...subscriptionToEdit,
        cost: Number(subscriptionToEdit.cost), // Convert Decimal to number for the form
        lastBillingDate: new Date(subscriptionToEdit.lastBillingDate),
        status: normalizeStatus(subscriptionToEdit.status),
        notes: subscriptionToEdit.notes || "", // Ensure notes is a string
      });
    }
  }, [isEditMode, subscriptionToEdit, form]);

  //   http://localhost:3000/api/subscriptions post
  const onSubmit = async (data: SubscriptionFormData) => {

    setIsLoading(true);
    const url = isEditMode
      ? `/api/subscriptions/${subscriptionToEdit?.id}`
      : "/api/subscriptions";
    const method = isEditMode ? "PUT" : "POST"; // Use PUT for editing, POST for adding

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "add"} subscription`
        );
      }

      // Show success toast and redirect
      toast.success(
        `Subscription successfully ${isEditMode ? "updated" : "added"}!`
      );
      onSuccess(); // Call the success callback

      if (!isEditMode) {
        router.push("/dashboard");
        router.refresh(); // Redirect to the subscriptions page or wherever you want
      }
      // If you have a close callback, you can call it here
      if (onClose) {
        onClose(); // Close the form if a callback is provided
      }
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error("Failed to add subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Centering container
    <Card className=" ml-5 mr-5  max-w-xl  shadow-md">
      <CardHeader className="">
        <CardTitle className="text-2xl ">
          {isEditMode ? "Edit" : "Add"} Subscription
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Update the details of your subscription."
            : "Add a new subscription to your tracker."}
        </CardDescription>
      </CardHeader>

      <CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Add Subscription Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              {/* Cost Field */}
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 9.99"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        } // Ensure it's a number
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency Field */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem className="col-span-2 ">
                    <FormLabel>Billing Cycle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingCycles.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {cycle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Last Billing Date Field */}
            <FormField
              control={form.control}
              name="lastBillingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Billing Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="folder"
              render={({ field }) => (
                <FormItem className="col-span-2 ">
                  <FormLabel>Folder</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Folder  " />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {folders.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* logo file upload and notes textfield */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                  ? "Update Subscription"
                  : "Add Subscription"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
// This code is a complete React component for adding a subscription.
