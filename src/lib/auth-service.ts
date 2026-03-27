import { db } from './db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'REQUESTER' | 'AGENT' | 'MANAGER' | 'ADMIN';
  avatarUrl?: string | null;
}

const SESSION_KEY = 'itribos_auth_session';

export const authService = {
  async login(email: string, password: string): Promise<AuthUser | null> {
    console.log(`Tentando login para: ${email}`);
    
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      console.warn('Usuário não encontrado');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.warn('Senha inválida');
      return null;
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AuthUser['role'],
      avatarUrl: user.avatarUrl,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    return authUser;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/login';
  },

  getCurrentUser(): AuthUser | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
};
