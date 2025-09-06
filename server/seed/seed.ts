import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Semester } from "../models/semester.model";
import { Category } from "../models/category.model";
import { Project } from "../models/project.model";
import { User } from "../models/user.model";
import { Team } from "../models/team.model";
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
   await Team.deleteMany({});
   await Project.deleteMany({});
   await User.deleteMany({});
   await RegisteredStudent.deleteMany({});

   // Insert semesters
   const semesters = await Semester.insertMany(data.semesters);
   console.log(`Inserted ${semesters.length} semesters`);

   // Insert categories
   const categories = await Category.insertMany(data.categories);
   console.log(`Inserted ${categories.length} categories`);

   // Insert teams first (without project references)
   const teamsData = data.teams.map((team: any) => ({
      name: team.name,
      members: [], // Will be updated after users are created
   }));

   const teams = await Team.insertMany(teamsData);
   console.log(`Inserted ${teams.length} teams`);

   // Insert projects (replace semester/category/team with ObjectIds)
   const projectsData = data.projects.map((project: any) => {
      // Find matching semester by year and semester
      const semesterDoc = semesters.find(
         (s) =>
            s.year === project.semester.year &&
            s.semester === project.semester.semester,
      );

      // Find matching category by name
      const categoryDoc = categories.find((c) => c.name === project.category);

      // Find matching team by name
      const teamDoc = teams.find((t) => t.name === project.teamName);

      return {
         name: project.name,
         description: project.description,
         semester: semesterDoc?._id,
         category: categoryDoc?._id,
         team: teamDoc?._id,
         links: project.links,
      };
   });

   const projects = await Project.insertMany(projectsData);
   console.log(`Inserted ${projects.length} projects`);

   // Update teams with project references
   for (const team of teams) {
      const project = projects.find(
         (p) => p.team?.toString() === team._id.toString(),
      );
      if (project) {
         await Team.findByIdAndUpdate(team._id, { project: project._id });
      }
   }

   // Insert users (replace team/project with ObjectIds and hash passwords)
   const usersData = await Promise.all(
      data.users.map(async (user: any) => {
         // Hash the password before storing
         const hashedPassword = await hashPassword(user.password);

         let teamDoc: any = null;
         let projectDoc: any = null;

         if (user.teamName) {
            teamDoc = teams.find((t) => t.name === user.teamName);
            if (teamDoc) {
               // Find the project associated with this team
               projectDoc = projects.find(
                  (p) => p.team?.toString() === teamDoc._id.toString(),
               );
            }
         }

         return {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            profilePicture: user.profilePicture,
            role: user.role,
            links: user.links,
            team: teamDoc?._id,
            project: projectDoc?._id,
         };
      }),
   );

   const users = await User.insertMany(usersData);
   console.log(`Inserted ${users.length} users with hashed passwords`);

   // Update teams with member references
   for (const user of users) {
      if (user.team) {
         await Team.findByIdAndUpdate(user.team, {
            $push: { members: user._id },
         });
      }
   }

   // Seed registered students from CSV
   await seedRegisteredStudents();

   console.log("Seeding completed successfully!");
   mongoose.disconnect();
}

seed().catch((err) => {
   console.error("Seeding failed:", err);
   mongoose.disconnect();
});
