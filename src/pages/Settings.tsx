import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [orgName, setOrgName] = useState('');
  const [reportTime, setReportTime] = useState('18:00');
  const [reportTimezone, setReportTimezone] = useState('America/Sao_Paulo');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sla, setSla] = useState({
    critical_response: '15 min', critical_resolution: '2h',
    high_response: '30 min', high_resolution: '4h',
    medium_response: '2h', medium_resolution: '24h',
    low_response: '4h', low_resolution: '48h',
  });

  useEffect(() => {
    if (settings) {
      setOrgName(settings.org_name);
      setReportTime(settings.report_time);
      setReportTimezone(settings.report_timezone);
      setWebhookUrl(settings.webhook_url);
      setSla({
        critical_response: settings.sla_critical_response,
        critical_resolution: settings.sla_critical_resolution,
        high_response: settings.sla_high_response,
        high_resolution: settings.sla_high_resolution,
        medium_response: settings.sla_medium_response,
        medium_resolution: settings.sla_medium_resolution,
        low_response: settings.sla_low_response,
        low_resolution: settings.sla_low_resolution,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        org_name: orgName,
        org_slug: orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        report_time: reportTime,
        report_timezone: reportTimezone,
        webhook_url: webhookUrl,
        sla_critical_response: sla.critical_response,
        sla_critical_resolution: sla.critical_resolution,
        sla_high_response: sla.high_response,
        sla_high_resolution: sla.high_resolution,
        sla_medium_response: sla.medium_response,
        sla_medium_resolution: sla.medium_resolution,
        sla_low_response: sla.low_response,
        sla_low_resolution: sla.low_resolution,
      });
      toast.success('Configurações salvas com sucesso!');
    } catch {
      toast.error('Erro ao salvar configurações');
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20';

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Carregando configurações...</div>;
  }

  const slaRows = [
    { label: 'Crítica', responseKey: 'critical_response' as const, resolutionKey: 'critical_resolution' as const },
    { label: 'Alta', responseKey: 'high_response' as const, resolutionKey: 'high_resolution' as const },
    { label: 'Média', responseKey: 'medium_response' as const, resolutionKey: 'medium_resolution' as const },
    { label: 'Baixa', responseKey: 'low_response' as const, resolutionKey: 'low_resolution' as const },
  ];

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
              <input value={orgName} onChange={e => setOrgName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
              <input value={orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')} className={inputClass} disabled />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold font-display text-foreground">Relatório Diário</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Horário</label>
              <input type="time" value={reportTime} onChange={e => setReportTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Fuso Horário</label>
              <select value={reportTimezone} onChange={e => setReportTimezone(e.target.value)} className={inputClass}>
                <option>America/Sao_Paulo</option>
                <option>America/New_York</option>
                <option>America/Chicago</option>
                <option>Europe/London</option>
                <option>Europe/Berlin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Webhook</label>
              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/..." className={inputClass} />
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
              {slaRows.map(row => (
                <tr key={row.label}>
                  <td className="py-3 text-sm text-foreground">{row.label}</td>
                  <td className="py-3">
                    <input
                      value={sla[row.responseKey]}
                      onChange={e => setSla(prev => ({ ...prev, [row.responseKey]: e.target.value }))}
                      className="w-24 rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </td>
                  <td className="py-3">
                    <input
                      value={sla[row.resolutionKey]}
                      onChange={e => setSla(prev => ({ ...prev, [row.resolutionKey]: e.target.value }))}
                      className="w-24 rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
