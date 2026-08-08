// src/app/signin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner"; // Use Sonner for toasts
import { Icons } from "../../../components/icons";
import { Suspense } from "react";

//import { ThemeSwitch } from "@/components/custom/ThemeSwitch"

// Zod schema for registration form validation
//it will have email password, confirm password
const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email" }),
    name: z.string().min(2), // Allow  min 2 chars
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
type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterFormContent() {
  // State for loading indicators

  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Next.js hooks
  const router = useRouter();
  const searchParams = useSearchParams();

  // Effect to handle messages/errors passed via URL query parameters
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error === "UserNotFound") {
      toast.error("User Not Found", {
        description: "User not found. Please register.",
      });
      // Clean the URL search params without reloading the page
      window.history.replaceState(null, "", "/register"); // Adjust path if needed
    } else if (error) {
      toast.error("Registration Failed", {
        description: "An error occurred during registration. Please try again.",
      });
      // Clean the URL search params without reloading the page
      window.history.replaceState(null, "", "/register"); // Adjust path if needed
    }
  }, [searchParams]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  //handler for "sign up button"
  const onCredentialsSubmit = async (values: RegisterFormValues) => {
    setIsLoadingCredentials(true);
    //log to console
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          //log to console
          name: values.name,
          password: values.password,
          confirmPassword: values.confirmPassword,
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
        // Registration successful (backend returned 201)
        // Show success message and redirect to signin page
        // (The backend now sends the verification email)
        toast.success("Registration Submitted!", {
          description:
            data.message || "Please check your email for a verification link.",
        });
        // Redirect to sign-in, user needs to verify email before logging in
        router.push("/auth/signin?success=EmailSent");
      } else {
        // Registration failed (backend returned 4xx or 5xx)
        // Show the specific error message from the backend response
        toast.error("Registration Failed", {
          description:
            data.message ||
            "An error occurred. Please check your input and try again.",
        });
      }
    } catch (error) {
      // Handle network errors or other unexpected issues during fetch
      console.error("Registration fetch error:", error);
      toast.error("Registration Failed", {
        description: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setIsLoadingCredentials(false); // Ensure loading state is reset
    }
  };

  // Handler for "Continue with Google" button click
  const handleGoogleSignIn = () => {
    setIsLoadingGoogle(true);
    // Initiate Google sign-in flow
    // NextAuth handles the redirect loop and callback
    signIn("google", {
      callbackUrl: searchParams?.get("callbackUrl") || "/dashboard",
    });
    // No need to set loading false, page redirects
  };

  // Combined loading state
  const isLoading = isLoadingCredentials || isLoadingGoogle;

  return (
    // Centering container
    <div className="flex flex-col flex-grow items-center justify-center bg-muted/40 px-4 py-4 ">
      <Card className=" ml-5 mr-5  w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Registration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Credentials Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCredentialsSubmit)}
              className="grid gap-4"
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                // placeholder="user@gmail.com"
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
              {/* Name Field */}
              <FormField
                // placeholder="App User"
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="name"
                        // placeholder="App User"
                        autoComplete="name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password Field */}
              <FormField
                control={form.control}
                // placeholder="••••••••"
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-baseline">
                      <FormLabel>Password</FormLabel>
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
                // placeholder="••••••••"
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
                Register
              </Button>
            </form>
          </Form>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with Google
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoadingGoogle ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              // Adjust href if your auth routes aren't under /auth/
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} // End of RegisterPage component

export default function RegisterPage() {
  // Since useSearchParams is in SignInFormContent, we wrap that.
  // If SignInPage itself used useSearchParams directly, we'd wrap its return.
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading page...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
