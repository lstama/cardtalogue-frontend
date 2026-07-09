# Project Architecture - Cardtalogue Frontend

## Overview
Cardtalogue is a web application designed to manage collections of trading cards (Kards), packs, games, and storage locations. It serves as a comprehensive inventory and organization tool for card collectors.

## Tech Stack
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API (Auth, Cart, Theme)
- **API Layer**: Fetch/Axios via centralized services

## Directory Structure & Responsibilities

- `src/assets`: Static assets like images, icons, and global styles.
- `src/components`:
    - `ui`: Atomic, reusable UI components (Buttons, Inputs, Loaders, Cards). These should be stateless and highly reusable.
    - `layout`: Structural components that wrap the application (Navbar, Layout, ProtectedRoutes).
    - `items`: Domain-specific components related to the card items (GameCard, PackCard, etc.).
- `src/config`: Configuration constants, environment-specific variables, and API base configurations.
- `src/contexts`: Global state providers (Authentication, Cart management, Theme switching).
- `src/hooks`: Custom React hooks for reusable stateful logic (e.g., `useGames`, `useKards`).
- `src/pages`: Top-level page components representing unique routes in the application.
- `src/services`: API service layer. All external data fetching logic should reside here to keep components clean.
- `src/types`: Global TypeScript interfaces and type definitions.

## Architectural Principles

### 1. Component Pattern
- **Presentation vs. Logic**: Keep UI components (in `ui/`) as pure as possible. Move complex logic into custom hooks in `src/hooks`.
- **Feature Folders**: When a feature becomes complex, consider grouping its specific components, hooks, and types together, rather than keeping them strictly separated by type across the project.

### 2. Data Fetching
- All API calls must go through `src/services`. 
- Components should not call `fetch` or `axios` directly.
- Use `src/hooks` to manage the loading, error, and data states of these service calls.

### 3. State Management
- Use **Context API** for truly global state (Auth, Theme).
- Use **Local State** (`useState`) for component-level UI state.
- Use **Custom Hooks** to encapsulate logic that involves multiple state updates or complex calculations.

### 4. Styling
- Use **Tailwind CSS** exclusively for styling.
- Avoid inline styles unless dynamically calculated values are strictly necessary.
- Prefer utility classes over complex nested selectors.

## Development Workflow
- Use `pnpm` for package management.
- Follow the `src/pages` structure for routing.
- Ensure all new components in `src/components/ui` are accessible and responsive.
