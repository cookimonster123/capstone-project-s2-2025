import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Parameter } from "../models/parameter.model";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { RegisteredStudent } from "../models/registeredStudent.model";
import { seedRegisteredStudents } from "./seedRegisteredStudents";
import dotenv from "dotenv";
dotenv.config();
const __dirname = path.resolve();

async function seed() {
   await mongoose.connect(process.env.MONGODB_URI || "");

   const data = JSON.parse(
      fs.readFileSync(
         path.join(__dirname, "seed", "data", "seedData.json"),
         "utf-8",
      ),
   );

   // Clear collections
   await Parameter.deleteMany({});
   await Project.deleteMany({});
   await User.deleteMany({});
   await RegisteredStudent.deleteMany({});

   // Insert parameters
   const parameters = await Parameter.insertMany(data.parameters);

   // Insert projects (replace semester/category with ObjectIds)
   const semesterParam = parameters.find((p) => p.parameterType === "semester");
   const categoryParam = parameters.find((p) => p.parameterType === "category");

   const projectsData = data.projects.map((project: any) => ({
      ...project,
      semester: semesterParam?._id,
      category: categoryParam?._id,
   }));

   const projects = await Project.insertMany(projectsData);

   // Insert users (replace project with ObjectId)
   const usersData = data.users.map((user: any) => ({
      ...user,
      project: projects[0]?._id,
   }));

   await User.insertMany(usersData);

   // Seed registered students from CSV
   await seedRegisteredStudents();

   console.log("Seeding done!");
   mongoose.disconnect();
}

seed().catch((err) => {
   console.error(err);
   mongoose.disconnect();
});
