# Fullstack MERN Template

This project is a simple MERN (MongoDB, Express, React, Node.js) stack template.
It includes a backend API for managing notes and a React frontend to interact with the API.

## Project Structure

```
fullstack-template/
├── client/         # React frontend application
│   ├── public/
│   ├── src/
│   └── package.json
├── models/         # Mongoose models for the backend
│   └── Note.js
├── routes/         # API routes for the backend
│   └── notes.js
├── .gitignore      # Git ignore file for the backend
├── package.json    # Backend Node.js dependencies
├── server.js       # Backend Express server
└── README.md       # This file
```

## Prerequisites

- Node.js (v14 or later recommended)
- npm (usually comes with Node.js)
- MongoDB (either a local instance or a cloud-hosted solution like MongoDB Atlas)

## Setup and Installation

1.  **Clone the repository (or download the template):**
    ```bash
    git clone <repository-url>
    cd fullstack-template
    ```

2.  **Install Backend Dependencies:**
    Navigate to the root of the `fullstack-template` directory and run:
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    Navigate to the `client` directory and run:
    ```bash
    cd client
    npm install
    cd ..
    ```

4.  **Configure MongoDB Connection:**
    Open `server.js` in the root directory.
    Locate the `mongoose.connect` line:
    ```javascript
    mongoose.connect('mongodb://localhost:27017/mydatabase', { ... });
    ```
    Replace `'mongodb://localhost:27017/mydatabase'` with your actual MongoDB connection string. If you're using a local MongoDB instance, this might be correct, but ensure the database name `mydatabase` is what you want.

## Running the Application

You'll need two terminals open to run both the backend and frontend servers simultaneously.

1.  **Run the Backend Server:**
    Navigate to the root of the `fullstack-template` directory and run:
    ```bash
    npm start
    ```
    (Note: You might want to add a `start` script to your backend `package.json`, e.g., `"start": "node server.js"`. If not, use `node server.js` directly.)
    The backend server will typically start on `http://localhost:3000`.

2.  **Run the Frontend Development Server:**
    Navigate to the `client` directory:
    ```bash
    cd client
    npm start
    ```
    The React development server will typically start on `http://localhost:3001` (or another port if 3000 is taken and not proxied correctly, but CRA usually handles this by opening on a new port like 3001, and the proxy setting in `client/package.json` will ensure API requests to `/api/*` go to the backend at `http://localhost:3000`).

    Your default web browser should open automatically to the React app.

## API Endpoints

-   `GET /api/notes`: Fetches all notes.
-   `POST /api/notes`: Creates a new note. Expects a JSON body with `title` and `content`.

---

This README provides a basic guide to get the template up and running.
Remember to replace placeholder values (like the MongoDB connection string) with your actual configuration.
