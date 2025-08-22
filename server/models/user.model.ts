import Joi from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
   },
   profilePicture: {
      type: String,
      default: '', // TODO: Add default pfp (aws)
   },
   role: {
      type: String,
      enum: ['student', 'admin', 'staff'],
      default: 'student',
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
               enum: [
                  'github',
                  'linkedin',
                  'personalWebsite'
               ],
            }
         }),
      }
   ],
   project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
   }
});

// TODO: jwt token

export const User = mongoose.model('User', userSchema);

export function validateUser(user: any) {
   const schema = Joi.object({
      name: Joi.string().min(1).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      profilePicture: Joi.string().allow(''), // remove allow('') later
      role: Joi.string().valid('student', 'admin', 'staff').default('student'),
      links: Joi.array().items(
         Joi.object({
            type: Joi.string().valid(
               'github',
               'linkedin',
               'personalWebsite'
            ),
            value: Joi.string(),
         })
      ),
      project: Joi.string().allow('')
   });

   return schema.validate(user);
}