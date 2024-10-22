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
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Documentation](#api-documentation)
- [Contributing](#contributing)

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

## Configuration
**Environment Variables**  
The following environment variables need to be configured:  

**Backend Environment Variables**:  
&nbsp- Make a `.env` file in the backend directory to configure database connection settings and secret keys like `DATABASE_URL` etc.  
&nbsp- **Database Setup**: Use Alembic for migrations to initialize and manage database schema.  

**Frontend Environment Variables**:  
    - Create a `.env.development` file in the frontend directory for environment-specific variables, like `API URLs`.

## Usage

### Running Backend
To start the backend development server, navigate to the backend directory and run:
```bash
uvicorn app.main:app --reload
```

### Running Frontend
To start the frontend development server, navigate to the frontend directory and run:
```bash
npm run dev
```
### API DOCUMENTATION
You can access the **API documentation** at `http://127.0.0.1:8000/docs`.

## **API ENDPOINTS**
*Note: You can fully access all these with the interactive documentaion [link above](#api-documentation)*

### Authentication
POST `/api/v1/auth/login` Login  
POST `/api/v1/auth/authenticate` Login  
POST `/api/v1/auth/register` Register User  

### Users
GET /api/v1/users Read Users
GET /api/v1/users/{user_id} Read User
POST /api/v1/users/create Create User
PUT /api/v1/users/update/{user_id} Update User
DELETE /api/v1/users/delete/{user_id} Delete User

### Predefined Categories
GET /api/v1/predefined_categories/ Read Predefined Categories
GET /api/v1/predefined_categories/{predefined_category_id} Read Predefined Category
POST /api/v1/predefined_categories/create  Create Predefined Category

### Categories
GET /api/v1/categories/ Read Categories
GET /api/v1/categories/{category_id} Read Category
GET /api/v1/categories/user/{user_id} Read User Categories
POST /api/v1/categories/create Create Category
PUT /api/v1/categories/update/{category_id} Update Category
DELETE /api/v1/categories/delete/{category_id} Delete Category

### Transactions

GET /api/v1/transactions/ Read Transactions
GET /api/v1/transactions/{transaction_id} Get Transaction
GET /api/v1/transactions/user/{user_id} Get User Transactions
POST /api/v1/transactions/create Create Transaction
PUT /api/v1/transactions/update/{transaction_id} Update Transaction
DELETE /api/v1/transactions/delete/{transaction_id} DELETE Transaction

### Budgets
GET /api/v1/budgets/ Read Budgets
GET /api/v1/budgets/{budget_id} Read Budget
GET /api/v1/budgets/user/{user_id} Read User Budgets
POST  /api/v1/budgets/user/{user_id} Create Budget
PUT /api/v1/budgets/update/{budget_id} Update Budget
PUT /api/v1/budgets/update/{budget_id}/current-amount Update Current amount
DELETE /api/v1/budgets/delete/{budget_id}/ Delete Budget


## Contributing

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature.`
5. Open a pull request.

*Please ensure all tests pass before submitting your PR.*