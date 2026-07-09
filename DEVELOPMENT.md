# Development Guide

This document provides instructions on how to set up, run, and develop the Cardtalogue frontend project.

## Local Setup

### Prerequisites
- **Node.js**: v18.x or later
- **pnpm**: This project uses `pnpm` as the package manager.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file in the root directory.
   - Add your backend API base URL:
     ```env
     VITE_API_BASE_URL=http://localhost:3000
     ```

### Running the Project
- **Development Server**:
  ```bash
  pnpm dev
  ```
  The app will be available at `http://localhost:5173`.

- **Build for Production**:
  ```bash
  pnpm build
  ```

- **Preview Production Build**:
  ```bash
  pnpm preview
  ```

## Linting & Formatting
The project uses ESLint and Prettier for code quality.
- **Check for linting errors**:
  ```bash
  pnpm lint
  ```
- **Fix linting errors**:
  ```bash
  pnpm lint --fix
  ```

## Testing Strategy
- **Unit Tests**: Use Vitest for testing individual components and hooks.
- **E2E Tests**: Use Playwright (if configured) for critical user flows.

## Troubleshooting
- **Dependency Issues**: If you encounter issues with `node_modules`, delete the folder and run `pnpm install` again.
- **Port Conflicts**: If `5173` is occupied, Vite will automatically try another port, or you can specify one via `--port`.
- **API Errors**: Check the browser console and the network tab to ensure `VITE_API_BASE_URL` is correctly configured and the backend service is running.
