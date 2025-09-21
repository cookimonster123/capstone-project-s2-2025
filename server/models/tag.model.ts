import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      minlength: 1,
      maxLength: 50,
   },
   projects: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Project",
      },
   ],
   mentions: {
      type: Number,
      required: true,
   },
});

export const Tag = mongoose.model("Tag", tagSchema);
