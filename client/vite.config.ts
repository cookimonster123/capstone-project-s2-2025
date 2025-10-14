import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@types": path.resolve(__dirname, "./src/types"),
      },
   },
});

//If you deploy on EC2 with docker and use domain name, use the following config instead
/*
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@types": path.resolve(__dirname, "./src/types"),
      },
   },
   server: {
      allowedHosts: ['www.capstones.click', 'capstones.click']
   },
   proxy: {
      '/api': {
        target: 'http://server:3000',
        changeOrigin: true,
        secure: false,
      },
    },
});
*/

///////splitter///////

//If you deploy on EC2 with docker but without domain name, use the following config instead
//Remember to change copy and paste the content from CaddyfileWithoutDomainName to replace the content in Caddyfile
/*
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@types": path.resolve(__dirname, "./src/types"),
      },
   },
   proxy: {
      '/api': {
        target: 'http://server:3000',
        changeOrigin: true,
        secure: false,
      },
    },
});
*/
