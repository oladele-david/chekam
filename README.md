# Chekam App v1
<!-- All chekam should be bolden, and emojis present
Can i change it to : u and i , make it more personal
 -->
**Chekam** is a budget and expense management app that allow users track their income, manage their expenses, and set predefined limits on their budgets. This software  ensures that users—whether students, blue-collar or white-collar workers—can manage their income responsibly and work towards their more important financial goals, avoiding impulsive spending.

The app integrates authentication, budget alerts, and notifications, allowing users to categorise their expenses for easier financial management. It offers sophisticated APIs to help manage transactions, income streams, and expenses.

## Project Inspiration

The **Chekam** project was born from the challenges individuals face in effectively managing personal finances. Many people struggle with tracking expenses and income, which can lead to missed savings opportunities and hinder financial growth. **Chekam** aims to simplify budget management while offering insights into spending habits, empowering users to achieve their financial goals more efficiently.


## Table of Contents
<!-- Several lines and clickable like links  -->
Features
Installation
Configuration
API Endpoints
Notifications & Alerts
Testing
Documentation
Contributing
License

## Features
Authentication: Secure login for personal and protected data access.

Income Management: Track income from different sources (salary, freelancing, etc.).

Expense Tracking: Monitor and categorize all expenses.

Category Management: Group expenses by predefined categories (e.g., groceries, utilities, etc.).

Budgeting: Set and manage budget limits across different categories.

Real-Time Alerts: Receive notifications when approaching or exceeding budget limits.

Financial Insights: Gain insights into spending patterns, saving habits, and income breakdowns.

Reports: Generate reports to visualize income vs. expenses over time.

## Project Structure

Below is a high-level overview of the project structure:
```
chekam/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```
## Installation

### Requirements:

### Backend
- **Python**: 3.10.15 or higher
- **FastAPI**: Build robust and high-performance APIs.
- **PostgreSQL**: Reliable and scalable database system.
- **SQLAlchemy & Alembic**: ORM and migration tool for database management.
- **Uvicorn**: ASGI server for the application.
- **bcrypt & Python-Jose**: Secure password hashing and JWT tokens.

### Frontend
- **Vite**: Fast and modern frontend development setup.
- **React**: Efficient UI component framework.
- **Tailwind CSS**: Utility-first CSS framework for custom, responsive designs.
- **JavaScript**: Core scripting language for web pages.

### Setup Instructions:

### Backend
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/chekam.git
   cd chekam/backend
   ```
2. Set up a virtual environment and activate it
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

### Frontend
1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```
2. Install npm packages
   ```bash
   npm install
   ```


