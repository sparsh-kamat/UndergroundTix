// src/lib/prisma.ts
// import { PrismaClient } from "../../node_modules/.prisma/client"; // Adjust the import path as necessary
import { PrismaClient } from "@prisma/client"; // Import PrismaClient from the Prisma package

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
