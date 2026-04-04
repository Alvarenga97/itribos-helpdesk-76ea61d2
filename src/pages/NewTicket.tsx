import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCreateTicket } from '@/hooks/useTickets';
import { toast } from 'sonner';

export default function NewTicket() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({
        title: form.title,
        description: form.description,
        category_id: '',
        priority: form.priority,
      });
      toast.success('Chamado criado com sucesso!');
      navigate('/tickets');
    } catch {
      toast.error('Erro ao criar chamado. Tente novamente.');
    }
  };

  const inputClass = 'w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground">Novo Chamado</h1>
        <p className="mt-1 text-sm text-muted-foreground">Descreva seu problema e abriremos um chamado imediatamente.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
              <input
                required
                placeholder="Descreva o problema em uma frase"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
              <textarea
                required
                rows={5}
                placeholder="Detalhe o problema, incluindo passos para reproduzir..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-foreground mb-1.5">Prioridade</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className={inputClass}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createTicket.isPending ? 'Criando...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
