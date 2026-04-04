import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatCard({ title, value, subtitle, icon, color, trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold font-display text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-1 text-[10px] sm:text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-destructive')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% <span className="hidden sm:inline">{trend.label}</span>
            </p>
          )}
        </div>
        <div className={cn('flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-muted shrink-0 ml-2', color || 'text-primary')}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
