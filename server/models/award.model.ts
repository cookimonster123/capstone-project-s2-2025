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
         default: "client/src/assets/default_avatar.jpg", //TODO: replace with actual default icon URL in client assets folder
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
