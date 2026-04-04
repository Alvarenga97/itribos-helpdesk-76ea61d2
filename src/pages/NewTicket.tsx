import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload } from 'lucide-react';
import { useCategories, useCreateTicket } from '@/hooks/useTickets';
import { toast } from 'sonner';

export default function NewTicket() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const createTicket = useCreateTicket();
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', priority: 'MEDIUM' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({
        title: form.title,
        description: form.description,
        category_id: form.categoryId,
        priority: form.priority,
      });
      toast.success('Chamado criado com sucesso!');
      navigate('/tickets');
    } catch {
      toast.error('Erro ao criar chamado. Tente novamente.');
    }
  };

  const inputClass = 'w-full rounded-md border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring';
  const labelClass = 'block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-foreground">Novo Chamado</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preencha os dados para abrir um chamado de suporte.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="rounded-lg border border-border card-gradient p-6 space-y-5">
            <div>
              <label className={labelClass}>Título</label>
              <input
                required
                placeholder="Descreva o problema em uma frase"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Descrição</label>
              <textarea
                required
                rows={5}
                placeholder="Detalhe o problema, incluindo passos para reproduzir..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Categoria</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Selecionar...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Prioridade</label>
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

            <div>
              <label className={labelClass}>Anexos</label>
              <div className="flex items-center justify-center rounded-md border-2 border-dashed border-border bg-secondary/50 py-8 transition-colors hover:border-primary/30 cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Arraste arquivos ou clique para selecionar</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF, imagens, logs (máx. 10MB)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createTicket.isPending ? 'Criando...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
