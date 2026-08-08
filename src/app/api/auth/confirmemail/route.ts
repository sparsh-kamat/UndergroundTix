import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your shared Prisma client
import { z } from "zod";
import { generateToken } from "@/lib/token"; // Import token generator
import { sendResetPasswordEmail } from "@/lib/mail"; // Import email sender

const registerSchema = z
    .object({
        email: z.string().email({ message: "Please enter a valid email" }),

    });

export async function POST(request: Request) {
    try {
        const body = await request.json();
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

        const { email } = validation.data;

        const existinguser = await prisma.user.findUnique({
            where: { email: email },
        });

        //user doesnt exist
        if (!existinguser) {
            return NextResponse.json(
                { Error: "User does not exist" },
                { status: 404 }
            ); //Not Found
        }


        const isverified = existinguser?.emailVerified;
        //user exists and is not verified
        if (existinguser && !isverified) {
            return NextResponse.json(
                { Error: "Register Again" },
                { status: 409 }
            ); //Conflict
        }

        //user exists and is verified
        if (existinguser && isverified) {
            const token = await generateToken(email);
            await sendResetPasswordEmail(email, token);
            return NextResponse.json(
                { message: "Reset password email sent" },
                { status: 200 }
            );
        }


    } catch (error) {
        console.error("Error in registration:", error);
        return NextResponse.json(
            { Error: "Internal server error" },
            { status: 500 }
        ); //Internal Server Error
    }
}

