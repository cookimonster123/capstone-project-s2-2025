#!/bin/bash

# File to create
DIR="../../client"
FILE="$DIR/vite.config.ts"

# Content to write
cat > "$FILE" << 'EOF'
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
EOF

echo "File '$FILE' has been created with the provided content."
