# Assistant

This document provides an overview and detailed documentation for the Chat Application implemented in React with support for Google Generative AI.

## Overview

The Chat Application enables users to interact with a generative AI model in a chat-like interface. Users can:
- Start new chat sessions.
- Continue existing chat sessions.
- View previous chat history.

The application leverages the `@google/generative-ai` library for AI interactions, `motion/react` for animations, and `useState`/`useEffect` hooks for state and lifecycle management.

---

## Application Components

### 1. **State Management**
- **`inputText`**: Stores the current input text from the user.
- **`loading`**: Boolean flag to indicate if the AI response is loading.
- **`history`**: Stores the AI-generated responses for the active chat.
- **`clientHistory`**: Represents the chat history shown in the UI.
- **`previousChats`**: Array of objects storing past chat histories and their titles.
- **`onExistingChat`**: Boolean to indicate if the user is interacting with a previous chat.

### 2. **Key Functionalities**

#### `fetchAIResponse`
Handles sending a user message to the AI model and updating the chat history.
- Triggers on form submission.
- Updates `clientHistory` with the user's message.
- Uses the Google Generative AI library to fetch AI responses.

#### `createChat`
Creates a new chat session or switches out of an existing one.
- Clears current chat histories.
- Updates the `previousChats` array with a new chat object.
- Asynchronously generates a title for the new chat.

#### `createTitle`
Generates a title for a given chat history by sending a prompt to the AI model.

#### `loadChat`
Loads an existing chat session into the application.
- Updates `clientHistory` and `history` with the selected chat's data.

#### Animation Utilities
- Utilizes `motion` animations for smooth UI transitions.
- `blurDecorator` adds decorative blur effects with animations.

---

## How It Works

1. **Starting a Chat**
   - Click "New Chat".
   - Enter a message in the input box and submit.
   - The AI processes the input and appends its response to the chat.

2. **Viewing Previous Chats**
   - Select a chat from the sidebar to view or continue a previous session.

3. **Ending a Chat**
   - Use the "New Chat" button to reset the interface.
---
## Dependencies
- **React**: Used for building the UI components.
- **@google/generative-ai**: Integration for AI-generated responses.
- **motion/react**: For animations in the UI.

---

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file with the following:
   ```env
   VITE_GOOGLE_API_KEY=<your-google-api-key>
   ```
   - Go to [Google AI Studio](https://aistudio.google.com/apikey) and get your free API key using your Google account

4. **Run the Application**
   ```bash
   npm run dev
   ```

---

This concludes the documentation for the Chat Application. For additional questions, refer to the code comments or reach out to the development team.

