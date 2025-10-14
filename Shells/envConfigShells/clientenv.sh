#!/bin/bash

# File to create
DIR="../../client"
FILE="$DIR/.env"

# Content to write
cat > "$FILE" << 'EOF'
VITE_API_BASE_URL=/api
EOF

echo "File '$FILE' has been created with the provided content."
