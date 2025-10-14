#!/bin/bash

# Exit immediately if any command fails
set -e

# List of files/directories to remove
items=(".git" ".github" ".husky" ".prettierrc")

for item in "${items[@]}"; do
  if [ -e "$item" ]; then
    echo "Removing $item..."
    rm -rf "$item"
  else
    echo "$item does not exist, skipping."
  fi
done

echo "Cleanup completed."
