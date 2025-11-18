import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MetricCard Component
 * Displays a financial metric with optional trend indicator
 *
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {string} subtitle - Optional subtitle or description
 * @param {React.ReactNode} icon - Optional icon component
 * @param {number} trend - Optional trend percentage (positive/negative)
 * @param {string} trendLabel - Optional trend label text
 * @param {string} className - Additional CSS classes
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className
}) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return 'text-gray-600';
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-customLiteBlue text-customBlue">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-customGray4">
          {value}
        </div>
        {(subtitle || trend !== undefined) && (
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", getTrendColor())}>
                {getTrendIcon()}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
            {(trendLabel || subtitle) && (
              <p className="text-xs text-gray-500">
                {trendLabel || subtitle}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
