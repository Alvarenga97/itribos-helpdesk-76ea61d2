import type { TicketStatus, TicketPriority } from '@/types/ticket';
import { cn } from '@/lib/utils';

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: 'Aberto', className: 'bg-primary/10 text-primary border-primary/20' },
  IN_PROGRESS: { label: 'Em Andamento', className: 'bg-warning/10 text-warning border-warning/20' },
  WAITING_REQUESTER: { label: 'Aguardando', className: 'bg-muted text-muted-foreground border-border' },
  RESOLVED: { label: 'Resolvido', className: 'bg-success/10 text-success border-success/20' },
  CLOSED: { label: 'Fechado', className: 'bg-secondary text-secondary-foreground border-border' },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  LOW: { label: 'Baixa', className: 'bg-secondary text-secondary-foreground border-border' },
  MEDIUM: { label: 'Média', className: 'bg-primary/10 text-primary border-primary/20' },
  HIGH: { label: 'Alta', className: 'bg-warning/10 text-warning border-warning/20' },
  CRITICAL: { label: 'Crítica', className: 'bg-destructive/10 text-destructive border-destructive/20' },
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
