import mongoose, { Schema } from "mongoose";

interface IPasswordResetToken {
   email: string;
   tokenHash: string;
   expiresAt: Date;
   usedAt?: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
   {
      email: { type: String, required: true, index: true },
      tokenHash: { type: String, required: true },
      expiresAt: { type: Date, required: true, index: true },
      usedAt: { type: Date },
   },
   { timestamps: true },
);

export const PasswordResetToken = mongoose.model<IPasswordResetToken>(
   "PasswordResetToken",
   passwordResetTokenSchema,
);
