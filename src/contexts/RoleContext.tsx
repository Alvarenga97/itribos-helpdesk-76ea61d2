import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '@/types/ticket';
import { authService, AuthUser } from '@/lib/auth-service';

interface RoleContextType {
  role: UserRole;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (authUser: AuthUser) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());

  const login = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const role = user?.role || 'REQUESTER';

  return (
    <RoleContext.Provider value={{ 
      role, 
      currentUser: user, 
      isAuthenticated: !!user,
      login, 
      logout 
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
