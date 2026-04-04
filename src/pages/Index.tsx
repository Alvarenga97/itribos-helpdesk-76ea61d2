import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { useTickets } from '@/hooks/useTickets';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { data: tickets = [], isLoading } = useTickets();

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const slaRiskCount = tickets.filter(t => t.sla_breached).length;
  const resolvedTodayCount = tickets.filter(t => {
    if (!t.resolved_at) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.resolved_at.startsWith(today);
  }).length;

  const stats = [
    { title: 'Chamados Abertos', value: openCount, icon: <Ticket className="h-5 w-5" /> },
    { title: 'Em Andamento', value: inProgressCount, icon: <Clock className="h-5 w-5" /> },
    { title: 'SLA em Risco', value: slaRiskCount, icon: <AlertTriangle className="h-5 w-5" /> },
    { title: 'Resolvidos Hoje', value: resolvedTodayCount, icon: <CheckCircle2 className="h-5 w-5" /> },
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
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border card-gradient">
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
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-secondary/50"
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

        <div className="space-y-4">
          <div className="rounded-lg border border-border card-gradient p-5">
            <h3 className="text-sm font-semibold font-display text-foreground">Performance</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">SLA Cumprido</span>
                  <span className="font-medium text-success">
                    {tickets.length > 0 ? Math.round((tickets.filter(t => !t.sla_breached).length / tickets.length) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{ width: `${tickets.length > 0 ? (tickets.filter(t => !t.sla_breached).length / tickets.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
