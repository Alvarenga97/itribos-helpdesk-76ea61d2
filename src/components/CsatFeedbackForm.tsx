import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitCsatFeedback, useCsatFeedback } from '@/hooks/useCsatFeedback';
import { toast } from 'sonner';

interface Props {
  ticketId: string;
}

export default function CsatFeedbackForm({ ticketId }: Props) {
  const { data: existingFeedback, isLoading } = useCsatFeedback(ticketId);
  const submitMutation = useSubmitCsatFeedback();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  if (isLoading) return null;

  if (existingFeedback) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4">
        <p className="text-sm font-medium text-foreground">Sua avaliação</p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn('h-5 w-5', i < existingFeedback.rating ? 'fill-warning text-warning' : 'text-border')} />
          ))}
          <span className="ml-2 text-sm font-medium text-foreground">{existingFeedback.rating}/5</span>
        </div>
        {existingFeedback.comment && <p className="mt-2 text-sm text-muted-foreground">{existingFeedback.comment}</p>}
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Selecione uma nota de 1 a 5 estrelas'); return; }
    try {
      await submitMutation.mutateAsync({ ticket_id: ticketId, rating, comment: comment.trim() || undefined });
      toast.success('Avaliação enviada com sucesso!');
    } catch { toast.error('Erro ao enviar avaliação.'); }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-medium text-foreground">Como foi o atendimento?</p>
      <p className="mt-1 text-xs text-muted-foreground">Avalie de 1 a 5 estrelas</p>
      <div className="mt-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)} onMouseEnter={() => setHoveredRating(i + 1)} onMouseLeave={() => setHoveredRating(0)} className="transition-colors">
            <Star className={cn('h-6 w-6', i < (hoveredRating || rating) ? 'fill-warning text-warning' : 'text-border hover:text-warning/50')} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário opcional..."
        rows={2}
        className="mt-3 w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}
