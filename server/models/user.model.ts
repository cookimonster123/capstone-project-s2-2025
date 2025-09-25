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
            type: {
               type: String,
               enum: ["github", "linkedin", "personalWebsite"],
               required: true,
            },
            value: {
               type: String,
               required: true,
            },
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
      likedProjects: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
         },
      ],
      favorites: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
         },
      ],
   },
   {
      timestamps: true,
   },
);

export const User = mongoose.model("User", userSchema);
