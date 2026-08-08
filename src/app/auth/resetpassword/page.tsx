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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Use Sonner for toasts
import { Icons } from "../../../components/icons";
import { Suspense } from "react";
//import { ThemeSwitch } from "@/components/custom/ThemeSwitch"

// Zod schema for registration form validation
//it will have email password, confirm password
const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

// Infer the TypeScript type from the Zod schema
type changePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ResetPasswordForm() {
  // State

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

  const form = useForm<changePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  //get token
  const token = searchParams.get("token");
  if (!token) {
    toast.error("Invalid Token", {
      description: "Token invalid. Please try again.",
    });
    return;
  }

  //handler for "sign up button"
  const onChangePasswordSubmit = async (values: changePasswordFormValues) => {
    setIsLoadingCredentials(true);
    //get token
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Invalid Token", {
        description: "Token invalid. Please try again.",
      });
      return;
    }

    //log to console
    try {
      const response = await fetch("/api/auth/resetpassword?token=" + token, {
        method: "POST",
        body: JSON.stringify({
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle the response
      if (response.ok) {
        toast.success("Password Changed Successfully", {
          description: "You can now log in with your new password.",
        });
        router.push("/auth/signin");
      } else {
        const errorData = await response.json();
        console.error("Error changing password:", errorData);
        toast.error("Password Change Failed", {
          description:
            errorData.error || "An error occurred. Please try again.",
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
    <div className="flex flex-col flex-grow items-center justify-center bg-muted/40 px-4 py-4 ">
      <Card className=" ml-5 mr-5  w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Please enter your new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Credentials Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onChangePasswordSubmit)}
              className="grid gap-4"
            >
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-baseline">
                      <FormLabel>New Password</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        // placeholder="••••••••"
                        autoComplete="current-password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-baseline">
                      <FormLabel>Confirm Password</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        // placeholder="••••••••"
                        autoComplete="current-password"
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
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} // End of RegisterPage component

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading page...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
