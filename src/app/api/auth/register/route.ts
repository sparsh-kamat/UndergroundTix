//src/app/api/auth/register/route.ts
import {  NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your shared Prisma client
import { z } from "zod";
import { generateToken } from "@/lib/token"; // Import token generator
import { sendVerificationEmail } from "@/lib/mail"; // Import email sender
import bcrypt from "bcryptjs";

// Define the schema for the registration form
const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email" }),
    name: z.string().min(2), // Allow empty string or min 2 chars
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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    //validate using zod
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        "Validation error in registaration:",
        validation.error.flatten().fieldErrors
      );
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    //check if user already exists
    const { email, name, password } = validation.data;

    const existinguser = await prisma.user.findUnique({
      where: { email: email },
    });

    const isverified = existinguser?.emailVerified;

    if (existinguser && isverified) {
      console.error("User already exists:", email);
      return NextResponse.json(
        { Error: "User already exists" },
        { status: 409 }
      ); //Conflict
    }else if (existinguser && !isverified) {
        //delete the existing user
        await prisma.user.delete({
            where: { email: email },
            });
    }

    //user is new, hash the password

    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
      },
    });

    const tokenGenerated = await generateToken(email);

    await sendVerificationEmail(email, tokenGenerated);

    const userWithoutPassword = { ...newUser, password: undefined };

    return NextResponse.json({
      user: userWithoutPassword,
      message: "Email verification sent, proceed to your inbox",
    });
  } catch (error: unknown) { // Changed type from 'any' to 'unknown'
    console.error('Registration API Error:', error);

    // Default error values
    let errorMessage = "An error occurred during registration.";
    let errorStatus = 500; // Internal Server Error

    // Type check: Check if the error is an instance of Error and has a message property
    if (error instanceof Error) {
        // Check for the specific email sending error message
        if (error.message === "Could not send verification email.") {
            errorMessage = "User registered, but failed to send verification email. Please contact support.";
            errorStatus = 502; // Bad Gateway - indicates upstream failure (email service)
        }
        // You could add more specific error message checks here if needed
        // else { errorMessage = error.message; } // Use the error's message if not the email one
    }
    // If it's not an Error instance, we stick to the generic message

    return NextResponse.json({ message: errorMessage }, { status: errorStatus });
  }
}
