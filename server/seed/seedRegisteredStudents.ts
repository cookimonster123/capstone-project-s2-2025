import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { bulkAddStudents } from "../services/registeredStudentService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StudentRow {
   login_id: string;
   name: string;
   [key: string]: any; // For any additional CSV columns
}

/**
 * Seeds the database with registered students from CSV file
 */
export async function seedRegisteredStudents(): Promise<void> {
   try {
      const csvPath = path.join(__dirname, "data/ProjectGroups.csv");

      if (!fs.existsSync(csvPath)) {
         console.log("CSV file not found, skipping student seeding");
         return;
      }

      console.log("Reading students from CSV...");
      const students = await readStudentsFromCSV(csvPath);

      if (students.length === 0) {
         console.log("No valid students found in CSV");
         return;
      }

      console.log(`Found ${students.length} students, adding to database...`);
      const result = await bulkAddStudents(students);

      if (result.success) {
         console.log(result.message);
         if (result.stats) {
            console.log("Stats:", result.stats);
         }
      } else {
         console.error("Failed to seed students:", result.message);
      }
   } catch (error) {
      console.error("Error seeding registered students:", error);
   }
}

/**
 * Reads student data from CSV file
 */
function readStudentsFromCSV(
   filePath: string,
): Promise<{ upi: string; name: string }[]> {
   return new Promise((resolve, reject) => {
      const students: { upi: string; name: string }[] = [];

      fs.createReadStream(filePath)
         .pipe(csv())
         .on("data", (row: StudentRow) => {
            // Extract UPI and name from CSV row
            const upi = row.login_id?.trim();
            const name = row.name?.trim();

            if (upi && name) {
               students.push({ upi, name });
            }
         })
         .on("end", () => {
            // Remove duplicates based on UPI
            const uniqueStudents = students.filter(
               (student, index, self) =>
                  index ===
                  self.findIndex(
                     (s) => s.upi.toLowerCase() === student.upi.toLowerCase(),
                  ),
            );

            resolve(uniqueStudents);
         })
         .on("error", (error) => {
            reject(error);
         });
   });
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
   // Connect to database
   const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/capstone";

   mongoose
      .connect(mongoUri)
      .then(() => {
         console.log("Connected to MongoDB");
         return seedRegisteredStudents();
      })
      .then(() => {
         console.log("Seeding completed");
         process.exit(0);
      })
      .catch((error) => {
         console.error("Seeding failed:", error);
         process.exit(1);
      });
}
