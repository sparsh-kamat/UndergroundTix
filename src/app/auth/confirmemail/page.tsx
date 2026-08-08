// src/app/signin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Shadcn UI components
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
  Card,
  CardContent,
  CardDescription,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Use Sonner for toasts
import { Icons } from "../../../components/icons";
import { Suspense } from "react";
//import { ThemeSwitch } from "@/components/custom/ThemeSwitch"

// Zod schema for registration form validation
//it will have email password, confirm password
const confirmemailschemea = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

// Infer the TypeScript type from the Zod schema
type confirmemailFormValues = z.infer<typeof confirmemailschemea>;

function ConfirmEmailForm() {
  // State for loading indicators

  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  // Next.js hooks
  const router = useRouter();
  const searchParams = useSearchParams();

  // Effect to handle messages/errors passed via URL query parameters
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error) {
      toast.error("Invalid Token", {
        description: "Token invalid. Please try again.",
      });
      window.history.replaceState(null, "", "/register"); // Adjust path if needed
    }
  }, [searchParams]);

  const form = useForm<confirmemailFormValues>({
    resolver: zodResolver(confirmemailschemea),
    defaultValues: {
      email: "",
    },
  });

  //handler for "sign up button"
  const onConfirmEmailSubmit = async (values: confirmemailFormValues) => {
    setIsLoadingCredentials(true);

    //log to console
    try {
      const response = await fetch("/api/auth/confirmemail", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Attempt to parse the response body regardless of status code
      // This helps get error messages even on failure
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Handle cases where the response body isn't valid JSON
        console.error("Failed to parse response JSON:", jsonError);
        data = { message: "Received an invalid response from the server." };
      }

      if (response.ok) {
        //change password success
        toast.success("Password reset link sent", {
          description:
            "Check your email for the instructions to reset your password.",
        });
        router.push("/auth/signin");
      } else {
        // Show the specific error message from the backend response
        toast.error("Password Change Failed", {
          description: data.message || "An error occurred",
        });
      }
    } catch (error) {
      // Handle network errors or other unexpected issues during fetch
      console.error("Password Change fetch error:", error);
      toast.error("Password Change Failed", {
        description: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setIsLoadingCredentials(false); // Ensure loading state is reset
    }
  };

  // Combined loading state
  const isLoading = isLoadingCredentials;

  return (
    // Centering container
    <div className="flex flex-col flex-grow items-center justify-center bg-muted/40 ">
      <Card className=" ml-5 mr-5  w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Credentials Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onConfirmEmailSubmit)}
              className="grid gap-4"
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        // placeholder="user@gmail.com"
                        autoComplete="email"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoadingCredentials && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Password Reset Link
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} // End of RegisterPage component

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading page...
        </div>
      }
    >
      <ConfirmEmailForm />
    </Suspense>
  );
}
