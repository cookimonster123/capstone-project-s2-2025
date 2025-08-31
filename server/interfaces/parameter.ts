/**
 * Interface for parameter data
 */
export interface ParameterData {
   parameterType: "semester" | "category";
   value?: string;
   displayName?: string;
}

/**
 * Interface for parameter creation data
 */
export interface CreateParameterData extends ParameterData {
   // Additional fields specific to parameter creation can go here
}
