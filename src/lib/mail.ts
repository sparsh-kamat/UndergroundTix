import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, token: string) => {
  //base url in .env
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  // Configure Nodemailer transport
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address for SubscriptionTrackr",
    html: `<p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thank you!</p>
    <hr>
    <p><small>Link not working? Copy and paste this URL into your browser:</small></p>
    <p><small>${verificationUrl}</small></p>
    <p><small>Note: This link will expire in 1 hour.</small></p>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

//reset password email
export const sendResetPasswordEmail = async (email: string, token: string) => {
  //base url in .env
  const resetPasswordLink = `${process.env.NEXTAUTH_URL}/auth/resetpassword?token=${token}`;

  // Configure Nodemailer transport
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your SubscriptionTrackr password",
    html: `<p>Click the link below to reset your password:</p>
    <a href="${resetPasswordLink}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>Thank you!</p>
    <hr>
    <p><small>Link not working? Copy and paste this URL into your browser:</small></p>
    <p><small>${resetPasswordLink}</small></p>
    <p><small>Note: This link will expire in 1 hour.</small></p>
    `,
  };

  try {
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
