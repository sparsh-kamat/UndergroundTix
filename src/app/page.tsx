"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Eye,
  Smartphone,
  CreditCard,
  Github,
  CheckCircle,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {HexagonBackground} from "@/components/animate-ui/backgrounds/hexagon"

export default function Home() {
  return (
    <div className="flex flex-col flex-grow items-center min-h-dvh   ">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="flex flex-grow h-screen  w-full items-center justify-center  ">
      <HexagonBackground className="absolute inset-0 z-10" />
        <div className=" relative  container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center items-center justify-center flex flex-col ">
            {/* Badge */}

            {/* Main heading */}
            <h1 className=" z-10 mb-6 sm:mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
              Take Control of Your{" "}
              <span className=" z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                Subscriptions
              </span>
            </h1>

            {/* Description */}
            <p className="  z-10 sm:text-lg md:text-xl  text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Stop losing track of Netflix, Spotify, gym memberships, and all
              those autopay subscriptions. Get complete visibility and control
              over your recurring expenses.
            </p>

            {/* CTA Button */}
            <div className="z-10 mb-8 sm:mb-10">
              <Link href="/dashboard" className="z-10">
              <Button
                size="lg"
                className=" z-10 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <h3 className=" z-10">Start Tracking Free</h3>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className=" z-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
        {/* seperator */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/50"></div>
      </section>

      <section
        id="features"
        className="w-full flex justify-center items-center  "
      >
        <div className="container justify-center items-center px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Never Lose Track Again
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From streaming services to gym memberships, house help to
                internet bills - keep everything organized and under control.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 place-items-center lg:place-items-stretch py-12">
            <Card className="h-full w-xs bg-muted/50 hover:bg-muted/60 transition-colors duration-300 md:w-xs lg:w-full">
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-1" />
                <CardTitle>Complete Visibility</CardTitle>
                <CardDescription>
                  See all your subscriptions in one dashboard. No more forgotten
                  autopay charges or surprise bills.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full w-xs bg-muted/50 hover:bg-muted/60 transition-colors duration-300 md:w-xs lg:w-full">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-1" />
                <CardTitle>Mobile & Desktop</CardTitle>
                <CardDescription>
                  Access your subscription dashboard anywhere. Responsive Web
                  UI.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="h-full md:col-span-2  lg:col-span-1 w-xs bg-muted/50 hover:bg-muted/60 transition-colors duration-300 md:w-xs lg:w-full">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-primary mb-1" />
                <CardTitle>Easy Setup</CardTitle>
                <CardDescription>
                  Just login and start adding! No credit card required for the
                  free plan.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
            © 2025 SubscriptionTrackr. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          
          <Link 
            href="https://github.com/sparsh-kamat"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* add made with love by */}
            <span>Made with ❤️ by</span>
            <Github className="h-3 w-3" />
            <span>Sparsh Kamat</span>
          </Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 1s;
        }

        .animation-delay-4000 {
          animation-delay: 1s;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
