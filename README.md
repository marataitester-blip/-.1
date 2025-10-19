# Astral Hero Tarot

An interactive, bilingual web application for the 'Astral Hero' Tarot deck, featuring daily card readings, online spreads, a full card encyclopedia, and a Gemini AI-powered personality test.

## Concept

The "Astral Hero Tarot" is a unique digital divination tool that bridges the gap between ancient wisdom and modern technology. It's a reinterpretation of classic tarot archetypes, enhanced by the creative potential of AI. The project's core philosophy is to provide a beautiful, intuitive, and deeply personal tool for self-reflection and guidance on one's personal journey.

The deck itself is an expanded 80-card system, including the traditional 78 Arcana plus two unique additions: **The Hero**, representing the culmination of the journey, and the **White Card**, symbolizing unlimited potential and the user's power to shape their own narrative.

## Features

-   **Card of the Day**: A daily card is drawn to offer guidance and a focal point for reflection for the next 24 hours.
-   **Online Readings**: Perform virtual readings with multiple spreads, including a simple "Card of the Day," a classic "Three Cards" (Past, Present, Future) spread, and the unique "Hero's Path Step" spread for deeper insight.
-   **AI-Powered Spread Interpretation**: For multi-card spreads, Gemini provides a holistic interpretation of the cards' combined message, offering insights into general themes, relationships, finances, and health.
-   **Arcana Encyclopedia**: A complete, searchable gallery of all 80 cards. Users can explore the artwork, read detailed interpretations, and learn the symbolism of each card.
-   **"Who are you in Tarot?" Quiz**: A flagship feature powered by the Gemini API. Users describe their feelings or thoughts in text, and the AI:
    1.  Analyzes the text to determine the Tarot card that best represents the user's current state.
    2.  Generates a unique, insightful psychological portrait based on the analysis.
    3.  Creates a brand new, custom tarot card image using Imagen, inspired by the user's personal portrait.
-   **Audio Interpretations**: For accessibility and a more immersive experience, users can listen to AI-generated audio readings of card descriptions and interpretations.
-   **Bilingual Support**: The entire application is available in both English and Russian.

## Tech Stack

-   **Frontend**: React & TypeScript with a modern, no-build-step setup using import maps.
-   **Styling**: Tailwind CSS (via CDN for simplicity in this static setup).
-   **AI**: Google Gemini API (`@google/genai`) for:
    -   Text analysis and card matching (Quiz).
    -   Spread interpretations.
    -   Image generation (Imagen model).
    -   Text-to-speech synthesis.

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