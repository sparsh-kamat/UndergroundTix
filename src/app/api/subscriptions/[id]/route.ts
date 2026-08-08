// src/app/api/subscriptions/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth'; // Your auth setup
import { prisma } from '@/lib/prisma';
import { subscriptionSchema } from '@/lib/validations/subscription'; // We'll use this for PUT
import { calculateNextBillingDateAfter } from '@/lib/date-utils';
import { advancePastDueSubscriptions } from '@/lib/renewals';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const urlParameter = await params;
    const subscriptionId = urlParameter.id;
    const session = await auth();
    if (!session?.user.id) {
        console.error("User not authenticated");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    try {
        const subscription = await prisma.subscription.findUnique({
            where: {
                id: subscriptionId,
                userId: session.user.id,
            },
        });

        if (!subscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }
        const [currentSubscription] = await advancePastDueSubscriptions([subscription]);
        return NextResponse.json(currentSubscription, { status: 200 });

    }
    catch (error) {
        console.error("Unknown Error fetching subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

export async function PUT(
    Request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const urlParameter = await params;
    const subscriptionId = urlParameter.id;

    const session = await auth();
    if (!session?.user.id) {
        console.error("User not authenticated");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    try {
        const body = await Request.json();
        const validation = subscriptionSchema.safeParse(body);
        if (!validation.success) {
            console.error(
                "Validation error in subscription:",
                validation.error.flatten().fieldErrors
            );
            return NextResponse.json(
                { errors: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const {
            name,
            cost,
            currency,
            billingCycle,
            lastBillingDate,
            status,
            category,
            folder,
            notes,
        } = validation.data;

        //check if the subscription exists
        const existingSubscription = await prisma.subscription.findUnique({
            where: {
                id: subscriptionId,
                userId: session.user.id,
            },
        });

        if (!existingSubscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        // Calculate next billing date based on the last billing date and billing cycle
        const calculatedNextBillingDate = calculateNextBillingDateAfter(
            new Date(lastBillingDate),
            billingCycle,
            new Date()
        );

        if (!calculatedNextBillingDate) {
            return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
        }

        const updatedSubscription = await prisma.subscription.update({
            where: {
                id: subscriptionId,
                userId: session.user.id,
            },
            data: {
                name,
                cost,
                currency,
                billingCycle,
                lastBillingDate: new Date(lastBillingDate),
                nextBillingDate: calculatedNextBillingDate,
                status,
                category,
                folder,
                notes
            },
        });

        return NextResponse.json(updatedSubscription, { status: 200 });

    } catch (error) {
        console.error("Unknown Error updating subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const urlParameter = await params;
    const subscriptionId = urlParameter.id;
    const session = await auth();
    if (!session?.user.id) {
        console.error("User not authenticated");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!subscriptionId) {
        return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    try {
        //check if the subscription exists
        const existingSubscription = await prisma.subscription.findUnique({
            where: {
                id: subscriptionId,
                userId: session.user.id,
            },
        });

        if (!existingSubscription) {
            return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
        }

        await prisma.subscription.delete({
            where: {
                id: subscriptionId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ message: "Subscription deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Unknown Error deleting subscription:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}
