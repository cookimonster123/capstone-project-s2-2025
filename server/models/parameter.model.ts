import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema({
   parameterType: {
      type: String,
      required: true,
      enum: ["semester", "category"],
   },
   value: {
      type: String,
      minlength: 1,
      maxlength: 100,
      required: true,
   },
});

export const Parameter = mongoose.model("Parameter", parameterSchema);
