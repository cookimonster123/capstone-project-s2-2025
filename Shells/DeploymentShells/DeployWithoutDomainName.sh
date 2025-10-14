#!/bin/bash

# Exit immediately if any command fails
set -e

# Go to the directory where this script is located
cd "$(dirname "$0")"

echo "Running Vite config deployment script..."
# Run the Vite config shell script
bash ../ViteConfigShells/DeployWithoutDomainNameViteConfig.sh

echo "Vite config deployment completed."

# Run the Caddyfile config
bash ../CaddyConfigShells/CaddyfileWithoutDomainName.sh

echo "Caddyfile config deployment completed."

# Run the environment variables config
bash ../envConfigShells/clientenv.sh
bash ../envConfigShells/serverenv.sh

echo "client and server folders Environment variables config deployment completed."
echo "Please go to server folder replace the CLIENT_URL in .env file with your EC2 public IPv4 address"
