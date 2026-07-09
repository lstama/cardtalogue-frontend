# Coding Standards

This document defines the coding standards for the Cardtalogue frontend. All new code and refactored code should adhere to these guidelines to ensure consistency across the codebase, especially when integrating snippets from different sources.

## General Principles
- **Readability First**: Write code that is easy for humans to read.
- **Consistency**: Use the same patterns for similar tasks.
- **Type Safety**: Leverage TypeScript to the fullest to catch errors at compile time.
- **Modularization**: Keep components and functions small and focused on a single responsibility.

## TypeScript Guidelines
- **No `any`**: Avoid using the `any` type. Use `unknown` if the type is truly unknown, or define proper interfaces.
- **Interfaces over Types**: Prefer `interface` for defining the shape of objects and `type` for unions, intersections, and primitive aliases.
- **Explicit Return Types**: For exported functions, always provide an explicit return type.
- **Naming Types**:
    - Use `I` prefix for interfaces (e.g., `IUser`) - *Optional, but consistent with many LLM outputs*.
    - Use `Type` suffix for complex types (e.g., `UserRole`).

## React Component Standards
- **Functional Components**: Use functional components with arrow functions.
- **Props Validation**: Every component should have a clearly defined `Props` interface.
- **Component Structure**:
    - Keep UI logic (styles, minor state) in the component.
    - Move complex business logic, API calls, or heavy state transformations into **Custom Hooks**.
- **Destructuring**: Destructure props in the function signature.
    - *Good*: `const Button = ({ label, onClick }: ButtonProps) => { ... }`
    - *Bad*: `const Button = (props: ButtonProps) => { const { label } = props; ... }`
- **Early Returns**: Use early returns to handle errors or "loading" states to reduce nesting.

## Styling (Tailwind CSS)
- **Utility-First**: Use Tailwind utility classes exclusively. Avoid using `style={{...}}` unless absolutely necessary for dynamic calculations.
- **Component Extraction**: If a set of Tailwind classes is reused more than 3 times, consider creating a reusable UI component in `src/components/ui`.
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) consistently.

## Naming Conventions
- **Components**: PascalCase (e.g., `GameCard.tsx`).
- **Hooks**: `use` prefix, camelCase (e.g., `useGames.ts`).
- **Utilities/Services**: camelCase (e.g., `apiService.ts`).
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`).
- **Files**: Match the name of the primary export (e.g., `AuthContext.tsx` exports `AuthContext`).

## Error Handling & Logging
- **Boundary Handling**: Use Error Boundaries for UI-level crashes.
- **Try/Catch Blocks**: Use try/catch for all asynchronous operations (API calls).
- **User Feedback**: Always provide visual feedback (e.g., `ErrorMessage` component, `LoadingSpinner`) for async actions.

## Refactoring Priority
When integrating code from multiple LLMs:
1. Unify the **Styling** (Tailwind).
2. Unify the **Data Fetching** (Services + Hooks).
3. Unify the **Type Definitions** (shared `types` folder).
