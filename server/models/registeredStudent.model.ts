import mongoose, { Document, Schema, Model } from "mongoose";
import { IBulkUpsertResult } from "../interfaces/registeredStudent";

export interface IRegisteredStudent extends Document {
   upi: string;
   name: string;
   teamName?: string;
}

// Interface for static methods
interface IRegisteredStudentModel extends Model<IRegisteredStudent> {
   isRegisteredStudent(upi: string): Promise<boolean>;
   bulkUpsert(
      students: { upi: string; name: string; teamName: string }[],
   ): Promise<IBulkUpsertResult>;
}

const registeredStudentSchema = new Schema<IRegisteredStudent>(
   {
      upi: {
         type: String,
         required: true,
         unique: true, // Ensures no duplicate UPIs
         lowercase: true, // Normalize to lowercase for consistent comparisons
         trim: true, // Remove whitespace
         validate: {
            validator: function (v: string) {
               // UPI format validation (typically 4-8 characters, alphanumeric)
               return /^[a-z0-9]{4,8}$/.test(v);
            },
            message: "UPI must be 4-8 alphanumeric characters",
         },
      },
      name: {
         type: String,
         required: true,
         trim: true,
         maxlength: 100,
      },
      teamName: {
         type: String,
         required: false,
         maxlength: 100,
      },
   },
   {
      collection: "registeredstudents", // Explicit collection name
   },
);

// Static method for efficient UPI lookup
registeredStudentSchema.statics.isRegisteredStudent = async function (
   upi: string,
): Promise<boolean> {
   const normalizedUpi = upi.toLowerCase().trim();
   const student = await this.findOne({ upi: normalizedUpi }).lean();
   return !!student;
};

// Static method for bulk insert with duplicate handling
registeredStudentSchema.statics.bulkUpsert = async function (
   students: { upi: string; name: string; teamName: string }[],
): Promise<IBulkUpsertResult> {
   const operations = students.map((student) => ({
      updateOne: {
         filter: { upi: student.upi.toLowerCase().trim() },
         update: {
            $set: {
               upi: student.upi.toLowerCase().trim(),
               name: student.name.trim(),
               teamName: student.teamName ? student.teamName.trim() : undefined,
            },
         },
         upsert: true,
      },
   }));

   return this.bulkWrite(operations, { ordered: false });
};

export const RegisteredStudent = mongoose.model<
   IRegisteredStudent,
   IRegisteredStudentModel
>("RegisteredStudent", registeredStudentSchema);
