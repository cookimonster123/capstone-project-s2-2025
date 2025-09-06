import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         minlength: 1,
         maxlength: 30,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         match: /.+\@.+\..+/,
      },
      password: {
         type: String,
         required: true,
         minlength: 6,
         select: false,
      },
      profilePicture: {
         type: String,
         default: "", // TODO: Add default pfp (aws)
      },
      role: {
         type: String,
         enum: ["visitor", "admin", "staff", "capstoneStudent"],
         default: "visitor",
         required: true,
      },
      links: [
         {
            type: new mongoose.Schema({
               value: {
                  type: String,
               },
               type: {
                  type: String,
                  enum: ["github", "linkedin", "personalWebsite"],
               },
            }),
         },
      ],
      project: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Project",
      },
      team: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Team",
      },
      lastLogin: {
         type: Date,
      },
   },
   {
      timestamps: true,
   },
);

export const User = mongoose.model("User", userSchema);
