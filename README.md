# Capstone Project S2 2025 Team 36

# Our website link: https://www.capstones.click/

## Developer Setup Guide

This guide will help you set up the project from scratch on a clean machine (macOS, Windows, or Linux). It covers installing all prerequisites, setting up the client and server, and running the application.

## Prerequisites

1. **Install [Node.js](https://nodejs.org/):**

- Download and install for your OS
- This will also install `npm`
- Check your version of npm and Node.js(Mac)

```sh
node -v
npm -v
```

2. **Install [Git](https://git-scm.com/):**

- Download and install for your OS.
- Used for version control and cloning the repository.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/uoa-compsci399-s2-2025/capstone-project-s2-2025-team-36
cd capstone-project-s2-2025-team-36
```

---

### 2. Install Dependencies

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd ../client
npm install
```

---

### 3. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier)

2. **Configure Database Access:**

3. **Configure Network Access:**
   - Go to Security → Network Access
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (Add: 0.0.0.0/0)

4. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user's password

### 4. Environment Variables

The server uses a `.env` file for environment variables.
Create a `.env` file in the `/server` directory and add the following variables:

| Name        | Description                       | Example Value                                                               |
| ----------- | --------------------------------- | --------------------------------------------------------------------------- |
| MONGODB_URI | MongoDB Atlas connection string   | mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/capstone-project |
| JWT_SECRET  | Secret key for JWT authentication | your-secret-key                                                             |

Edit the values as needed for your local setup.

### 5. Database Seeding

The project includes sample data to help you get started. To seed your database:

1. Ensure your MongoDB connection is configured in `.env`
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Run the seeding script:
   ```bash
   npm run seed
   ```

This will populate your database with initial data including:

- Parameters (semester, category)
- Sample projects
- User accounts

---

### 6. Running the Application

#### Start the Server

```bash
cd server
npm run dev
```

#### Start the Client

Open a new terminal window/tab:

```bash
cd client
npm run dev
```

### _OR_ Start the app from root

```bash
npm run dev
```

### 7. Accessing the App

- **Client:** [http://localhost:5173](http://localhost:5173)
- **Server:** [http://localhost:3000](http://localhost:3000)

## Common Commands

| Command                | Location      | Description                       |
| ---------------------- | ------------- | --------------------------------- |
| `npm install`          | client/server | Install dependencies              |
| `npm run dev`          | client/server | Start dev server                  |
| `npm run seed`         | server        | Seed database                     |
| `chmod -R +x ./Shells` | root          | Making all shell files executable |

## Project Structure

```
capstone-project-s2-2025-team-36/
├── client/   # Frontend (React + Vite)
├── server/   # Backend (Node.js + Express)
└── README.md # This file
```

## How to move the repo to your EC2 instance

Steps:

```bash
      # Download the repo to local
	   1. git clone github_repo_address
	   # copy folder into ec2
      # Ensure right your current location on terminal is same with the .pem file location
	   2. scp -i xxx.pem localPATH -r ubuntu@ec2PublicDNS:/home/ubuntu
	   # connect to ec2 and operate ec2 on terminal
	   3. ssh -i "xxx.pem" ubuntu@ec2PublicDNS
      # On terminal, go to the root of downloaded repo
      4. cd capstone-project-s2-2025-team-36/
      # Set cleanUp.sh file to executable
      5. chmod +x cleanUp.sh
      # Clean up all useless files
      6. ./cleanUp.sh
```

## How to run the shells for quick website deployment with domain name

Steps:

```bash
   0. Ensure you are on the EC2 terminal right now and current location is the root of our downloaded repo.
   1. In the root folder, enter command - chmod -R +x ./Shells
   2. Go to the Shells folder, enter command - cd Shells/
   3. Go to ./CaddyConfigShells folder to replace domain names with your domain names in CaddyfileWithDomainName.sh
   4. Go back to the Shells folder, enter command - cd ..
   5. Config deployment environment, enter command - ./DeploymentShells/DeployWithDomainName.sh
   6. Go to client folder to replace the VITE_GOOGLE_CLIENT_ID in .env file
   7. Go to server folder to replace the CLIENT_URL and GOOGLE_CLIENT_ID in .env file
   8. Go to the Shells folder on terminal, enter command - ./FinalDeploy.sh
```

## How to run the shells for quick website deployment without domain name

Steps:

```bash
   0. Ensure you are on the EC2 terminal right now and current location is the root of our downloaded repo.
   1. In the root folder, enter command - chmod -R +x ./Shells
   2. Go to the Shells folder, enter command - cd Shells/
   3. Config deployment environment, enter command - ./DeploymentShells/DeployWithoutDomainName.sh
   4. Go to client folder to replace the VITE_GOOGLE_CLIENT_ID in .env file
   5. Go to server folder to replace the CLIENT_URL and GOOGLE_CLIENT_ID in .env file
   6. Go to the Shells folder on terminal, enter command - ./FinalDeploy.sh
```

## How to quickly undeploy (close the website)

Steps:

```bash
   0. Ensure you are on the EC2 terminal right now and current location is the root of our downloaded repo.
   1. In the root folder, enter command - chmod -R +x ./Shells
   2. Go to the Shells folder, enter command - cd Shells/
   3. Undeploy the website, enter command - ./Undeploy.sh
```

## How to connect to database on EC2

Steps:

```bash
   0. Ensure you are on the EC2 terminal right now and current location is the root of our downloaded repo.
   # Check if your website is running
   1. docker ps
   # Connect to DB through mongo Compass tool on your local computer
   2. ssh -i xxx.pem -L 27017:localhost:27017 ubuntu@ec2PublicDNS
   # Add url on Compass to connect to database
   3. Add mongodb://localhost:27017 as url on your mongo Compass tool
   # Disconnect the connection with EC2 DB on your local computer
   4. ctrl+D and ctrl+C
```

Follow the steps above for deployment, running and testing. xxx.pem is the .pem type file, which will be downloaded when you create the EC2 instance on AWS
