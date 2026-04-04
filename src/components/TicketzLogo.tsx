import { cn } from '@/lib/utils';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export default function TicketzLogo({ size = 'md', className }: Props) {
  return (
    <div className={cn('flex items-center justify-center rounded-xl bg-primary', sizes[size], className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4')}
      >
        {/* Ticket shape */}
        <path
          d="M4 4h16a2 2 0 012 2v4a2 2 0 00-2 2 2 2 0 002 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 002-2 2 2 0 00-2-2V6a2 2 0 012-2z"
          fill="currentColor"
          className="text-primary-foreground"
          opacity="0.25"
        />
        {/* Checkmark */}
        <path
          d="M8.5 12.5l2.5 2.5 5-5"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
