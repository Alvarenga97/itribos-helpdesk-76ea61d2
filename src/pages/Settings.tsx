import { motion } from 'framer-motion';

export default function SettingsPage() {
  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie as configurações da organização</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Organização</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
              <input defaultValue="Empresa Tech Ltda" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
              <input defaultValue="empresa-tech" className={inputClass} disabled />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Relatório Diário</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Horário</label>
              <input type="time" defaultValue="18:00" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fuso Horário</label>
              <select defaultValue="America/Sao_Paulo" className={inputClass}>
                <option>America/Sao_Paulo</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Webhook</label>
              <input placeholder="https://hooks.slack.com/..." className={inputClass} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Regras de SLA</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Prioridade</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Primeira Resposta</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Resolução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { priority: 'Crítica', response: '15 min', resolution: '2h' },
                { priority: 'Alta', response: '30 min', resolution: '4h' },
                { priority: 'Média', response: '2h', resolution: '24h' },
                { priority: 'Baixa', response: '4h', resolution: '48h' },
              ].map(rule => (
                <tr key={rule.priority}>
                  <td className="py-3 text-sm text-foreground">{rule.priority}</td>
                  <td className="py-3 font-mono text-sm text-muted-foreground">{rule.response}</td>
                  <td className="py-3 font-mono text-sm text-muted-foreground">{rule.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
}
