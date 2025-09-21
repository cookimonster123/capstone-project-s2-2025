/**
 * Base interface for all service operation results
 * @template T - Type of the data returned on success
 */
export interface ServiceResult<T = any> {
   success: boolean;
   data?: T;
   error?: string;
   message?: string;
}

/**
 * Base interface for validation results
 * @template T - Type of the validated data
 */
export interface ValidationResult<T = any> {
   error?: any;
   value?: T;
}
