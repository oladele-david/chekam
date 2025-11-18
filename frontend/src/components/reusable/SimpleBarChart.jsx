import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * SimpleBarChart Component
 * Simple CSS-based bar chart for displaying trends
 *
 * @param {string} title - Chart title
 * @param {Array} data - Array of { label, value, color } objects
 * @param {string} valuePrefix - Prefix for values (e.g., '₦')
 * @param {string} className - Additional CSS classes
 */
export default function SimpleBarChart({
  title,
  data = [],
  valuePrefix = '',
  className
}) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value || 0));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const color = item.color || 'bg-customBlue';

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 truncate">
                    {item.label}
                  </span>
                  <span className="font-semibold text-customGray4 ml-2">
                    {valuePrefix}{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all duration-300", color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
