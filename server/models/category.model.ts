import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         unique: true,
         minlength: 1,
         maxlength: 100,
      },
      description: {
         type: String,
         maxlength: 500,
         default: "",
      },
   },
   {
      timestamps: true,
   },
);

export const Category = mongoose.model("Category", categorySchema);
