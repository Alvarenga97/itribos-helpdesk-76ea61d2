import type { User, Category, Ticket, TicketComment, StarSummary } from '@/types/ticket';

export const mockUsers: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@empresa.com', role: 'REQUESTER', avatarUrl: '' },
  { id: '2', name: 'Carlos Mendes', email: 'carlos@empresa.com', role: 'AGENT', avatarUrl: '' },
  { id: '3', name: 'Juliana Costa', email: 'juliana@empresa.com', role: 'MANAGER', avatarUrl: '' },
  { id: '4', name: 'Roberto Lima', email: 'roberto@empresa.com', role: 'AGENT', avatarUrl: '' },
  { id: '5', name: 'Mariana Oliveira', email: 'mariana@empresa.com', role: 'REQUESTER', avatarUrl: '' },
];

export const mockCategories: Category[] = [
  { id: '1', name: 'Infraestrutura', color: '#3B82F6' },
  { id: '2', name: 'Software', color: '#8B5CF6' },
  { id: '3', name: 'Rede', color: '#F59E0B' },
  { id: '4', name: 'Segurança', color: '#EF4444' },
  { id: '5', name: 'Acesso', color: '#10B981' },
];

export const mockTickets: Ticket[] = [
  {
    id: '1', ticketNumber: 1042, title: 'Servidor de produção com alta latência',
    description: 'O servidor principal está apresentando tempos de resposta acima de 5s nas últimas 2 horas.',
    status: 'IN_PROGRESS', priority: 'CRITICAL', category: mockCategories[0],
    requester: mockUsers[0], assignee: mockUsers[1],
    slaDeadline: '2026-03-25T16:00:00', slaBreached: false,
    createdAt: '2026-03-25T10:30:00', tags: ['produção', 'urgente'],
  },
  {
    id: '2', ticketNumber: 1041, title: 'Atualização do antivírus corporativo',
    description: 'Necessário atualizar o antivírus em todas as estações do departamento financeiro.',
    status: 'OPEN', priority: 'MEDIUM', category: mockCategories[3],
    requester: mockUsers[4], assignee: undefined,
    slaDeadline: '2026-03-26T18:00:00', slaBreached: false,
    createdAt: '2026-03-25T09:15:00', tags: ['segurança'],
  },
  {
    id: '3', ticketNumber: 1040, title: 'VPN não conecta no home office',
    description: 'Desde ontem não consigo conectar na VPN corporativa. Já tentei reiniciar o cliente.',
    status: 'WAITING_REQUESTER', priority: 'HIGH', category: mockCategories[2],
    requester: mockUsers[0], assignee: mockUsers[3],
    slaDeadline: '2026-03-25T14:00:00', slaBreached: true,
    createdAt: '2026-03-24T16:00:00', tags: ['vpn', 'remoto'],
  },
  {
    id: '4', ticketNumber: 1039, title: 'Acesso ao sistema ERP para novo colaborador',
    description: 'Solicito criação de acesso ao ERP para o colaborador João Pedro, matrícula 4521.',
    status: 'RESOLVED', priority: 'LOW', category: mockCategories[4],
    requester: mockUsers[4], assignee: mockUsers[1],
    slaDeadline: '2026-03-26T18:00:00', slaBreached: false,
    createdAt: '2026-03-24T08:00:00', resolvedAt: '2026-03-25T11:00:00',
    csatScore: 5, tags: ['onboarding'],
  },
  {
    id: '5', ticketNumber: 1038, title: 'Impressora do 3º andar com defeito',
    description: 'A impressora HP LaserJet do 3º andar está atolando papel constantemente.',
    status: 'CLOSED', priority: 'LOW', category: mockCategories[0],
    requester: mockUsers[0], assignee: mockUsers[3],
    slaDeadline: '2026-03-25T18:00:00', slaBreached: false,
    createdAt: '2026-03-23T14:00:00', resolvedAt: '2026-03-24T10:00:00',
    csatScore: 4, tags: ['hardware'],
  },
  {
    id: '6', ticketNumber: 1037, title: 'Erro 500 no portal de vendas',
    description: 'O portal está retornando erro 500 intermitente ao gerar relatórios.',
    status: 'IN_PROGRESS', priority: 'HIGH', category: mockCategories[1],
    requester: mockUsers[4], assignee: mockUsers[1],
    slaDeadline: '2026-03-25T15:00:00', slaBreached: false,
    createdAt: '2026-03-25T08:00:00', tags: ['portal', 'bug'],
  },
  {
    id: '7', ticketNumber: 1036, title: 'Configuração de e-mail no celular',
    description: 'Preciso configurar o e-mail corporativo no meu celular novo (iPhone 15).',
    status: 'OPEN', priority: 'LOW', category: mockCategories[1],
    requester: mockUsers[0], assignee: undefined,
    slaDeadline: '2026-03-27T18:00:00', slaBreached: false,
    createdAt: '2026-03-25T11:00:00', tags: ['mobile'],
  },
];

export const mockComments: TicketComment[] = [
  { id: '1', ticketId: '1', author: mockUsers[1], content: 'Identificado gargalo no banco de dados. Iniciando análise dos índices.', isInternal: true, createdAt: '2026-03-25T11:00:00' },
  { id: '2', ticketId: '1', author: mockUsers[1], content: 'Estamos investigando o problema. Em breve teremos uma atualização.', isInternal: false, createdAt: '2026-03-25T11:05:00' },
  { id: '3', ticketId: '3', author: mockUsers[3], content: 'Qual versão do cliente VPN está instalada?', isInternal: false, createdAt: '2026-03-24T17:00:00' },
];

export const mockStarSummary: StarSummary = {
  id: '1', ticketId: '4',
  situation: 'Novo colaborador João Pedro (matrícula 4521) precisava de acesso ao sistema ERP para iniciar suas atividades no departamento financeiro.',
  task: 'Criar credenciais de acesso ao ERP com perfil financeiro júnior. SLA de 48h úteis. Responsável: Carlos Mendes.',
  action: 'Verificadas as permissões necessárias com o gestor do departamento. Criada conta no ERP com perfil FIN-JR. Configurados acessos aos módulos de contas a pagar e receber. Realizado teste de login com sucesso.',
  result: 'Acesso criado e validado em 27h (dentro do SLA de 48h). Colaborador confirmou funcionamento. CSAT: 5/5.',
  createdAt: '2026-03-25T11:05:00',
};

export const currentUser: User = mockUsers[1]; // Agent logged in
