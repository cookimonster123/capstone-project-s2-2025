export interface FormData {
   email: string;
   password: string;
}

export interface RegisterFormData extends FormData {
   name: string;
}

export interface LoginFormData extends FormData {}

export interface FormFieldErrors {
   email?: string;
   password?: string;
   name?: string;
   form?: string;
}
