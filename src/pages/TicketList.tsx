import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { mockTickets } from '@/data/mock';
import type { TicketStatus, TicketPriority } from '@/types/ticket';
import { cn } from '@/lib/utils';

const statusFilters: { value: TicketStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Abertos' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'WAITING_REQUESTER', label: 'Aguardando' },
  { value: 'RESOLVED', label: 'Resolvidos' },
  { value: 'CLOSED', label: 'Fechados' },
];

export default function TicketList() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');

  const filtered = statusFilter === 'ALL'
    ? mockTickets
    : mockTickets.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Chamados</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mockTickets.length} chamados no total</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          + Novo Chamado
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border card-gradient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Título</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Categoria</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Prioridade</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Atribuído</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group transition-colors hover:bg-secondary/40"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                      {ticket.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ticket.requester.name}</p>
                  </td>
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                      <span className="text-xs text-muted-foreground">{ticket.category.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={ticket.status} /></td>
                  <td className="hidden px-5 py-3.5 lg:table-cell">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
                          {ticket.assignee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-muted-foreground">{ticket.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Não atribuído</span>
                    )}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
