#!/bin/bash

# File to create
DIR="../../server"
FILE="$DIR/.env"

# Content to write
cat > "$FILE" << 'EOF'
# Default MONGODB_URI here is for deployment with Docker and Docker Compose
# For Deployment with Docker, use the following line instead:
MONGODB_URI=mongodb://mongo:27017/mydatabase

# Local testing and development
# Comment the above MONGODB_URI line when using this for local testing
# Uncomment the following line and provide your MongoDB connection string
#MONGODB_URI=Your_MongoDB_Connection_String_Here

JWT_SECRET=test_jwt_secret_key_for_testing_purposes_only
NODE_ENV=development

# Replace "5173" below with your EC2 IPv4 below when deploying e.g., http://123.456.789.012 (default port: 80)
#CLIENT_URL=http://EC2_PUBLIC_IPV4 # For deployment
CLIENT_URL=5173 # Local testing
PORT=3000

# AWS S3 Configuration - replace with your actual credentials and bucket name
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=showcaseweb

#AWS Credentials - Uncomment and set these if not using IAM roles
#AWS_ACCESS_KEY_ID= 
#AWS_SECRET_ACCESS_KEY= 
#AWS_SESSION_TOKEN= 
EOF

echo "File '$FILE' has been created with the provided content."
