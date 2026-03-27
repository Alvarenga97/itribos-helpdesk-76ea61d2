import { db } from './db';
import { tickets, users, categories, ticketComments, starSummaries } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Ticket, TicketComment, StarSummary } from '@/types/ticket';

export const ticketService = {
  async getAllTickets() {
    return await db.query.tickets.findMany({
      with: {
        category: true,
        requester: true,
        assignee: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });
  },

  async getTicketById(id: string) {
    return await db.query.tickets.findFirst({
      where: eq(tickets.id, id),
      with: {
        category: true,
        requester: true,
        assignee: true,
        comments: {
          with: {
            author: true,
          },
        },
        starSummary: true,
      },
    });
  },

  async createTicket(data: any) {
    const [newTicket] = await db.insert(tickets).values(data).returning();
    return newTicket;
  },

  async addComment(data: any) {
    const [newComment] = await db.insert(ticketComments).values(data).returning();
    return newComment;
  },

  async updateTicketStatus(id: string, status: any) {
    return await db.update(tickets)
      .set({ status })
      .where(eq(tickets.id, id))
      .returning();
  },

  async getAllCategories() {
    return await db.query.categories.findMany();
  },

  async getRecentComments(ticketId: string, limit = 5) {
    return await db.query.ticketComments.findMany({
      where: eq(ticketComments.ticketId, ticketId),
      with: {
        author: true,
      },
      orderBy: [desc(ticketComments.createdAt)],
      limit,
    });
  },
};
