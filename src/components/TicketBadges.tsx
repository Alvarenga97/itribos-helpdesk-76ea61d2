import type { TicketStatus, TicketPriority } from '@/types/ticket';
import { cn } from '@/lib/utils';

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: 'Aberto', className: 'bg-info/15 text-info border-info/30' },
  IN_PROGRESS: { label: 'Em Andamento', className: 'bg-warning/15 text-warning border-warning/30' },
  WAITING_REQUESTER: { label: 'Aguardando', className: 'bg-muted text-muted-foreground border-border' },
  RESOLVED: { label: 'Resolvido', className: 'bg-success/15 text-success border-success/30' },
  CLOSED: { label: 'Fechado', className: 'bg-secondary text-secondary-foreground border-border' },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  LOW: { label: 'Baixa', className: 'bg-secondary text-secondary-foreground border-border' },
  MEDIUM: { label: 'Média', className: 'bg-info/15 text-info border-info/30' },
  HIGH: { label: 'Alta', className: 'bg-warning/15 text-warning border-warning/30' },
  CRITICAL: { label: 'Crítica', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
