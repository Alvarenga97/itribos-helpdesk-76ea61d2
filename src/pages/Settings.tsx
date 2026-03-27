import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  const inputClass = 'w-full rounded-md border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';
  const labelClass = 'block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie as configurações da organização</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Organization */}
        <div className="rounded-lg border border-border card-gradient p-6 space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Organização</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nome</label>
              <input defaultValue="Empresa Tech Ltda" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input defaultValue="empresa-tech" className={inputClass} disabled />
            </div>
          </div>
        </div>

        {/* EOD Report */}
        <div className="rounded-lg border border-border card-gradient p-6 space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Relatório Diário</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Horário</label>
              <input type="time" defaultValue="18:00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fuso Horário</label>
              <select defaultValue="America/Sao_Paulo" className={inputClass}>
                <option>America/Sao_Paulo</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Webhook (Slack/Teams)</label>
              <input placeholder="https://hooks.slack.com/..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* SLA Rules */}
        <div className="rounded-lg border border-border card-gradient p-6 space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Regras de SLA</h2>
          <div className="overflow-x-auto">
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
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </motion.div>
    </div>
  );
}
