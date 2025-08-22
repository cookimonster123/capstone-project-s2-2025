import Joi from 'joi';
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
   },
   teamname: {
      type: String,
      default: '',
      // might need to do a ref in the future
   },
   description: {
      type: String,
      default: '',
   },
   semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parameter',
      required: true,
   },
   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parameter',
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
                  'deployedWebsite'
               ],
            }
         }),
      }
   ]
});

export const Project = mongoose.model('Project', projectSchema);

export function validateProject(project: any) {
   const schema = Joi.object({
      name: Joi.string().min(1).max(100).required(),
      teamname: Joi.string().allow(''),
      description: Joi.string().allow(''),
      semester: Joi.string().required(),
      category: Joi.string().allow(''),
      links: Joi.array().items(
         Joi.object({
            type: Joi.string().valid(
               'github',
               'deployedWebsite'
            )
            .required(),
            value: Joi.string().uri().required(),
         })
      )
   });

   return schema.validate(project);
};
