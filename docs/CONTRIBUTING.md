# Contributing to Zenith Launcher

We welcome contributions! Please follow these guidelines to maintain code quality.

## Code Style

### Frontend (React/TypeScript)
-   **Components**: Use Functional Components with Hooks.
-   **Naming**: PascalCase for components (`MyComponent.tsx`), camelCase for functions/variables (`myFunction`).
-   **Structure**:
    -   Place components in `src/modules/views/<ViewName>` if they are specific to a view.
    -   Place reusable components in `src/ui`.
    -   Use `index.ts` barrel files for clean exports.
-   **Styling**: Use Tailwind CSS utility classes. Avoid inline styles.
-   **State**: Use `useLauncher` (Zustand) for global state, `useState` for local UI state.

### Backend (Python)
-   **Style**: Follow PEP 8 guidelines.
-   **Structure**:
    -   Routes go in `api/app/routes`.
    -   Business logic goes in `api/app/services`.
-   **Type Hinting**: Use Python type hints where possible.

## Workflow

1.  **Fork** the repository.
2.  **Create a branch** for your feature (`git checkout -b feature/amazing-feature`).
3.  **Commit** your changes (`git commit -m "Add amazing feature"`).
4.  **Push** to the branch (`git push origin feature/amazing-feature`).
5.  **Open a Pull Request**.

## Directory Structure

```
/
├── api/                # Python Backend
│   ├── app/
│   │   ├── routes/     # API Endpoints
│   │   └── services/   # Logic
│   └── requirements.txt
├── web/                # React Frontend
│   ├── src/
│   │   ├── core/       # API & State
│   │   ├── modules/    # Views & Features
│   │   └── ui/         # Shared Components
│   └── package.json
├── src-tauri/          # Tauri Config
└── docs/               # Documentation
```
