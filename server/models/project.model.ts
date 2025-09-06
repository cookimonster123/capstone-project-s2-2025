import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
   },
   team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
   },
   description: {
      type: String,
      default: "",
   },
   semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
   },
   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
   },
   links: [
      {
         type: new mongoose.Schema({
            value: {
               type: String,
            },
            type: {
               type: String,
               enum: ["github", "deployedWebsite"],
            },
         }),
      },
   ],
});

export const Project = mongoose.model("Project", projectSchema);
