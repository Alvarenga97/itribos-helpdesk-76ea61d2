import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserRole } from '@/types/ticket';
import { mockUsers } from '@/data/mock';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: typeof mockUsers[0];
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('AGENT');

  // Pick a user matching the current role
  const currentUser = role === 'REQUESTER'
    ? mockUsers.find(u => u.role === 'REQUESTER')!
    : role === 'MANAGER'
      ? mockUsers.find(u => u.role === 'MANAGER')!
      : mockUsers.find(u => u.role === 'AGENT')!;

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
