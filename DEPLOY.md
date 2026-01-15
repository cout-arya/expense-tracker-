# Deploying to Render

This application is configured for easy deployment on **Render** as a single Web Service (Monorepo support enabled via root `package.json`).

## Prerequisites

1.  A [Render](https://render.com) account.
2.  Your project pushed to GitHub.

## Deployment Steps

1.  **Create New Web Service**:
    *   Log in to Render dashboard.
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Service**:
    *   **Name**: `trubalance-app` (or your choice)
    *   **Region**: Choose closest to you.
    *   **Branch**: `main`
    *   **Root Directory**: Leave blank (default is root).
    *   **Runtime**: **Node**
    *   **Build Command**: `npm run build`
        *   *(This command installs dependencies for both server/client and builds the React app)*
    *   **Start Command**: `npm start`
        *   *(This starts the Express server)*

3.  **Environment Variables**:
    *   Scroll down to **Environment Variables**.
    *   Add the following keys (copy from your local `.env`):
        *   `MONGO_URI`: Connection string from MongoDB Atlas.
        *   `JWT_SECRET`: Your secret key for authentication.
        *   `NODE_ENV`: `production`

4.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for the build to complete.
    *   Your app will be live at `https://your-service-name.onrender.com`.

## How It Works

*   The root `package.json` coordinates the install and build process.
*   The `server` is configured to serve the built React frontend (`client/dist`) when in production.
*   API requests from the frontend automatically use relative paths (`/api/...`) to communicate with the backend on the same domain.
