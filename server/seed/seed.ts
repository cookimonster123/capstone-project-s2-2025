import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Semester } from "../models/semester.model";
import { Category } from "../models/category.model";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { RegisteredStudent } from "../models/registeredStudent.model";
import { seedRegisteredStudents } from "./seedRegisteredStudents";
import { hashPassword } from "../services/authService";
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
   await Semester.deleteMany({});
   await Category.deleteMany({});
   await Project.deleteMany({});
   await User.deleteMany({});
   await RegisteredStudent.deleteMany({});

   // Insert semesters
   const semesters = await Semester.insertMany(data.semesters);
   console.log(`Inserted ${semesters.length} semesters`);

   // Insert categories
   const categories = await Category.insertMany(data.categories);
   console.log(`Inserted ${categories.length} categories`);

   // Insert projects (replace semester/category with ObjectIds)
   const projectsData = data.projects.map((project: any) => {
      // Find matching semester by year and semester
      const semesterDoc = semesters.find(
         (s) =>
            s.year === project.semester.year &&
            s.semester === project.semester.semester,
      );

      // Find matching category by name
      const categoryDoc = categories.find((c) => c.name === project.category);

      return {
         ...project,
         semester: semesterDoc?._id,
         category: categoryDoc?._id,
      };
   });

   const projects = await Project.insertMany(projectsData);
   console.log(`Inserted ${projects.length} projects`);

   // Insert users (replace project with ObjectId and hash passwords)
   const usersData = await Promise.all(
      data.users.map(async (user: any) => {
         const projectDoc = projects.find((p) => p.name === user.project);

         // Hash the password before storing
         const hashedPassword = await hashPassword(user.password);

         return {
            ...user,
            password: hashedPassword,
            project: projectDoc?._id,
         };
      }),
   );

   await User.insertMany(usersData);
   console.log(`Inserted ${usersData.length} users with hashed passwords`);

   // Seed registered students from CSV
   await seedRegisteredStudents();

   console.log("Seeding completed successfully!");
   mongoose.disconnect();
}

seed().catch((err) => {
   console.error("Seeding failed:", err);
   mongoose.disconnect();
});
