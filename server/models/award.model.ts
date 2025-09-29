import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true,
      },
      iconUrl: {
         type: String,
         default:
            "https://showcaseweb.s3.ap-southeast-2.amazonaws.com/assets/defaultMedal.svg",
      },
      description: {
         type: String,
         required: true,
      },
      category: {
         type: String,
         required: true,
         enum: [
            "Innovation",
            "Design",
            "Technical Excellence",
            "Social Impact",
            "Best Overall",
            "People's Choice",
         ],
      },
   },
   {
      timestamps: true,
   },
);

// Index for efficient queries
awardSchema.index({ category: 1 });
// enforce unique award names
awardSchema.index({ name: 1 }, { unique: true });

export const Award = mongoose.model("Award", awardSchema);
