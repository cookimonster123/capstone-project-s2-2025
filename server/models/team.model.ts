import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         minlength: 1,
         maxlength: 50,
      },
      // Canvas group identifier from CSV (used to disambiguate teams with same name)
      canvasGroupId: {
         type: String,
         required: false,
         index: true,
         trim: true,
      },
      members: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
         },
      ],
      project: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Project",
      },
   },
   {
      timestamps: true,
   },
);

// Ensure uniqueness on (name, canvasGroupId) when both are provided
teamSchema.index({ name: 1, canvasGroupId: 1 }, { unique: true, sparse: true });

export const Team = mongoose.model("Team", teamSchema);
