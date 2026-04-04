

# Plano: Redesign Completo + Gestão de Usuários + Resumo STAR por IA

## Resumo
Reconstruir o design visual com a nova identidade corporativa (Teal/Azul/Verde), criar página de gestão de usuários para admin/agente, e implementar geração automática de resumo STAR via Edge Function com IA quando um chamado é resolvido.

---

## Parte 1 — Redesign da Identidade Visual

### 1.1 CSS/Tokens (`src/index.css`)
Substituir a paleta dark-mode atual por uma estética **light corporativa limpa**:
- `--primary`: Teal `#008080` (botões de ação)
- `--sidebar/header`: Azul Corporativo `#004080`
- `--success`: Verde Solução `#00A060`
- `--background`: Branco `#FAFBFC`
- `--card`: Branco `#FFFFFF` com sombra sutil
- `--border`: Cinza claro `#E2E8F0`
- `--foreground`: Cinza escuro `#1A202C`
- `--muted-foreground`: `#64748B`
- Fontes: Inter (body/display) + IBM Plex Mono (mono)
- `--radius`: `12px` (bordas suavemente arredondadas)
- Remover gradientes dark (card-gradient, bg-glow, glow-border)

### 1.2 Tailwind Config (`tailwind.config.ts`)
Atualizar `fontFamily` para usar Inter. Manter animações existentes.

### 1.3 Logo/Ícone Central — "Token da Resposta"
Criar componente `src/components/TicketzLogo.tsx` com ícone SVG: ticket sólido com checkmark branco integrado. Usado no sidebar, login e header.

### 1.4 Componentes atualizados visualmente (sem mudança de lógica):
- `AppLayout.tsx` — Sidebar com fundo Azul Corporativo (`#004080`), texto branco, item ativo com highlight Teal. Header branco com sombra sutil.
- `Login.tsx` — Fundo branco, card centralizado com sombra, botão Teal, logo "Token da Resposta".
- `StatCard.tsx` — Cards brancos com borda fina, ícone colorido, sem gradientes.
- `TicketBadges.tsx` — Badges com cores atualizadas (success = `#00A060`).
- `CsatFeedbackForm.tsx` — Adaptar cores para o tema light.
- `Index.tsx` (Dashboard) — **Simplificar para 3 métricas**: Abertos, Em Andamento, Resolvidos. Remover SLA e performance do dashboard principal.
- `NewTicket.tsx` — **Simplificar**: apenas Título, Descrição e Prioridade (remover categoria e anexos do formulário inicial). Campo de categoria se torna opcional.
- `RequesterHome.tsx`, `TicketList.tsx`, `TicketDetail.tsx`, `Reports.tsx`, `Settings.tsx` — Adaptar para tema light e novas cores.

---

## Parte 2 — Página de Gestão de Usuários

### 2.1 Nova rota e página
- Rota: `/users` (apenas para AGENT, MANAGER, ADMIN)
- Arquivo: `src/pages/UserManagement.tsx`

### 2.2 Funcionalidades
- **Listar todos os usuários**: tabela com nome, email, role, data de criação
- **Criar usuário**: modal/formulário com nome, email, senha, role (usa `supabase.auth.admin` via Edge Function)
- **Editar role**: dropdown para alterar role do usuário (INSERT/DELETE em user_roles)
- **Desativar usuário**: marcar como inativo (via Edge Function para `admin.deleteUser` ou flag)

### 2.3 Edge Function: `manage-users`
- Endpoint para criar usuários (`supabase.auth.admin.createUser`) e alterar roles
- Usa `SUPABASE_SERVICE_ROLE_KEY` para operações admin
- Valida que o chamador tem role ADMIN ou AGENT antes de executar

### 2.4 Hook: `src/hooks/useUsers.ts`
- `useUsers()` — lista profiles + roles
- `useCreateUser()` — chama edge function
- `useUpdateUserRole()` — atualiza user_roles

### 2.5 Navegação
- Adicionar item "Usuários" no `analystNav` do `AppLayout.tsx`
- Adicionar rota `/users` no `App.tsx` com `ProtectedRoute`
- Adicionar case `users` no `RoleRouter.tsx`

---

## Parte 3 — Resumo STAR Automático por IA

### 3.1 Tabela `star_summaries` (migração SQL)
```
id uuid PK default gen_random_uuid()
ticket_id uuid FK tickets UNIQUE
situation text
task text
action text
result text
created_at timestamptz default now()
```
RLS: SELECT para dono do ticket + agentes+; INSERT/UPDATE bloqueado (apenas via edge function com service role).

### 3.2 Edge Function: `generate-star-summary`
- Trigger: chamada pelo frontend quando `useUpdateTicketStatus` muda para `RESOLVED`
- Input: `ticket_id`
- Lógica:
  1. Busca ticket (título, descrição) + comentários do ticket
  2. Monta prompt para IA solicitando resumo STAR em português
  3. Chama API de IA (OpenAI ou similar via `LOVABLE_API_KEY` ou nova secret `OPENAI_API_KEY`)
  4. Insere resultado em `star_summaries`
- Retorna o resumo gerado

### 3.3 Hook: `src/hooks/useStarSummary.ts`
- `useStarSummary(ticketId)` — busca resumo existente
- Chamado no `TicketDetail.tsx` para exibir o resumo

### 3.4 Integração no frontend
- `TicketDetail.tsx`: após resolver, chama edge function para gerar STAR. Exibe seção "Resumo STAR" com os 4 campos (Situação, Tarefa, Ação, Resultado) em cards coloridos.
- `useUpdateTicketStatus`: após sucesso ao resolver, dispara `generate-star-summary`

### 3.5 Secret necessária
- `OPENAI_API_KEY` — precisa ser configurada pelo usuário no Supabase

---

## Arquivos Novos
- `src/components/TicketzLogo.tsx`
- `src/pages/UserManagement.tsx`
- `src/hooks/useUsers.ts`
- `src/hooks/useStarSummary.ts`
- `supabase/functions/manage-users/index.ts`
- `supabase/functions/generate-star-summary/index.ts`
- Migração SQL (tabela `star_summaries`)

## Arquivos Editados
- `src/index.css` — nova paleta light corporativa
- `tailwind.config.ts` — fonte Inter
- `src/App.tsx` — r