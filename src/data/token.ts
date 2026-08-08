import { prisma } from "@/lib/prisma";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
      },
    });
    return token;
  } catch (error) {
    console.error("Error fetching verification token:", error);
    return null;
  }
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    // Token is unique, so findUnique is appropriate here
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: token },
    });
    return verificationToken;
  } catch (error) {
    console.error("Error fetching verification token by token:", error);
    return null;
  }
};

export const createVerificationToken = async (
  email: string,
  token: string,
  expires: number
) => {
  try {
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(expires),
      },
    });
    return verificationToken;
  } catch (error) {
    console.error("Error creating verification token:", error);
    return null;
  }
};

export const deleteVerificationToken = async (
  identifier: string,
  token: string
) => {
  try {
    // Delete using the composite unique key defined in the schema
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          // Prisma syntax for composite keys
          identifier: identifier,
          token: token,
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting verification token:", error);
    // Handle other errors appropriately, maybe re-throw or log
    return false;
  }
};
