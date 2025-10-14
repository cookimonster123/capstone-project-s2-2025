#!/bin/bash
# Go back to project root
cd ../
echo "Stopping all containers..."
docker compose down

echo "Removing all images (optional, may remove pulled images)..."
docker image prune -af

echo "Removing all unused volumes..."
docker volume prune -f

echo "Removing all build cache..."
docker builder prune -af

echo "Cleanup completed."
