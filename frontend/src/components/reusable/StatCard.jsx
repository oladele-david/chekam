import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * StatCard Component
 * Compact card for displaying a single statistic
 *
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {React.ReactNode} icon - Icon component
 * @param {string} color - Color theme (blue, green, red, yellow, gray)
 * @param {string} className - Additional CSS classes
 */
export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
  className
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    cyan: 'bg-customLiteBlue text-customCyan border-customCyan',
  };

  return (
    <Card className={cn("border-l-4", colorClasses[color], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-customGray4">
              {value}
            </p>
          </div>
          {icon && (
            <div className={cn("h-12 w-12 flex items-center justify-center rounded-full", colorClasses[color])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
