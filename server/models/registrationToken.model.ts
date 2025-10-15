import mongoose, { Schema } from "mongoose";

interface IRegistrationToken {
   email: string;
   name: string;
   passwordHash: string;
   tokenHash: string;
   purpose: "register";
   expiresAt: Date;
   usedAt?: Date;
}

const registrationTokenSchema = new Schema<IRegistrationToken>(
   {
      email: { type: String, required: true, index: true },
      name: { type: String, required: true },
      passwordHash: { type: String, required: true },
      tokenHash: { type: String, required: true },
      purpose: {
         type: String,
         enum: ["register"],
         default: "register",
         required: true,
      },
      expiresAt: { type: Date, required: true, index: true },
      usedAt: { type: Date },
   },
   { timestamps: true },
);

export const RegistrationToken = mongoose.model<IRegistrationToken>(
   "RegistrationToken",
   registrationTokenSchema,
);
