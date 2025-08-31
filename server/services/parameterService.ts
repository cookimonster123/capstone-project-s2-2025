import Joi from "joi";
import { Parameter } from "../models/parameter.model";
import {
   ServiceResult,
   ValidationResult,
   ParameterData,
   CreateParameterData,
} from "../interfaces";

/**
 * Validates parameter data
 * @param parameterData - The parameter data to validate
 * @returns Validation result
 */
export function validateParameterData(
   parameterData: ParameterData,
): ValidationResult<ParameterData> {
   const schema = Joi.object({
      parameterType: Joi.string().valid("semester", "category").required(),
   });

   return schema.validate(parameterData);
}

/**
 * Creates a new parameter
 * @param parameterData - Parameter data to create
 * @returns Promise<ServiceResult> creation result
 * @throws Error for unexpected server errors
 */
export async function createParameter(
   parameterData: ParameterData,
): Promise<ServiceResult> {
   try {
      // Validate input data
      const { error } = validateParameterData(parameterData);
      if (error) {
         return {
            success: false,
            error: error.details[0].message,
         };
      }

      // Create new parameter
      const parameter = new Parameter(parameterData);
      await parameter.save();

      return {
         success: true,
         data: parameter,
      };
   } catch (error) {
      console.error("Error in createParameter service:", error);
      throw error;
   }
}

/**
 * Gets all parameters by type
 * @param parameterType - Type of parameters to retrieve
 * @returns Promise<ServiceResult> parameters result
 * @throws Error for unexpected server errors
 */
export async function getParametersByType(
   parameterType: "semester" | "category",
): Promise<ServiceResult> {
   try {
      const parameters = await Parameter.find({ parameterType });

      return {
         success: true,
         data: parameters,
      };
   } catch (error) {
      console.error("Error in getParametersByType service:", error);
      throw error;
   }
}

/**
 * Gets all parameters
 * @returns Promise<ServiceResult> all parameters result
 * @throws Error for unexpected server errors
 */
export async function getAllParameters(): Promise<ServiceResult> {
   try {
      const parameters = await Parameter.find();

      return {
         success: true,
         data: parameters,
      };
   } catch (error) {
      console.error("Error in getAllParameters service:", error);
      throw error;
   }
}
