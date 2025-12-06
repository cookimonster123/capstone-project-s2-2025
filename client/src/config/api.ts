const BASE_API_URL =
   import.meta.env.VITE_API_BASE_URL ||
   (import.meta.env.DEV ? "http://localhost:3000/api" : "");

export { BASE_API_URL };
