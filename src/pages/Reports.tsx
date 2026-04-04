import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, Clock, CheckCircle2, Ticket } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import StatCard from '@/components/StatCard';

const COLORS = ['hsl(180,100%,25%)', 'hsl(38,92%,50%)', 'hsl(152,69%,31%)', 'hsl(0,72%,51%)', 'hsl(215,16%,47%)'];

export default function Reports() {
  const { data: tickets = [], isLoading } = useTickets();
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('30d');

  const filteredTickets = useMemo(() => {
    if (period === 'all') return tickets;
    const days = period === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return tickets.filter(t => new Date(t.created_at) >= cutoff);
  }, [tickets, period]);

  // Daily volume chart data
  const dailyData = useMemo(() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const map = new Map<string, { opened: number; resolved: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map.set(key, { opened: 0, resolved: 0 });
    }
    filteredTickets.forEach(t => {
      const createdDay = t.created_at.split('T')[0];
      if (map.has(createdDay)) map.get(createdDay)!.opened++;
      if (t.resolved_at) {
        const resolvedDay = t.resolved_at.split('T')[0];
        if (map.has(resolvedDay)) map.get(resolvedDay)!.resolved++;
      }
    });
    return Array.from(map.entries()).map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      ...vals,
    }));
  }, [filteredTickets, period]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    const labels: Record<string, string> = {
      OPEN: 'Abertos', IN_PROGRESS: 'Em Andamento', WAITING_REQUESTER: 'Aguardando',
      RESOLVED: 'Resolvidos', CLOSED: 'Fechados',
    };
    filteredTickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([status, value]) => ({
      name: labels[status] || status, value,
    }));
  }, [filteredTickets]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {};
    const labels: Record<string, string> = { LOW: 'Baixa', MEDIUM: 'Média', HIGH: 'Alta', CRITICAL: 'Crítica' };
    filteredTickets.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
    return Object.entries(counts).map(([priority, value]) => ({
      name: labels[priority] || priority, value,
    }));
  }, [filteredTickets]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const name = t.category?.name || 'Sem categoria';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTickets]);

  // Agent performance
  const agentData = useMemo(() => {
    const agents: Record<string, { name: string; resolved: number; total: number }> = {};
    filteredTickets.forEach(t => {
      if (t.assignee_profile) {
        const id = t.assignee_profile.id;
        if (!agents[id]) agents[id] = { name: t.assignee_profile.name, resolved: 0, total: 0 };
        agents[id].total++;
        if (t.status === 'RESOLVED' || t.status === 'CLOSED') agents[id].resolved++;
      }
    });
    return Object.values(agents).sort((a, b) => b.resolved - a.resolved);
  }, [filteredTickets]);

  // Stats
  const totalOpen = filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const totalResolved = filteredTickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const slaBreached = filteredTickets.filter(t => t.sla_breached).length;
  const slaCompliance = filteredTickets.length > 0
    ? Math.round(((filteredTickets.length - slaBreached) / filteredTickets.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Relatórios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Análise de {filteredTickets.length} chamados no período
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { value: '7d' as const, label: '7 dias' },
            { value: '30d' as const, label: '30 dias' },
            { value: 'all' as const, label: 'Todos' },
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-secondary-foreground border border-border hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard title="Total" value={filteredTickets.length} icon={<Ticket className="h-5 w-5" />} color="text-primary" />
        <StatCard title="Em Aberto" value={totalOpen} icon={<Clock className="h-5 w-5" />} color="text-warning" />
        <StatCard title="Resolvidos" value={totalResolved} icon={<CheckCircle2 className="h-5 w-5" />} color="text-success" />
        <StatCard title="SLA Cumprido" value={`${slaCompliance}%`} icon={<TrendingUp className="h-5 w-5" />} color={slaCompliance >= 85 ? 'text-success' : 'text-destructive'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Volume diário */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display text-foreground mb-4">Volume Diário</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dailyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215,16%,47%)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215,16%,47%)' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }} />
              <Bar dataKey="opened" name="Abertos" fill="hsl(180,100%,25%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolvidos" fill="hsl(152,69%,31%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display text-foreground mb-4">Distribuição por Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">Sem dados</div>
          )}
        </motion.div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Priority */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display text-foreground mb-4">Por Prioridade</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215,16%,47%)' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215,16%,47%)' }} width={60} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }} />
              <Bar dataKey="value" name="Chamados" fill="hsl(180,100%,25%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold font-display text-foreground mb-4">Por Categoria</h3>
          {categoryData.length > 0 ? (
            <div className="space-y-3">
              {categoryData.map((cat, i) => {
                const pct = filteredTickets.length > 0 ? Math.round((cat.value / filteredTickets.length) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{cat.name}</span>
                      <span className="text-muted-foreground">{cat.value} ({pct}%)</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Sem dados</div>
          )}
        </motion.div>
      </div>

      {/* Agent performance */}
      {agentData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold font-display text-foreground">Performance dos Analistas</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Analista</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Resolvidos</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Taxa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agentData.map(agent => (
                <tr key={agent.name} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-sm text-foreground">{agent.total}</td>
                  <td className="px-5 py-3.5 font-mono text-sm text-success">{agent.resolved}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm text-foreground">
                      {agent.total > 0 ? Math.round((agent.resolved / agent.total) * 100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
