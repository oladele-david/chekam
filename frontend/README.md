# Chekam Frontend

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Project Inspiration

The Chekam project was inspired by the common challenges individuals face in managing their personal finances. Many struggle with tracking expenses and income, leading to missed opportunities for savings and financial growth. Chekam aims to simplify budgeting and provide valuable insights into spending habits, empowering users to achieve their financial goals with ease.

## Features

- **Income & Expense Tracking**: Record transactions to maintain a clear overview of finances.
- **Budget Management**: Set and track budgeting goals.
- **Spending Insights**: Visualize spending habits to encourage better financial decisions.
- **Secure Authentication**: Utilizes OAuth2 with JWT for secure access.
- **Scalable Architecture**: Supports asynchronous operations for efficient performance.

## Technology Stack

- **Vite**: For faster and leaner development environment.
- **JavaScript (React)**: To create reusable UI components.
- **Shadcn UI**: For building accessible and responsive web application components.
- **Tailwind CSS**: To create custom, responsive, and modern designs.
- **FASTAPI**: Backend framework for building APIs.

---

## Architecture Overview

_Include a high-level diagram or description of the architecture here._

---

## Installation

### Local Development

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/chekam.git
    cd chekam
    ```
   
2. **Install Package Manager**:
    ```bash
    cd frontend
    npm install
    ```

3. **Create Environment Variables**:
    ```bash
    touch .env.development
    echo "VITE_API_URL=http://your-localhost:PORT/api/v1/" > .env.development
    ```

4. **Start the development server**:
    ```bash
    npm run dev
    ```

---

### Deployment on Cloud (Using Docker)

Follow these steps to build and deploy the application on a cloud server using Docker:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/chekam.git
    cd chekam/frontend
    ```

2. **Build the Docker Image**:
    ```bash
    docker build --build-arg VITE_DEVELOPMENT_URL={{API_URL}} -t chekam-app .
    ```
    Replace `{{API_URL}}` with the URL of your backend API (e.g., `https://chekam-api.veldtsdigital.tech/api/v1/`).

3. **Run the Container**:
    ```bash
    docker run -d --name chekam-app -p 8080:80 chekam-app
    ```
    The app will be available at `http://<your-cloud-server-ip>:8080`.

4. **Verify Environment Variable (Optional)**:
    To confirm the environment variable is correctly set inside the container:
    ```bash
    docker exec -it chekam-app printenv | grep VITE_DEVELOPMENT_URL
    ```

---

## Contributing

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make your changes and commit them.
4. Open a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License.

---

This structure provides clear instructions for both developers and deployment teams. Let me know if you need further tweaks!