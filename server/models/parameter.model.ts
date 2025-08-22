import Joi from "joi";
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  parameterType: {
    type: String,
    required: true,
    enum: ["semester", "category"],
  },
});

export const Parameter = mongoose.model("Parameter", projectSchema);

export function validateParameter(parameter: any) {
  const schema = Joi.object({
    parameterType: Joi.string().valid("semester", "category").required(),
  });

  return schema.validate(parameter);
}
