import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema({
   parameterType: {
      type: String,
      required: true,
      enum: ["semester", "category"],
   },
});

export const Parameter = mongoose.model("Parameter", parameterSchema);
