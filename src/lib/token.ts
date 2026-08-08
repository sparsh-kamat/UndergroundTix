import * as crypto from "node:crypto";
import { createVerificationToken, getVerificationTokenByEmail, deleteVerificationToken } from '@/data/token';

export const generateToken = async (email: string) => {
    const token = crypto.randomUUID();
    const expires = new Date().getTime() + 60 * 60 * 1000; // 1 hour expiration

    //check if token alreaday exists
    const existingToken = await getVerificationTokenByEmail(email);

    // If the token already exists, delete it and create a new one
    if (existingToken) {
        await deleteVerificationToken(existingToken.identifier, existingToken.token);
        await createVerificationToken(email, token, expires);
    }
    // If the token does not exist, create a new one
    else {
        await createVerificationToken(email, token, expires);
    }
    return token;
}
