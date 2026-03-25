export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_REQUESTER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'REQUESTER' | 'AGENT' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: Category;
  requester: User;
  assignee?: User;
  slaDeadline?: string;
  slaBreached: boolean;
  createdAt: string;
  resolvedAt?: string;
  csatScore?: number;
  tags: string[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  author: User;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface StarSummary {
  id: string;
  ticketId: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  reportDate: string;
  totalOpened: number;
  totalResolved: number;
  totalPending: number;
  totalSlaBreached: number;
  avgResolutionMinutes?: number;
  avgCsatScore?: number;
}
