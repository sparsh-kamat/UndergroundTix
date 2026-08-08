import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // Your shared Prisma client
import {
  getVerificationTokenByToken,
  deleteVerificationToken,
} from "@/data/token"; // Import data access functions

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  //validate token presence
  if (!token) {
    console.error("Token is missing");
    // You might want a dedicated error page, but redirecting to signin is common
    return NextResponse.redirect(
      new URL("/auth/signin?error=MissingToken", request.nextUrl.origin)
    );
  }

  try{
    //find the token
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
      console.error("Token not found");
      return NextResponse.redirect(
        new URL("/auth/signin?error=InvalidToken", request.nextUrl.origin)
      );
    }

    // Check if the token is expired
    const hasExpired = new Date().getTime() > existingToken.expires.getTime();
    if (hasExpired) {
      console.error("Token has expired");
      return NextResponse.redirect(
        new URL("/auth/register?error=TokenExpired", request.nextUrl.origin)
      );
    }

    //find the user
    const user = await prisma.user.findUnique({
      where: {
        email: existingToken.identifier,
      },
    });

    if (!user) {
      console.error("User not found");
      return NextResponse.redirect(
        new URL("/auth/register?error=UserNotFound", request.nextUrl.origin)
      );
    }

    //update the user
    await prisma.user.update({
      where: {
        email: existingToken.identifier,
      },
      data: {
        emailVerified: new Date(),
      },
    });
    //delete the token
    await deleteVerificationToken(existingToken.identifier, token);
    //redirect to signin
    return NextResponse.redirect(new URL("/auth/signin?success=EmailVerified", request.nextUrl.origin));


  }
  catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.redirect(
      new URL("/auth/signin?error=VerificationFailed", request.nextUrl.origin)
    );
  }
}
