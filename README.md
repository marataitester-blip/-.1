# Astral Hero Tarot

An interactive, bilingual web application for the 'Astral Hero' Tarot deck, featuring daily card readings, online spreads, a full card encyclopedia, and a Gemini AI-powered personality test.

## Tech Stack

-   React & TypeScript
-   Tailwind CSS
-   Google Gemini API (`@google/genai`)

## Deployment on Vercel

This project is a static web application and can be deployed easily on Vercel.

1.  **Connect Your Git Repository:**
    -   Push the project files to a new GitHub, GitLab, or Bitbucket repository.
    -   In your Vercel dashboard, click "Add New... > Project" and import your repository.

2.  **Configure the Project:**
    -   For "Framework Preset", select **"Other"**.
    -   Leave the "Build Command" and other build settings empty, as there is no build step.

3.  **Set Environment Variables (Required):**
    -   In your Vercel project's "Settings" tab, go to "Environment Variables".
    -   Add a new variable:
        -   **Name:** `API_KEY`
        -   **Value:** Your Google Gemini API key.
    -   The application will not function without this key.

4.  **Deploy:**
    -   Click the "Deploy" button. Your application will be live shortly.
