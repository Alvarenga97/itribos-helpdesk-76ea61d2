import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Ticket, Clock, CheckCircle2, Star } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { mockTickets } from '@/data/mock';
import { useRole } from '@/contexts/RoleContext';
import type { TicketStatus } from '@/types/ticket';
import { cn } from '@/lib/utils';

const statusFilters: { value: TicketStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Abertos' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'RESOLVED', label: 'Resolvidos' },
  { value: 'CLOSED', label: 'Fechados' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function RequesterHome() {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const { currentUser } = useRole();

  // Requester sees only their tickets (mock: filter by requester id)
  const myTickets = mockTickets.filter(t => t.requester.id === currentUser.id);
  const filtered = statusFilter === 'ALL' ? myTickets : myTickets.filter(t => t.status === statusFilter);

  const openCount = myTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_REQUESTER').length;
  const resolvedCount = myTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Meus Chamados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Olá, {currentUser.name.split(' ')[0]}! Acompanhe seus chamados de suporte.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Abrir Chamado
        </Link>
      </div>

      {/* Quick stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-3 gap-3">
        <motion.div variants={item} className="rounded-lg border border-border card-gradient p-4 text-center">
          <Ticket className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 text-2xl font-bold font-display text-foreground">{myTickets.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </motion.div>
        <motion.div variants={item} className="rounded-lg border border-border card-gradient p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-warning" />
          <p className="mt-2 text-2xl font-bold font-display text-foreground">{openCount}</p>
          <p className="text-xs text-muted-foreground">Em aberto</p>
        </motion.div>
        <motion.div variants={item} className="rounded-lg border border-border card-gradient p-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
          <p className="mt-2 text-2xl font-bold font-display text-foreground">{resolvedCount}</p>
          <p className="text-xs text-muted-foreground">Resolvidos</p>
        </motion.div>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f.value
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border card-gradient p-8 text-center">
          <Ticket className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">Nenhum chamado encontrado</p>
          <p className="mt-1 text-xs text-muted-foreground">Abra um novo chamado para solicitar suporte.</p>
          <Link
            to="/tickets/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Abrir Chamado
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/tickets/${ticket.id}`}
                className="block rounded-lg border border-border card-gradient p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">#{ticket.ticketNumber}</span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-foreground">{ticket.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                      <span>{ticket.category.name}</span>
                    </div>
                    {ticket.assignee && (
                      <span>Analista: {ticket.assignee.name}</span>
                    )}
                  </div>
                  <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                {ticket.csatScore && (
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('h-3 w-3', i < ticket.csatScore! ? 'fill-warning text-warning' : 'text-border')} />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">Sua avaliação</span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
