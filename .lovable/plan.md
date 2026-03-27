

# Plano: Sistema de Acesso por Perfil com Gestão pelo Analista

## Resumo

Remover o RoleSwitcher do header (que hoje qualquer pessoa pode alternar) e implementar um fluxo de login onde cada usuário tem um perfil fixo. Apenas o Analista (AGENT) terá acesso a uma tela de gerenciamento de usuários para criar contas e definir papéis.

## O que muda

### 1. Login com seleção de usuário (mock)
- Reformular a tela de Login para exibir os usuários mock como opções de login (cards clicáveis com nome, email e papel)
- Ao clicar, o sistema define o papel no RoleContext e redireciona para `/`
- Manter campos de email/senha como visual, mas o login efetivo é pela seleção do usuário mock

### 2. Remover RoleSwitcher do header
- Remover o componente `RoleSwitcher` do `AppLayout.tsx`
- O papel passa a ser definido exclusivamente no login
- Adicionar botão de logout no header/sidebar que limpa o contexto e volta para `/login`

### 3. Nova página: Gestão de Usuários (`/users`)
- Acessível apenas pelo Analista (AGENT) e Gestor (MANAGER)
- Tabela com todos os usuários mock: nome, email, papel atual
- Botão para alterar o papel de cada usuário (dropdown: REQUESTER, AGENT, MANAGER)
- Botão "Novo Usuário" com formulário simples (nome, email, papel)
- Dados mantidos em estado local (mock)

### 4. Atualizar navegação e rotas
- Adicionar item "Usuários" no menu lateral (ícone `Users`) apenas para AGENT/MANAGER
- Nova rota `/users` no `App.tsx` com proteção via `RoleRouter`
- Requester que tenta acessar `/users` é redirecionado para `/`

### 5. Proteger rotas com redirecionamento
- Se nenhum usuário está logado (role não definido), redirecionar todas as rotas para `/login`
- Adicionar estado `isAuthenticated` no RoleContext

## Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `src/contexts/RoleContext.tsx` | Adicionar `isAuthenticated`, `login()`, `logout()` |
| `src/pages/Login.tsx` | Redesenhar com cards de usuário para login |
| `src/components/AppLayout.tsx` | Remover RoleSwitcher, adicionar logout, item "Usuários" |
| `src/pages/Users.tsx` | **Novo** — tela de gestão de usuários |
| `src/components/RoleRouter.tsx` | Adicionar case `users`, proteger rota |
| `src/App.tsx` | Adicionar rota `/users`, wrapper de autenticação |
| `src/components/RoleSwitcher.tsx` | Removido do header (arquivo pode ser mantido ou deletado) |

