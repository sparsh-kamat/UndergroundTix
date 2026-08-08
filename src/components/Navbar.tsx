"use client";

import Link from "next/link";
import { ThemeSwitch } from "@/components/custom/ThemeSwitch";
import { useSession } from "next-auth/react"; // Adjust path if needed
import { signOut } from "next-auth/react";
//router

import { Button, buttonVariants } from "@/components/ui/button"; // Adjust path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Adjust path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust path
import { Menu } from "lucide-react"; // For mobile menu icon
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"; // For mobile menu drawer

export const Navbar = () => {
  const { data: session } = useSession();

  //get only the first name from the user name
  return (
    <nav className="sticky top-0 flex h-16 z-50 w-full border-b bg-background  ">
      <div className="ml-5 container flex  items-center">
        <Link href="/" className=" flex items-center space-x-2">
          <span className="font-bold inline-block  text-2xl text-pretty  ">
            SubscriptionTrackr
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-between space-x-4 ml-auto ">
        <ThemeSwitch label={false} />
        {session?.user ? (
          //show avatar and dropdown menu if user is logged in
          <div className=" hidden md:flex items-center m-0">
            <div className="items-center space-x-4">
              <Link
                href={"/dashboard"}
                className={buttonVariants({ variant: "ghost" })}
              >
                Dashboard
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative  ">
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={session.user?.image ?? undefined}
                      alt="User Avatar"
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* <span className="">{ firstName }</span> */}
                  {/* add icon for dropown */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-down-icon lucide-chevron-down"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem
                  className="font-normal"
                  onClick={() => signOut()}
                >
                  <Button
                    variant="ghost"
                    className=""
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          //show login button if user is not logged in
          <Button
            variant="ghost"
            className=" hidden md:flex  items-center mr-2"
          >
            <Link href={"/auth/signin"}>Login</Link>
          </Button>
        )}

        {/* Mobile Menu Trigger (Visible on small screens) */}

        <div className="sm:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {/* Add Mobile Navigation Links Here */}
              {session ? (
                <nav className="flex flex-col space-y-4 mt-6">
                  <SheetClose asChild>
                    <Link href="/dashboard" className="w-full">
                      <Button variant="ghost" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/add" className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full"
                    >
                      Add Subscription
                    </Button>
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </SheetClose>
                </nav>
              ) : (
                <nav className="flex flex-col space-y-4 mt-6">
                  <SheetClose asChild>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/auth/signin">Login</Link>
                    </Button>
                  </SheetClose>
                </nav>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
