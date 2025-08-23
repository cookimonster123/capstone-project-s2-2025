# Capstone Project S2 2025 Team 36

## Developer Setup Guide

This guide will help you set up the project from scratch on a clean machine (macOS, Windows, or Linux). It covers installing all prerequisites, setting up the client and server, and running the application.

## Prerequisites

1.  **Install [Node.js](https://nodejs.org/):**

- Download and install for your OS
- This will also install `npm`
- Check your version of npm and Node.js(Mac)

```sh
node -v
npm -v
```

2.  **Install [Git](https://git-scm.com/):**

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

| Command        | Location      | Description          |
| -------------- | ------------- | -------------------- |
| `npm install`  | client/server | Install dependencies |
| `npm run dev`  | client/server | Start dev server     |
| `npm run seed` | server        | Seed database        |

## Project Structure

```
capstone-project-s2-2025-team-36/
├── client/   # Frontend (React + Vite)
├── server/   # Backend (Node.js + Express)
└── README.md # This file
```
