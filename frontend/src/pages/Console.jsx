import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import MetricCard from '@/components/reusable/MetricCard';
import StatCard from '@/components/reusable/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertCircle,
  ArrowRight,
  Bell
} from 'lucide-react';
import ApiClient from '../api/ApiClient';
import DashboardEndpoint from '../api/DashboardEndpoint';

const Console = () => {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const dashboardEndpoint = new DashboardEndpoint(apiClient);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardEndpoint.getDashboardSummary(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const getBudgetStatusColor = (status) => {
    const colors = {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-orange-500',
      exceeded: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getHealthGradeColor = (grade) => {
    if (grade === 'A') return 'text-green-600';
    if (grade === 'B') return 'text-blue-600';
    if (grade === 'C') return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-UK', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customBlue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const quickStats = dashboardData?.quick_stats || {};
  const incomeExpenses = dashboardData?.income_expenses || {};
  const budgetSummary = dashboardData?.budget_summary || {};
  const financialHealth = dashboardData?.financial_health || {};
  const recentTransactions = dashboardData?.recent_transactions || [];
  const recommendations = dashboardData?.recommendations || [];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold text-customDark">Dashboard</h2>
            <p className="text-gray-500">{formattedDate}</p>
          </div>
          {financialHealth && (
            <div className="text-right">
              <div className="text-sm text-customGray2">Financial Health</div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getHealthGradeColor(financialHealth.grade)}`}>
                  {financialHealth.total_score}/100
                </div>
                <Badge variant="info" className="text-lg">
                  Grade {financialHealth.grade}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Current Month Income"
          value={formatCurrency(quickStats.current_month_income)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={quickStats.savings_rate}
          trendLabel="savings rate"
        />
        <MetricCard
          title="Current Month Expenses"
          value={formatCurrency(quickStats.current_month_expenses)}
          icon={<Wallet className="h-5 w-5" />}
          subtitle="This month"
        />
        <MetricCard
          title="Net Savings"
          value={formatCurrency(quickStats.current_month_savings)}
          icon={<PiggyBank className="h-5 w-5" />}
          subtitle={`${quickStats.savings_rate?.toFixed(1)}% of income`}
        />
        <StatCard
          label="Budget Alerts"
          value={quickStats.budgets_critical + quickStats.budgets_exceeded}
          icon={<AlertCircle className="h-6 w-6" />}
          color={quickStats.budgets_exceeded > 0 ? 'red' : quickStats.budgets_critical > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Budget Status Overview */}
      {budgetSummary.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Healthy Budgets</p>
            <p className="text-2xl font-bold text-green-600">{budgetSummary.healthy}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">Warning</p>
            <p className="text-2xl font-bold text-yellow-600">{quickStats.budgets_critical}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-1">Exceeded</p>
            <p className="text-2xl font-bold text-red-600">{budgetSummary.exceeded}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Budgets</p>
            <p className="text-2xl font-bold text-customBlue">{budgetSummary.total}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Budgets */}
        {budgetSummary.top_budgets && budgetSummary.top_budgets.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Budget Overview</CardTitle>
                <Link to="/budgets">
                  <Button variant="outline" size="sm" className="text-customBlue border-customBlue">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetSummary.top_budgets.slice(0, 5).map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{budget.category}</span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budget_amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(budget.utilization, 100)}
                        indicatorClassName={getBudgetStatusColor(budget.status)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {budget.utilization?.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        {recentTransactions && recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Link to="/transactions">
                  <Button variant="outline" size="sm" className="text-customBlue border-customBlue">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-customGray4">
                          {transaction.description || 'Transaction'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.category || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-customBlue" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.slice(0, 5).map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-customBlue mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
            <Link to="/analytics">
              <Button variant="outline" className="w-full mt-4 text-customBlue border-customBlue">
                View Detailed Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default Console;
