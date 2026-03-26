import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, MessageSquare, Paperclip, Star, Lock } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/TicketBadges';
import { mockTickets, mockComments, mockStarSummary } from '@/data/mock';
import { cn } from '@/lib/utils';

export default function TicketDetail() {
  const { id } = useParams();
  const ticket = mockTickets.find(t => t.id === id);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-foreground">Chamado não encontrado</p>
        <Link to="/tickets" className="mt-4 text-sm text-primary hover:underline">Voltar aos chamados</Link>
      </div>
    );
  }

  const comments = mockComments.filter(c => c.ticketId === ticket.id);
  const star = ticket.id === '4' ? mockStarSummary : null;
  const slaTime = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">#{ticket.ticketNumber}</span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.slaBreached && (
              <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                SLA Violado
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-display text-foreground">{ticket.title}</h1>
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <button className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Resolver Chamado
            </button>
          )}
        </div>

        {/* Details panel on mobile first, then grid on lg */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Sidebar info - shows first on mobile */}
          <div className="order-first lg:order-last space-y-4">
            <div className="rounded-lg border border-border card-gradient p-4 sm:p-5">
              <h3 className="text-sm font-semibold font-display text-foreground">Detalhes</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Solicitante</span>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{ticket.requester.name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Atribuído a</span>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{ticket.assignee?.name || 'Não atribuído'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                    <span className="text-sm text-foreground">{ticket.category.name}</span>
                  </div>
                </div>
                {slaTime && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Prazo SLA</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Clock className={cn('h-3.5 w-3.5', ticket.slaBreached ? 'text-destructive' : 'text-muted-foreground')} />
                      <span className={cn('text-sm', ticket.slaBreached ? 'text-destructive font-medium' : 'text-foreground')}>
                        {slaTime.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Criado em</span>
                  <p className="mt-1 text-sm text-foreground">{new Date(ticket.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolvido em</span>
                    <p className="mt-1 text-sm text-foreground">{new Date(ticket.resolvedAt).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                {ticket.csatScore && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">CSAT</span>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-4 w-4', i < ticket.csatScore! ? 'fill-warning text-warning' : 'text-border')} />
                      ))}
                      <span className="ml-1 text-sm font-medium text-foreground">{ticket.csatScore}/5</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="rounded-lg border border-border card-gradient p-4 sm:p-5">
              <h3 className="text-sm font-semibold font-display text-foreground">Descrição</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{ticket.description}</p>
              {ticket.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {ticket.tags.map(tag => (
                    <span key={tag} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* STAR Summary */}
            {star && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold font-display text-foreground">Resumo STAR</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { letter: 'S', title: 'Situação', content: star.situation },
                    { letter: 'T', title: 'Tarefa', content: star.task },
                    { letter: 'A', title: 'Ação', content: star.action },
                    { letter: 'R', title: 'Resultado', content: star.result },
                  ].map(block => (
                    <div key={block.letter} className="rounded-md border border-border bg-card p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-warning/20 text-xs font-bold text-warning">
                          {block.letter}
                        </span>
                        <span className="text-xs font-semibold text-foreground">{block.title}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{block.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="rounded-lg border border-border card-gradient p-4 sm:p-5">
              <h3 className="text-sm font-semibold font-display text-foreground">
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Comentários ({comments.length})
              </h3>
              {comments.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className={cn('rounded-md border p-3 sm:p-4', comment.isInternal ? 'border-warning/20 bg-warning/5' : 'border-border bg-secondary/50')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
                          {comment.author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs font-medium text-foreground">{comment.author.name}</span>
                        {comment.isInternal && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-warning">
                            <Lock className="h-3 w-3" /> Interno
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-secondary-foreground">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Nenhum comentário ainda.</p>
              )}

              {/* Add comment */}
              <div className="mt-4 space-y-3">
                <textarea
                  placeholder="Adicionar comentário..."
                  className="w-full rounded-md border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="rounded border-border" />
                    <Lock className="h-3 w-3" /> Nota interna
                  </label>
                  <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                    Enviar
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
