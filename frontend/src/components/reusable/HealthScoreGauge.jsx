import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * HealthScoreGauge Component
 * Displays financial health score with visual gauge
 *
 * @param {number} score - Health score (0-100)
 * @param {string} grade - Letter grade (A-F)
 * @param {Object} breakdown - Score breakdown by component
 * @param {Array} recommendations - List of recommendation strings
 * @param {string} className - Additional CSS classes
 */
export default function HealthScoreGauge({
  score = 0,
  grade = 'F',
  breakdown = {},
  recommendations = [],
  className
}) {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGradeBadgeVariant = (grade) => {
    if (grade === 'A') return 'success';
    if (grade === 'B') return 'info';
    if (grade === 'C') return 'warning';
    if (grade === 'D') return 'warning';
    return 'danger';
  };

  const getGaugeColor = (score) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 70) return 'from-yellow-400 to-yellow-500';
    if (score >= 60) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Financial Health Score</span>
          <Badge variant={getGradeBadgeVariant(grade)} className="text-lg px-3">
            Grade {grade}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Circular Gauge */}
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                className={cn("transition-all duration-1000", `stroke-current ${getScoreColor(score)}`)}
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", getScoreColor(score))}>
                {Math.round(score)}
              </span>
              <span className="text-sm text-gray-500">out of 100</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {breakdown && Object.keys(breakdown).length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Score Breakdown</h4>
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold text-customGray4">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
