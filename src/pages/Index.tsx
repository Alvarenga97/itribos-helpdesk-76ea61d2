import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Clock, CheckCircle2 } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { useTickets } from '@/hooks/useTickets';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data: tickets = [], isLoading } = useTickets();

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  const stats = [
    { title: 'Abertos', value: openCount, icon: <Ticket className="h-5 w-5" />, color: 'text-primary' },
    { title: 'Em Andamento', value: inProgressCount, icon: <Clock className="h-5 w-5" />, color: 'text-warning' },
    { title: 'Resolvidos', value: resolvedCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-success' },
  ];

  const recentTickets = tickets.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral dos chamados</p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-4">
          <h2 className="text-sm font-semibold font-display text-foreground">Chamados Recentes</h2>
          <Link to="/tickets" className="text-xs font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentTickets.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nenhum chamado encontrado
            </div>
          ) : (
            recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-muted/50"
              >
                <span className="shrink-0 font-mono text-xs text-muted-foreground">#{ticket.ticket_number}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{ticket.requester_profile?.name || 'Desconhecido'}</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex sm:hidden">
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
