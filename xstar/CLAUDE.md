# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command            | Purpose                              |
| ------------------ | ------------------------------------ |
| `pnpm install`     | Install dependencies                 |
| `pnpm run dev`     | Run development server with Vite     |
| `pnpm run build`   | Build production bundle (tsc + vite) |
| `pnpm run lint`    | Run ESLint for code linting          |
| `pnpm run preview` | Preview production build locally     |

## High-Level Architecture

This is a React + TypeScript + Vite web application with Capacitor integration for mobile platforms (iOS directory exists).

### Core Dependencies:

- React 19 + TypeScript
- Vite 7 (build tool with React plugin)
- React Router 6 (client-side routing)
- Axios (HTTP client with interceptors)
- Capacitor 7 (mobile app wrapper)
- Sass (CSS preprocessor)

### Key Files:

- `src/main.tsx`: Application entry point with React root setup and BrowserRouter
- `src/App.tsx`: Main application component with Routes container
- `src/utils/axiosInstance.ts`: Configured Axios instance with auth interceptors
- `src/components/ProtectedRoute.tsx`: Route guard component for authenticated routes
- `src/index.scss`: Global styles (SCSS)
- `src/App.scss`: Component-specific styles (SCSS)
- `vite.config.ts`: Vite build configuration
- `tsconfig.app.json`: TypeScript configuration for app code
- `capacitor.config.ts`: Capacitor mobile build configuration (appId: com.miemie.tech)

### Directory Structure:

```
├── src/
│   ├── App.tsx              # Main app component with Routes
│   ├── main.tsx             # React entry point with BrowserRouter
│   ├── App.scss             # Component styles
│   ├── index.scss           # Global styles
│   ├── assets/              # Static assets (SVG icons, etc.)
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.tsx  # Auth route guard
│   └── utils/               # Utility functions
│       └── axiosInstance.ts    # Configured Axios with interceptors
├── ios/                     # Capacitor iOS project (generated)
├── public/                  # Static files served directly
├── dist/                    # Build output directory
└── package.json             # Dependencies and scripts
```

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with `@vitejs/plugin-react`
- **Routing**: React Router 6 (BrowserRouter)
- **HTTP Client**: Axios with request/response interceptors
- **Mobile Platform**: Capacitor 7.4.4 for iOS/Android
- **CSS**: SCSS (Sass 1.94.2)
- **Package Manager**: pnpm
- **Linter**: ESLint 9 with TypeScript support

## Authentication Architecture

The app uses token-based authentication with localStorage:

- **Token Storage**: JWT tokens stored in `localStorage` under the key `'token'`
- **Axios Interceptors**:
  - Request interceptor automatically adds `Bearer` token to all API requests
  - Response interceptor handles 401 errors by clearing token and redirecting to `/login`
- **Protected Routes**: Use `<ProtectedRoute element={<YourComponent />} />` to guard authenticated routes
- **API Base URL**: Configured via `VITE_API_BASE_URL` environment variable (defaults to `/api`)
- **Timeout**: API requests timeout after 10 seconds

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=https://your-api-url.com
```
