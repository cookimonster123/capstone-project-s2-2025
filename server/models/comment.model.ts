import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
   {
      content: {
         type: String,
         required: true,
         trim: true,
         maxlength: 1000,
      },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      project: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Project",
         required: true,
      },
   },
   {
      timestamps: true,
   },
);

// Index for efficient queries
commentSchema.index({ project: 1 });
commentSchema.index({ author: 1 });

// Populate author by default
commentSchema.pre(/^find/, function (this: any) {
   this.populate({
      path: "author",
      select: "name email profilePicture",
   });
});

export const Comment = mongoose.model("Comment", commentSchema);
