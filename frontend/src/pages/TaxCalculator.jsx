import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calculator, FileText, TrendingUp, DollarSign } from 'lucide-react';
import ApiClient from '../api/ApiClient';
import TaxEndpoint from '../api/TaxEndpoint';

export default function TaxCalculator() {
  const user = useSelector((state) => state.auth.user);
  const access_token = useSelector((state) => state.auth.token);

  const [calculationMode, setCalculationMode] = useState('manual'); // 'manual' or 'transactions'
  const [loading, setLoading] = useState(false);
  const [taxResult, setTaxResult] = useState(null);

  // Manual calculation inputs
  const [grossIncome, setGrossIncome] = useState('');
  const [year, setYear] = useState(2026);
  const [reliefs, setReliefs] = useState({
    rent: '',
    pension: '',
    nhf: '',
    nhis: '',
    life_insurance: ''
  });

  const apiClient = new ApiClient(import.meta.env.VITE_DEVELOPMENT_URL, access_token);
  const taxEndpoint = new TaxEndpoint(apiClient);

  const calculateTaxManually = async () => {
    if (!grossIncome || parseFloat(grossIncome) <= 0) {
      alert('Please enter a valid gross income');
      return;
    }

    setLoading(true);
    setTaxResult(null);

    try {
      // Prepare reliefs object (only include non-empty values)
      const reliefData = {};
      Object.entries(reliefs).forEach(([key, value]) => {
        if (value && parseFloat(value) > 0) {
          reliefData[key] = parseFloat(value);
        }
      });

      const result = await taxEndpoint.calculateTax({
        gross_income: parseFloat(grossIncome),
        year: year,
        reliefs: Object.keys(reliefData).length > 0 ? reliefData : null
      });

      setTaxResult(result);
    } catch (error) {
      console.error('Error calculating tax:', error);
      alert('Failed to calculate tax. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTaxFromTransactions = async () => {
    setLoading(true);
    setTaxResult(null);

    try {
      const result = await taxEndpoint.calculateTaxFromTransactions(user.id, year);
      setTaxResult(result);
    } catch (error) {
      console.error('Error calculating tax from transactions:', error);
      alert('Failed to calculate tax from transactions. Please try again.');
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

  const years = [2026, 2027, 2028, 2029, 2030];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-customGray4">Nigerian Tax Calculator</h1>
          <p className="text-gray-600 mt-1">
            Calculate your PAYE tax liability based on 2026 tax brackets
          </p>
        </div>

        {/* Calculation Mode Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCalculationMode('manual');
              setTaxResult(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              calculationMode === 'manual'
                ? 'bg-customBlue text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Manual Calculation
            </div>
          </button>
          <button
            onClick={() => {
              setCalculationMode('transactions');
              setTaxResult(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              calculationMode === 'transactions'
                ? 'bg-customBlue text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              From Transactions
            </div>
          </button>
        </div>

        {/* Manual Calculation Form */}
        {calculationMode === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Income Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Gross Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gross Annual Income (₦) *
                  </label>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(e.target.value)}
                    placeholder="e.g., 6000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  />
                </div>

                {/* Tax Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax Reliefs */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Tax Reliefs (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Rent Relief (₦)</label>
                    <input
                      type="number"
                      value={reliefs.rent}
                      onChange={(e) => setReliefs({ ...reliefs, rent: e.target.value })}
                      placeholder="Max ₦500,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Pension Relief (₦)</label>
                    <input
                      type="number"
                      value={reliefs.pension}
                      onChange={(e) => setReliefs({ ...reliefs, pension: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">NHF Relief (₦)</label>
                    <input
                      type="number"
                      value={reliefs.nhf}
                      onChange={(e) => setReliefs({ ...reliefs, nhf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">NHIS Relief (₦)</label>
                    <input
                      type="number"
                      value={reliefs.nhis}
                      onChange={(e) => setReliefs({ ...reliefs, nhis: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Life Insurance (₦)</label>
                    <input
                      type="number"
                      value={reliefs.life_insurance}
                      onChange={(e) => setReliefs({ ...reliefs, life_insurance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateTaxManually}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-customBlue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Calculate Tax
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        )}

        {/* Transaction-Based Calculation */}
        {calculationMode === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Calculate from Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Calculate your tax liability based on your actual income transactions for the selected year.
                  The system will automatically sum all income transactions and apply any saved tax reliefs.
                </p>

                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customBlue"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={calculateTaxFromTransactions}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-customBlue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Calculate from Transactions
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        )}

        {/* Tax Calculation Results */}
        {taxResult && (
          <div className="space-y-4">
            {/* Main Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tax Calculation Results</span>
                  <Badge variant="success">
                    Effective Rate: {(taxResult.tax_calculation?.effective_rate || taxResult.effective_rate)?.toFixed(2)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Gross Income</p>
                    <p className="text-2xl font-bold text-customBlue">
                      {formatCurrency(taxResult.gross_income || taxResult.tax_calculation?.gross_income)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Total Reliefs</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(taxResult.total_reliefs || taxResult.tax_calculation?.total_reliefs)}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Taxable Income</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatCurrency(taxResult.taxable_income || taxResult.tax_calculation?.taxable_income)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">Net Tax</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(taxResult.net_tax || taxResult.tax_calculation?.net_tax)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bracket Breakdown */}
            {(taxResult.breakdown_by_bracket || taxResult.tax_calculation?.breakdown_by_bracket) && (
              <Card>
                <CardHeader>
                  <CardTitle>Tax Breakdown by Bracket</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(taxResult.breakdown_by_bracket || taxResult.tax_calculation?.breakdown_by_bracket).map((bracket, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-customGray4 mb-1">
                            {bracket.bracket_description}
                          </p>
                          <p className="text-sm text-gray-600">
                            Taxable in bracket: {formatCurrency(bracket.taxable_in_bracket)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-customBlue">
                            {formatCurrency(bracket.tax_in_bracket)}
                          </p>
                          <p className="text-xs text-gray-500">
                            @ {(bracket.rate * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction-based specific info */}
            {calculationMode === 'transactions' && taxResult.monthly_breakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {taxResult.monthly_breakdown.map((month, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <p className="font-semibold text-customGray4 mb-1">
                          {month.month_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Income: {formatCurrency(month.income)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Tax Brackets Information */}
        <Card>
          <CardHeader>
            <CardTitle>2026 Nigerian Tax Brackets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">₦0 - ₦800,000</span>
                <Badge variant="success">0% (Tax-Free)</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">₦800,001 - ₦3,200,000</span>
                <Badge>15%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">₦3,200,001 - ₦6,400,000</span>
                <Badge>18%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">₦6,400,001 - ₦12,800,000</span>
                <Badge>21%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">₦12,800,001 - ₦50,000,000</span>
                <Badge>23%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium">₦50,000,001 and above</span>
                <Badge variant="danger">25%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
