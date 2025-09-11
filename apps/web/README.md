# Guide AI Frontend

An application for video-guided question answering system with RAG capabilities and reasoning outputs

## Features

- **Authentication System**
  - Login with email/password
  - User registration 
  - Password reset functionality

- **Video Analysis Interface**
  - Upload video files directly
  - Input video URLs (YouTube, Vimeo, etc.)
  - ChatGPT-like conversation interface
  - Real-time processing feedback

- **Response Display**
  - Tabbed interface with multiple views:
    - Main response
    - Analysis reasoning
    - Key video frames with timestamps
    - Interactive timestamp segments

## Getting Started

### Prerequisites

Make sure you have the conda environment activated:
```bash
conda activate guide-ai
```

### Installation

Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   └── Chat/
│       ├── ChatInterface.tsx
│       ├── MessageList.tsx
│       ├── VideoInput.tsx
│       └── ResponseTabs.tsx
├── App.tsx
├── main.tsx
└── index.css
```

## Tech Stack

- React 19.1.1
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- React Hook Form
- Lucide React Icons

## Note

The frontend is currently not connected to the backend API. All interactions are simulated with mock data for demonstration purposes.