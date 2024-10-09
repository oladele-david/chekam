# Chekam

Chekam is a personal finance management tool designed to help users effortlessly track income, manage expenses, and achieve their financial goals. Developed using FastAPI and PostgreSQL, Chekam aims to provide a secure, efficient platform for personal finance management.

## Table of Contents

- [Project Inspiration](#project-inspiration)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Project Inspiration

The Chekam project was inspired by the common challenges individuals face in managing their personal finances. Many struggle with tracking expenses and income, leading to missed opportunities for savings and financial growth. Chekam aims to simplify budgeting and provide valuable insights into spending habits, empowering users to achieve their financial goals with ease.

## Features

- **Income & Expense Tracking**: Record transactions to maintain a clear overview of finances.
- **Budget Management**: Set and track budgeting goals.
- **Spending Insights**: Visualize spending habits to encourage better financial decisions.
- **Secure Authentication**: Utilizes OAuth2 with JWT for secure access.
- **Scalable Architecture**: Supports asynchronous operations for efficient performance.

## Technology Stack

- **FastAPI**: Backend framework for building APIs.
- **SQLAlchemy**: ORM for database management.
- **PostgreSQL**: Relational database system.
- **Alembic**: Database migration tool.
- **Pydantic**: Data validation and settings management.
- **bcrypt & Python-Jose**: For secure password hashing and JWT tokens.
- **Uvicorn**: ASGI server for running the application.

## Architecture Overview

Chekam leverages FastAPI for its robust and scalable backend capabilities, relying on SQLAlchemy to manage database interactions with PostgreSQL. Secure authentication is implemented via OAuth2 with JWT, ensuring user data is protected. The application is designed for asynchronous operations, served by Uvicorn, enhancing performance and responsiveness.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/chekam.git
    cd chekam
    ```

2. **Set up a virtual environment**:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
    ```

3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## Configuration

- **Environment Variables**: Create a `.venv` file and configure database connection settings, secret keys, and other environment-specific variables.
- **Database Setup**: Use Alembic for migrations to initialize and manage database schema.

## Usage

Start the development server:
```bash
uvicorn app.main:app --reload
```

Access the API documentation at `http://127.0.0.1:8000/docs`.

## Contributing

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make your changes and commit them.
4. Open a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License.

---
