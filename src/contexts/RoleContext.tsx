import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '@/types/ticket';
import { mockUsers } from '@/data/mock';

interface RoleContextType {
  role: UserRole;
  currentUser: User;
  isAuthenticated: boolean;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (user: User) => void;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([...mockUsers]);

  const currentUser = users.find(u => u.id === currentUserId) ?? users[0];
  const isAuthenticated = currentUserId !== null;
  const role = currentUser.role;

  const login = (userId: string) => setCurrentUserId(userId);
  const logout = () => setCurrentUserId(null);

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  return (
    <RoleContext.Provider value={{ role, currentUser, isAuthenticated, users, login, logout, updateUserRole, addUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
