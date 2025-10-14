#!/bin/bash
# Go back to project root
cd ../
echo "Starting Docker Compose services..."
docker compose up -d

echo "Deployment completed successfully."