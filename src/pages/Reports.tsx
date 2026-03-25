import { motion } from 'framer-motion';
import { Calendar, FileText, TrendingUp, AlertTriangle, Users, Clock } from 'lucide-react';

const reports = [
  { date: '25/03/2026', opened: 4, resolved: 3, slaBreached: 1, csat: 4.5, status: 'Gerado' },
  { date: '24/03/2026', opened: 6, resolved: 5, slaBreached: 0, csat: 4.7, status: 'Enviado' },
  { date: '23/03/2026', opened: 3, resolved: 4, slaBreached: 2, csat: 3.8, status: 'Enviado' },
  { date: '22/03/2026', opened: 5, resolved: 5, slaBreached: 1, csat: 4.2, status: 'Enviado' },
  { date: '21/03/2026', opened: 7, resolved: 6, slaBreached: 0, csat: 4.6, status: 'Enviado' },
];

const insights = [
  { icon: TrendingUp, title: 'Volume estável', desc: 'Volume de chamados 8% abaixo da média dos últimos 7 dias.', type: 'success' as const },
  { icon: AlertTriangle, title: 'Categoria crítica: Rede', desc: 'Chamados de rede aumentaram 45% esta semana. Considere criar artigo na base de conhecimento.', type: 'warning' as const },
  { icon: Users, title: 'Performance destaque', desc: 'Carlos Mendes resolveu 12 chamados com CSAT médio de 4.8. Melhor performance da semana.', type: 'info' as const },
  { icon: Clock, title: 'Primeiro contato', desc: 'Tempo médio de primeira resposta: 22 min. Dentro da meta de 30 min.', type: 'success' as const },
];

const typeColors = { success: 'text-success', warning: 'text-warning', info: 'text-primary' };

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Relatórios diários e insights gerados automaticamente</p>
      </div>

      {/* Latest insights */}
      <div className="rounded-lg border border-border card-gradient p-5">
        <h2 className="text-sm font-semibold font-display text-foreground">Insights do Dia</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3 rounded-md border border-border bg-secondary/50 p-4"
            >
              <insight.icon className={`h-5 w-5 shrink-0 mt-0.5 ${typeColors[insight.type]}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{insight.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report history */}
      <div className="rounded-lg border border-border card-gradient overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold font-display text-foreground">Histórico de Relatórios</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Abertos</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Resolvidos</th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">SLA Violado</th>
              <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">CSAT</th>
              <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5 text-sm text-foreground">{r.date}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-foreground">{r.opened}</td>
                <td className="px-5 py-3.5 font-mono text-sm text-success">{r.resolved}</td>
                <td className="hidden px-5 py-3.5 font-mono text-sm sm:table-cell">
                  <span className={r.slaBreached > 0 ? 'text-destructive' : 'text-muted-foreground'}>{r.slaBreached}</span>
                </td>
                <td className="hidden px-5 py-3.5 font-mono text-sm text-warning sm:table-cell">{r.csat}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium ${r.status === 'Gerado' ? 'text-primary' : 'text-success'}`}>
                    {r.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
