import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import MetricCard from '../components/reusable/MetricCard';
import HealthScoreGauge from '../components/reusable/HealthScoreGauge';
import SimpleBarChart from '../components/reusable/SimpleBarChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  BarChart3,
  Calendar,
  Wallet
} from 'lucide-react';
import ApiClient from '../api/ApiClient';
import AnalyticsEndpoint from '../api/AnalyticsEndpoint';

export default function Analytics() {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [incomeExpenses, setIncomeExpenses] = useState(null);
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [budgetUtilization, setBudgetUtilization] = useState([]);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const analyticsEndpoint = new AnalyticsEndpoint(apiClient);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [incomeExpensesData, spendingData, budgetData, healthData, trendsData] = await Promise.all([
        analyticsEndpoint.getIncomeVsExpenses(user.id),
        analyticsEndpoint.getSpendingByCategory(user.id, selectedPeriod),
        analyticsEndpoint.getBudgetUtilization(user.id),
        analyticsEndpoint.getFinancialHealth(user.id),
        analyticsEndpoint.getMonthlyTrends(user.id, 6)
      ]);

      setIncomeExpenses(incomeExpensesData);
      setSpendingByCategory(spendingData || []);
      setBudgetUtilization(budgetData || []);
      setFinancialHealth(healthData);
      setMonthlyTrends(trendsData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const getBudgetStatusBadge = (status) => {
    const variants = {
      healthy: 'success',
      warning: 'warning',
      critical: 'warning',
      exceeded: 'danger'
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-customBlue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-customGray4">Financial Analytics</h1>
            <p className="text-gray-600 mt-1">Insights into your spending, savings, and financial health</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Income vs Expenses Metrics */}
        {incomeExpenses && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Income"
              value={formatCurrency(incomeExpenses.total_income)}
              icon={<DollarSign className="h-5 w-5" />}
              subtitle="Current period"
            />
            <MetricCard
              title="Total Expenses"
              value={formatCurrency(incomeExpenses.total_expenses)}
              icon={<Wallet className="h-5 w-5" />}
              subtitle="Current period"
            />
            <MetricCard
              title="Net Savings"
              value={formatCurrency(incomeExpenses.net_savings)}
              icon={<PiggyBank className="h-5 w-5" />}
              trend={incomeExpenses.savings_rate > 0 ? incomeExpenses.savings_rate : undefined}
            />
            <MetricCard
              title="Savings Rate"
              value={`${incomeExpenses.savings_rate?.toFixed(1)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              subtitle={
                incomeExpenses.savings_rate >= 20
                  ? 'Excellent!'
                  : incomeExpenses.savings_rate >= 10
                  ? 'Good'
                  : 'Needs improvement'
              }
            />
          </div>
        )}

        {/* Financial Health Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialHealth && (
            <HealthScoreGauge
              score={financialHealth.total_score}
              grade={financialHealth.grade}
              breakdown={financialHealth.breakdown}
              recommendations={financialHealth.recommendations}
            />
          )}

          {/* Spending by Category */}
          <SimpleBarChart
            title={`Spending by Category (${selectedPeriod})`}
            data={spendingByCategory.map(cat => ({
              label: cat.category,
              value: cat.amount,
              color: 'bg-customBlue'
            }))}
            valuePrefix="₦"
          />
        </div>

        {/* Budget Utilization */}
        {budgetUtilization && budgetUtilization.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetUtilization.map((budget) => (
                  <div key={budget.budget_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          {budget.category}
                        </span>
                        <Badge variant={getBudgetStatusBadge(budget.status)}>
                          {budget.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-customGray4">
                          {formatCurrency(budget.spent_amount)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {' '}/ {formatCurrency(budget.budget_amount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={Math.min(budget.utilization_percentage, 100)}
                        indicatorClassName={getBudgetStatusColor(budget.status)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {budget.utilization_percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {budget.remaining > 0 ? 'Remaining:' : 'Over by:'} {formatCurrency(Math.abs(budget.remaining))}
                      </span>
                      <span>{budget.days_remaining} days left</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trends */}
        {monthlyTrends && monthlyTrends.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Trends (Last 6 Months)</CardTitle>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b last:border-b-0">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Month</p>
                      <p className="font-semibold text-customGray4">{trend.month}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Income</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(trend.income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Expenses</p>
                      <p className="font-semibold text-red-600">
                        {formatCurrency(trend.expenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Savings</p>
                      <p className="font-semibold text-customBlue">
                        {formatCurrency(trend.savings)} ({trend.savings_rate.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
