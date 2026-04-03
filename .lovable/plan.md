

# Plano: Autenticação Supabase + Banco de Dados + CSAT Feedback

## Resumo
Criar toda a infraestrutura de banco de dados no Supabase (tabelas, RLS, triggers), implementar autenticação real com email/senha, migrar páginas de mock para dados reais, e adicionar formulário CSAT funcional.

---

## Etapa 1 — Migração SQL (banco de dados)

Criar em uma única migração:

**Tipos e tabelas:**
- Enum `app_role`: REQUESTER, AGENT, MANAGER, ADMIN
- Enum `ticket_status`: OPEN, IN_PROGRESS, WAITING_REQUESTER, RESOLVED, CLOSED
- Enum `ticket_priority`: LOW, MEDIUM, HIGH, CRITICAL
- `profiles` (id uuid PK → auth.users, name, email, avatar_url, created_at)
- `user_roles` (id, user_id → auth.users, role app_role, UNIQUE(user_id, role))
- `categories` (id, name, color)
- `tickets` (id, ticket_number serial, title, description, status, priority, category_id → categories, created_by → auth.users, assigned_to → auth.users nullable, sla_deadline, sla_breached, tags text[], created_at, resolved_at)
- `ticket_comments` (id, ticket_id → tickets, user_id → auth.users, content, is_internal bool, created_at)
- `csat_feedback` (id, ticket_id → tickets, user_id → auth.users, rating smallint CHECK 1-5, comment text nullable, created_at, UNIQUE(ticket_id, user_id))

**Funções helper (SECURITY DEFINER):**
- `has_role(uuid, app_role) → boolean`
- `is_agent_or_above(uuid) → boolean`
- `handle_new_user()` — trigger que cria profile + role REQUESTER automaticamente

**RLS policies:**
- profiles: leitura própria + agentes/managers/admins leem todos
- user_roles: leitura via has_role; inserção apenas admin
- categories: leitura para todos autenticados; escrita admin
- tickets: requesters veem próprios; agentes+ veem todos; insert por autenticados
- ticket_comments: baseado em acesso ao ticket; internos apenas agentes+
- csat_feedback: INSERT apenas dono do ticket se resolvido; SELECT dono + agentes+; sem UPDATE/DELETE

**Seed data:** categorias iniciais (Infraestrutura, Software, Rede, Segurança, Acesso)

---

## Etapa 2 — Autenticação

**Novos arquivos:**
- `src/contexts/AuthContext.tsx` — Provider com `onAuthStateChange`, expõe user, profile, role, signIn, signUp, signOut
- `src/components/ProtectedRoute.tsx` — redireciona para /login se não autenticado

**Arquivos editados:**
- `src/pages/Login.tsx` — chamar `supabase.auth.signInWithPassword`, exibir erros, redirecionar
- `src/App.tsx` — substituir RoleProvider por AuthProvider, envolver rotas com ProtectedRoute
- `src/components/AppLayout.tsx` — remover RoleSwitcher, usar role real do AuthContext, adicionar logout

---

## Etapa 3 — Migrar páginas para dados reais

**Novos hooks:**
- `src/hooks/useTickets.ts` — queries React Query + Supabase para listar/buscar tickets
- `src/hooks/useCsatFeedback.ts` — query + mutation para csat_feedback

**Páginas atualizadas:**
- `RequesterHome.tsx` — buscar tickets do usuário logado
- `Index.tsx` (Dashboard) — stats reais via queries
- `TicketList.tsx` — query com filtros reais
- `TicketDetail.tsx` — ticket + comments reais
- `NewTicket.tsx` — inserir ticket via Supabase

---

## Etapa 4 — Formulário CSAT

**Novo componente:** `src/components/CsatFeedbackForm.tsx`
- 5 estrelas clicáveis com hover + textarea opcional
- Mutation: INSERT em csat_feedback
- Toast de sucesso após envio
- Modo read-only após envio

**Integração em `TicketDetail.tsx`:**
- Condição: role === REQUESTER && status === RESOLVED && sem feedback existente
- Se já avaliou: exibe estrelas read-only
- Se não: exibe formulário
- Constraint UNIQUE(ticket_id, user_id) no banco impede duplicatas mesmo se UI falhar

---

## Detalhes Técnicos

- Constraint `UNIQUE(ticket_id, user_id)` é a garantia principal contra reavaliação
- `CHECK (rating >= 1 AND rating <= 5)` valida no banco
- Funções `SECURITY DEFINER` evitam recursão infinita em RLS
- Trigger `on_auth_user_created` cria perfil + role REQUESTER automaticamente
- AuthContext substitui completamente o RoleContext atual

