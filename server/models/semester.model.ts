import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
   {
      year: {
         type: Number,
         required: true,
         min: 2000,
         max: 2100,
      },
      semester: {
         type: String,
         required: true,
         enum: ["S1", "S2"],
      },
      isActive: {
         type: Boolean,
         default: true,
      },
      startDate: {
         type: Date,
      },
      endDate: {
         type: Date,
      },
   },
   {
      timestamps: true,
   },
);

export const Semester = mongoose.model("Semester", semesterSchema);
