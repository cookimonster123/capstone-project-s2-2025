import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/user.model";
import { Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req: Request, res: Response) => {
   const filePath = "../seed/data/ProjectGroups.csv";
   const field = "login_id";

   const { error } = validateUser(req.body);
   if (error) return res.status(400).json({ error: error.details[0].message });

   const { name, email, password } = req.body;
   try {
      let user = await User.findOne({ email });
      if (user)
         return res.status(400).json({ error: "User already registered" });

      user = new User({
         name,
         email,
         password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      let isCapstoneStudent = checkCapstoneStudent(
         filePath,
         field,
         user.email.split("@")[0]
      );
      if (await isCapstoneStudent) {
         user.role = "capstoneStudent";
      } else {
         user.role = "student";
      }
      await user.save();

      const payload = {
         user: {
            id: user._id,
            email: user.email,
            role: user.role,
         },
      };
      if (!process.env.JWT_SECRET) {
         throw new Error("JWT_SECRET is not defined");
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET || "", {
         expiresIn: "1h",
      });
      res.status(201).json({ token });
   } catch (err: any) {
      console.error(err.message);
      res.status(500).send("Server error");
   }
};

function validateUser(user: any) {
   const schema = Joi.object({
      name: Joi.string().min(1).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      profilePicture: Joi.string().allow(""), // remove allow('') later
      role: Joi.string()
         .valid("student", "admin", "staff", "capstoneStudent")
         .default("student"),
      links: Joi.array().items(
         Joi.object({
            type: Joi.string().valid("github", "linkedin", "personalWebsite"),
            value: Joi.string(),
         })
      ),
      project: Joi.string().allow(""),
   });

   return schema.validate(user);
}

// Ths function assumes the students upi's are stored in the CSV file under the login_id field
async function checkCapstoneStudent(
   filePath: string = "../seed/data/ProjectGroups.csv",
   field: string = "login_id",
   upi: string
): Promise<boolean> {
   return new Promise((resolve, reject) => {
      let resolved = false;

      const stream = fs.createReadStream(path.join(__dirname, filePath))
         .pipe(csv())
         .on("data", (row) => {
            if (!resolved && row[field] === upi) {
               resolved = true;
               resolve(true);
               stream.destroy();
            }
         })
         .on("end", () => {
            if (!resolved) {
               resolved = true;
               resolve(false);
            }
         })
         .on("error", (error) => {
            if (!resolved) {
               resolved = true;
               console.error("Error reading CSV file:", error);
               reject(error);
            }
         });
   });
}
