import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, MessageSquare, Lock, Sparkles, Trash2, UserCheck, RotateCcw } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { useTicket, useTicketComments, useAddComment, useUpdateTicketStatus, useDeleteTicket, useAssignTicket, useCategories } from '@/hooks/useTickets';
import { useAuth } from '@/contexts/AuthContext';
import CsatFeedbackForm from '@/components/CsatFeedbackForm';
import { useStarSummary, useGenerateStarSummary } from '@/hooks/useStarSummary';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, user } = useAuth();
  const isRequester = role === 'REQUESTER';
  const { data: ticket, isLoading } = useTicket(id);
  const { data: comments = [] } = useTicketComments(id);
  const { data: starSummary } = useStarSummary(id);
  const { data: categories = [] } = useCategories();
  const addComment = useAddComment();
  const updateStatus = useUpdateTicketStatus();
  const deleteTicket = useDeleteTicket();
  const assignTicket = useAssignTicket();
  const generateStar = useGenerateStarSummary();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">Carregando...</div>;
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Chamado não encontrado</p>
        <Link to={isRequester ? '/' : '/tickets'} className="mt-4 text-sm text-primary hover:underline">Voltar</Link>
      </div>
    );
  }

  const slaTime = ticket.sla_deadline ? new Date(ticket.sla_deadline) : null;
  const isTicketOwner = user?.id === ticket.created_by;
  const isAssignedToMe = ticket.assigned_to === user?.id;
  const isUnassigned = !ticket.assigned_to;

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ ticket_id: ticket.id, content: commentText.trim(), is_internal: isInternal });
      setCommentText('');
      setIsInternal(false);
      toast.success('Comentário enviado');
    } catch {
      toast.error('Erro ao enviar comentário');
    }
  };

  const handleResolve = async () => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status: 'RESOLVED' });
      toast.success('Chamado resolvido');
      generateStar.mutate(ticket.id);
    } catch {
      toast.error('Erro ao resolver chamado');
    }
  };

  const handleReopen = async () => {
    try {
      await updateStatus.mutateAsync({ id: ticket.id, status: 'IN_PROGRESS' });
      toast.success('Chamado reaberto');
    } catch {
      toast.error('Erro ao reabrir chamado');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast.success('Chamado excluído');
      navigate('/tickets');
    } catch {
      toast.error('Erro ao excluir chamado');
    }
  };

  const handleAssignToMe = async () => {
    if (!user) return;
    try {
      await assignTicket.mutateAsync({ id: ticket.id, userId: user.id });
      toast.success('Chamado atribuído a você');
    } catch {
      toast.error('Erro ao atribuir chamado');
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ category_id: categoryId || null })
        .eq('id', ticket.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Categoria atualizada');
    } catch {
      toast.error('Erro ao atualizar categoria');
    }
  };

  const starFields = starSummary ? [
    { label: 'Situação', value: starSummary.situation, color: 'border-l-primary' },
    { label: 'Tarefa', value: starSummary.task, color: 'border-l-warning' },
    { label: 'Ação', value: starSummary.action, color: 'border-l-info' },
    { label: 'Resultado', value: starSummary.result, color: 'border-l-success' },
  ] : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to={isRequester ? '/' : '/tickets'} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">#{ticket.ticket_number}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.sla_breached && !isRequester && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                SLA Violado
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-display text-foreground">{ticket.title}</h1>

          <div className="flex flex-wrap items-center gap-2">
            {/* Assign to me */}
            {!isRequester && (isUnassigned || !isAssignedToMe) && ticket.status !== 'CLOSED' && (
              <button
                onClick={handleAssignToMe}
                disabled={assignTicket.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                {assignTicket.isPending ? 'Atribuindo...' : 'Atribuir a mim'}
              </button>
            )}

            {/* Resolve */}
            {!isRequester && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
              <button
                onClick={handleResolve}
                disabled={updateStatus.isPending}
                className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Resolvendo...' : 'Resolver Chamado'}
              </button>
            )}

            {/* Reopen */}
            {!isRequester && ticket.status === 'RESOLVED' && (
              <button
                onClick={handleReopen}
                disabled={updateStatus.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-medium text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                {updateStatus.isPending ? 'Reabrindo...' : 'Reabrir Chamado'}
              </button>
            )}

            {/* Delete */}
            {!isRequester && (
              <>
                {showDeleteConfirm ? (
                  <div className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                    <span className="text-xs text-destructive font-medium">Tem certeza?</span>
                    <button
                      onClick={handleDelete}
                      disabled={deleteTicket.isPending}
                      className="rounded bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {deleteTicket.isPending ? 'Excluindo...' : 'Sim, excluir'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                )}
              </>
            )}
          </div>

          {isRequester && isTicketOwner && ticket.status === 'RESOLVED' && (
            <CsatFeedbackForm ticketId={ticket.id} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Sidebar info */}
          <div className="order-first lg:order-last space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold font-display text-foreground">Detalhes</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-3">
                {!isRequester && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Solicitante</span>
                    <div className="mt-1 flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{ticket.requester_profile?.name || 'Desconhecido'}</span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {isRequester ? 'Analista responsável' : 'Atribuído a'}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{ticket.assignee_profile?.name || 'Aguardando atribuição'}</span>
                  </div>
                </div>

                {/* Category dropdown for agents */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
                  {!isRequester ? (
                    <select
                      value={ticket.category_id || ''}
                      onChange={e => handleCategoryChange(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <option value="">Sem categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  ) : ticket.category ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                      <span className="text-sm text-foreground">{ticket.category.name}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground italic">Não definida</p>
                  )}
                </div>

                {!isRequester && slaTime && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo SLA</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className={cn('h-3.5 w-3.5', ticket.sla_breached ? 'text-destructive' : 'text-muted-foreground')} />
                      <span className={cn('text-sm', ticket.sla_breached ? 'text-destructive font-medium' : 'text-foreground')}>
                        {slaTime.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Criado em</span>
                  <p className="mt-1 text-sm text-foreground">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
                </div>
                {ticket.resolved_at && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolvido em</span>
                    <p className="mt-1 text-sm text-foreground">{new Date(ticket.resolved_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold font-display text-foreground">Descrição</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{ticket.description}</p>
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ticket.tags.map(tag => (
                    <span key={tag} className="rounded-lg border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* STAR Summary */}
            {starSummary && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold font-display text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Resumo STAR
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starFields.map(f => (
                    <div key={f.label} className={cn('rounded-lg border border-border bg-muted/50 p-3 border-l-4', f.color)}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</p>
                      <p className="mt-1.5 text-sm text-foreground leading-relaxed">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {generateStar.isPending && (
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
                <Sparkles className="mx-auto h-5 w-5 text-primary animate-pulse" />
                <p className="mt-2 text-sm text-muted-foreground">Gerando resumo STAR com IA...</p>
              </div>
            )}

            {/* Comments */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold font-display text-foreground">
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Comentários ({comments.length})
              </h3>
              {comments.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className={cn('rounded-lg border p-3 sm:p-4', comment.is_internal ? 'border-warning/30 bg-warning/5' : 'border-border bg-muted/50')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {comment.author?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                        </div>
                        <span className="text-xs font-medium text-foreground">{comment.author?.name || 'Desconhecido'}</span>
                        {comment.is_internal && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-warning">
                            <Lock className="h-3 w-3" /> Interno
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-secondary-foreground">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Nenhum comentário ainda.</p>
              )}

              <div className="mt-4 space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={isRequester ? 'Enviar uma mensagem...' : 'Adicionar comentário...'}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  {!isRequester ? (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded border-border" />
                      <Lock className="h-3 w-3" /> Nota interna
                    </label>
                  ) : <span />}
                  <button
                    onClick={handleSendComment}
                    disabled={addComment.isPending || !commentText.trim()}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {addComment.isPending ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
