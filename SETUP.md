# Finlit Academy - Setup Guide

This guide will help you set up the Finlit Academy application on a new PC.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
2.  **PostgreSQL** (v12 or higher) - [Download PostgreSQL](https://www.postgresql.org/download/)

## Project Structure

The project is divided into two main folders:
- `backend`: Node.js/Express API
- `frontend`: React application

## Step 1: Database Setup

1.  Open **pgAdmin** or your preferred SQL tool (or use the command line).
2.  Create a new database named `finlit` (or any name you prefer).
3.  You will need your PostgreSQL **username** (usually `postgres`) and **password**.

## Step 2: Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    - Create a new file named `.env` in the `backend` directory.
    - Add the following content, replacing the values with your database credentials:

    ```env
    DB_USER=postgres
    DB_HOST=localhost
    DB_DATABASE=finlit
    DB_PASSWORD=your_password_here
    DB_PORT=5432
    JWT_SECRET=your_secret_key_here
    PORT=5000
    ```

4.  **Run Database Migrations:**
    The project has evolved, so you need to run a few scripts to set up the database schema completely.

    *Note: Since there is no single `schema.sql` file visible in the root, the initial tables are likely created in the code or were set up manually. However, based on the migration scripts present, ensure you run them in order if they contain table creation logic.*

    Run the following commands to apply updates:
    ```bash
    node migrate_db.js
    node migrate_meetings_status.js
    ```
    *(If `migrate_db.js` assumes tables exist, you might need to ensure the base schema is created first. Check `server.js` or previous documentation if available. If starting fresh, you might need to extract the `CREATE TABLE` statements from the code or a schema dump.)*

    **Important:** If you are setting this up from scratch and don't have the base tables (`users`, `classes`, `enrollments`, `modules`, `materials`, `quizzes`, `assignments`, `assignment_submissions`, `submission_files`, `meetings`, `parent_child`), you will need to create them. 
    
    *Recommended: Check `server.js` for table structures or ask the developer for a `schema.sql` dump.*

5.  **Start the Backend Server:**
    ```bash
    node server.js
    ```
    The server should start on port 5000.

## Step 3: Frontend Setup

1.  Open a new terminal window.
2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

4.  **Start the Frontend Application:**
    ```bash
    npm run dev
    ```
    The application should start (usually on `http://localhost:5173`).

## Step 4: Accessing the Application

Open your browser and go to `http://localhost:5173`. You can now register a new account or log in.

## Troubleshooting

- **Database Connection Error:** Check your `.env` file in the `backend` folder and ensure the credentials match your PostgreSQL setup.
- **Port Conflicts:** If port 5000 or 5173 is in use, you may need to kill the existing process or change the port in `.env` (for backend) or `vite.config.js` (for frontend).
- **Missing Tables:** If you get errors about missing tables, ensure you have the full database schema applied.
