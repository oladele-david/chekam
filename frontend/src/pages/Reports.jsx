import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import SimpleBarChart from '../components/reusable/SimpleBarChart';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiClient from '../api/ApiClient';
import ReportsEndpoint from '../api/ReportsEndpoint';
import CategoryEndpoint from '../api/CategoryEndpoint';

export default function Reports() {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.token);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [report, setReport] = useState(null);
  const [categories, setCategories] = useState([]);

  // Report parameters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [monthsToAnalyze, setMonthsToAnalyze] = useState(6);

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const reportsEndpoint = new ReportsEndpoint(apiClient);
  const categoryEndpoint = new CategoryEndpoint(apiClient);

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      const response = await categoryEndpoint.getCategoriesByUser(user.id);
      setCategories(response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReport(null);

    try {
      let reportData;

      switch (reportType) {
        case 'monthly':
          reportData = await reportsEndpoint.getMonthlyReport(
            user.id,
            selectedYear,
            selectedMonth
          );
          break;

        case 'category':
          if (!selectedCategory) {
            toast({
              title: "Validation Error",
              description: "Please select a category",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          reportData = await reportsEndpoint.getCategoryReport(
            user.id,
            selectedCategory,
            monthsToAnalyze
          );
          break;

        case 'budget':
          reportData = await reportsEndpoint.getBudgetPerformanceReport(user.id);
          break;

        case 'annual':
          reportData = await reportsEndpoint.getAnnualReport(user.id, selectedYear);
          break;

        default:
          break;
      }

      setReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
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

  const getBudgetStatusBadge = (status) => {
    const variants = {
      healthy: 'success',
      warning: 'warning',
      critical: 'warning',
      exceeded: 'danger'
    };
    return variants[status] || 'default';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-customGray4">Financial Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports to analyze your financial activity
          </p>
        </div>

        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                >
                  <option value="monthly">Monthly Report</option>
                  <option value="category">Category Report</option>
                  <option value="budget">Budget Performance</option>
                  <option value="annual">Annual Report</option>
                </select>
              </div>

              {/* Year Selection (for monthly and annual) */}
              {(reportType === 'monthly' || reportType === 'annual') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month Selection (for monthly report) */}
              {reportType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Selection (for category report) */}
              {reportType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Months to Analyze (for category report) */}
              {reportType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months to Analyze
                  </label>
                  <select
                    value={monthsToAnalyze}
                    onChange={(e) => setMonthsToAnalyze(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-customBlue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Report Display */}
        {report && (
          <div className="space-y-6">
            {/* Monthly Report */}
            {reportType === 'monthly' && (
              <>
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Monthly Summary - {months[selectedMonth - 1]} {selectedYear}</span>
                      <Badge variant="info">
                        {report.summary.transaction_count} transactions
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.summary.total_income)}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(report.summary.total_expenses)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Net Savings</p>
                        <p className="text-2xl font-bold text-customBlue">
                          {formatCurrency(report.summary.net_savings)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Savings Rate</p>
                        <p className="text-2xl font-bold text-customGray4">
                          {report.summary.savings_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insights */}
                {report.insights && report.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Insights & Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-customBlue mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Spending by Category */}
                {report.spending_by_category && report.spending_by_category.length > 0 && (
                  <SimpleBarChart
                    title="Spending by Category"
                    data={report.spending_by_category.map(cat => ({
                      label: cat.category,
                      value: cat.amount,
                      color: 'bg-customBlue'
                    }))}
                    valuePrefix="₦"
                  />
                )}
              </>
            )}

            {/* Category Report */}
            {reportType === 'category' && report.category && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {report.category.name} - Spending Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-customBlue">
                          {formatCurrency(report.statistics.total_spent)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.statistics.average_monthly)}
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Highest Month</p>
                        <p className="text-sm font-semibold text-orange-600">
                          {report.statistics.highest_month?.month}
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(report.statistics.highest_month?.amount)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
                        <p className="text-2xl font-bold text-customGray4">
                          {report.statistics.transaction_count}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {report.monthly_trends && report.monthly_trends.length > 0 && (
                  <SimpleBarChart
                    title="Monthly Spending Trends"
                    data={report.monthly_trends.map(trend => ({
                      label: trend.month,
                      value: trend.amount,
                      color: 'bg-customBlue'
                    }))}
                    valuePrefix="₦"
                  />
                )}
              </>
            )}

            {/* Budget Performance Report */}
            {reportType === 'budget' && report.summary && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Budgeted</p>
                        <p className="text-2xl font-bold text-customBlue">
                          {formatCurrency(report.summary.total_budgeted)}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(report.summary.total_spent)}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Remaining</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.summary.total_remaining)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Utilization</p>
                        <p className="text-2xl font-bold text-customGray4">
                          {report.summary.overall_utilization.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Individual Budget Performance */}
                    <div className="space-y-4">
                      {report.budgets && report.budgets.map((budget) => (
                        <div key={budget.budget_id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-customGray4">{budget.category}</h4>
                            <Badge variant={getBudgetStatusBadge(budget.status)}>
                              {budget.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Budgeted</p>
                              <p className="font-semibold">{formatCurrency(budget.budget_amount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Spent</p>
                              <p className="font-semibold">{formatCurrency(budget.spent_amount)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Utilization</p>
                              <p className="font-semibold">{budget.utilization_percentage.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Days Remaining</p>
                              <p className="font-semibold">{budget.period.days_remaining}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Annual Report */}
            {reportType === 'annual' && report.summary && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Annual Summary - {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(report.summary.total_income)}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(report.summary.total_expenses)}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Savings</p>
                        <p className="text-2xl font-bold text-customBlue">
                          {formatCurrency(report.summary.total_savings)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Avg Savings Rate</p>
                        <p className="text-2xl font-bold text-customGray4">
                          {report.summary.average_savings_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {report.insights && report.insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Year-End Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-customBlue mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {report.monthly_trends && report.monthly_trends.length > 0 && (
                  <SimpleBarChart
                    title="Monthly Savings Trends"
                    data={report.monthly_trends.map(trend => ({
                      label: trend.month,
                      value: trend.savings,
                      color: trend.savings > 0 ? 'bg-green-500' : 'bg-red-500'
                    }))}
                    valuePrefix="₦"
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
