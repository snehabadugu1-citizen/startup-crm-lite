import React from 'react';

export default function MetricCard({ title, value, trend, isPositive, subtitle, icon: Icon }) {
  return (
    <div className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
          {title}
        </h3>
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-background-light dark:bg-background-dark flex items-center justify-center text-text-muted-light dark:text-text-muted-dark">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
          {value}
        </div>
        {trend && (
          <div className={`text-sm font-medium flex items-center ${
            isPositive ? 'text-success-500' : 'text-danger-500'
          }`}>
            {isPositive ? '+' : ''}{trend}
          </div>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">
          {subtitle}
        </p>
      )}
    </div>
  );
}
