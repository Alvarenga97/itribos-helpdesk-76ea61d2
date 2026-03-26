import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket, Clock, AlertTriangle, CheckCircle2, TrendingUp, Users, Star
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { mockTickets } from '@/data/mock';

const stats = [
  { title: 'Chamados Abertos', value: 3, icon: <Ticket className="h-5 w-5" />, trend: { value: -12, label: 'vs ontem' } },
  { title: 'Em Andamento', value: 2, icon: <Clock className="h-5 w-5" />, subtitle: '2 atribuídos a você' },
  { title: 'SLA em Risco', value: 1, icon: <AlertTriangle className="h-5 w-5" />, trend: { value: 50, label: 'vs ontem' } },
  { title: 'Resolvidos Hoje', value: 1, icon: <CheckCircle2 className="h-5 w-5" />, trend: { value: 25, label: 'vs ontem' } },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const recentTickets = mockTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral dos chamados de hoje, 25 de março de 2026</p>
      </div>

      {/* Stats */}
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
        {/* Recent tickets */}
        <div className="lg:col-span-2 rounded-lg border border-border card-gradient">
          <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-4">
            <h2 className="text-sm font-semibold font-display text-foreground">Chamados Recentes</h2>
            <Link to="/tickets" className="text-xs font-medium text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTickets.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors hover:bg-secondary/50"
              >
                <span className="shrink-0 font-mono text-xs text-muted-foreground">#{ticket.ticketNumber}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{ticket.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{ticket.requester.name}</p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                {/* Mobile: show only status */}
                <div className="flex sm:hidden">
                  <StatusBadge status={ticket.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick stats side */}
        <div className="space-y-4">
          {/* Performance */}
          <div className="rounded-lg border border-border card-gradient p-5">
            <h3 className="text-sm font-semibold font-display text-foreground">Performance</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">SLA Cumprido</span>
                  <span className="font-medium text-success">85%</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                  <div className="h-full w-[85%] rounded-full bg-success" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">CSAT Médio</span>
                  <span className="font-medium text-primary">4.5/5</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                  <div className="h-full w-[90%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tempo Médio</span>
                  <span className="font-medium text-warning">4.2h</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                  <div className="h-full w-[60%] rounded-full bg-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-lg border border-border card-gradient p-5">
            <h3 className="text-sm font-semibold font-display text-foreground">Por Categoria</h3>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Infraestrutura', count: 3, color: '#3B82F6' },
                { name: 'Software', count: 2, color: '#8B5CF6' },
                { name: 'Rede', count: 1, color: '#F59E0B' },
                { name: 'Segurança', count: 1, color: '#EF4444' },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-mono text-xs font-medium text-foreground">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
