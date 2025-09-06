import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         minlength: 1,
         maxlength: 50,
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

export const Team = mongoose.model("Team", teamSchema);
