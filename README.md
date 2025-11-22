# Zenith Launcher

Zenith Launcher is a modern, aesthetically refined Minecraft launcher designed for a premium user experience. It harnesses the power of a **Python** backend for robust operations, seamlessly integrated with a **Vite** and **React** frontend for a fluid interface, all built upon the **Tauri** desktop framework.

## Features

-   **Modern Dashboard**: A sleek and intuitive user interface.
-   **Instance Management**: Easily create, import, and manage Minecraft instances.
-   **Mod Support**: Integrated support for CurseForge modpacks.
-   **Customizable**: Tailor the launcher to your preferences with themes and settings.
-   **High Performance**: Optimized for speed and reliability.

## Tech Stack

This project utilizes a powerful combination of modern technologies:

-   **Frontend**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/).
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a beautiful and responsive design.
-   **Backend**: [Python](https://www.python.org/) for handling complex logic and file operations.
-   **Desktop Framework**: [Tauri](https://tauri.app/) for a lightweight and secure desktop application experience.

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:

-   [Node.js](https://nodejs.org/) (Latest LTS recommended)
-   [Python](https://www.python.org/) (3.8 or higher)
-   [Rust](https://www.rust-lang.org/) (Required for Tauri)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/zenith-launcher.git
    cd zenith-launcher
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    npm install
    # or
    cd web && npm install
    ```

3.  **Install Backend Dependencies:**
    
    It is recommended to use a virtual environment.

    ```bash
    python -m venv .venv
    # Activate the virtual environment:
    # Windows:
    .venv\Scripts\activate
    # Linux/macOS:
    source .venv/bin/activate
    
    pip install -r api/requirements.txt
    ```

### Running the Application

To start the development server, run:

```bash
npm run dev
```

This command will start both the Python backend and the Tauri/React frontend concurrently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
