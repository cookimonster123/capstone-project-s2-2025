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

### 3. Environment Variables

The server uses a `.env` file for environment variables.
Create a `.env` file in the `/server` directory and add the following variables:

| Name       | Description                       |
| ---------- | --------------------------------- |
| MONGO_URI  | MongoDB connection string         |
| JWT_SECRET | Secret key for JWT authentication |

Edit the values as needed for your local setup.

---

### 4. Running the Application

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

### 5. Accessing the App

- **Client:** [http://localhost:5173](http://localhost:5173)
- **Server:** [http://localhost:3000](http://localhost:3000)

## Common Commands

| Command         | Location      | Description           |
| --------------- | ------------- | --------------------- |
| `npm install`   | client/server | Install dependencies  |
| `npm run dev`   | client/server | Start dev server      |
| `npm run seed`  | server        | Seed database         |

## Project Structure

```
capstone-project-s2-2025-team-36/
├── client/   # Frontend (React + Vite)
├── server/   # Backend (Node.js + Express)
└── README.md # This file
```
