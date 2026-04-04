import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import TicketList from '@/pages/TicketList';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import UserManagement from '@/pages/UserManagement';
import RequesterHome from '@/pages/requester/RequesterHome';
import { Navigate } from 'react-router-dom';

interface Props {
  page: 'home' | 'tickets' | 'reports' | 'settings' | 'users';
}

export default function RoleRouter({ page }: Props) {
  const { role } = useAuth();
  const isRequester = role === 'REQUESTER';

  switch (page) {
    case 'home':
      return isRequester ? <RequesterHome /> : <Index />;
    case 'tickets':
      return isRequester ? <Navigate to="/" replace /> : <TicketList />;
    case 'reports':
      return isRequester ? <Navigate to="/" replace /> : <Reports />;
    case 'settings':
      return isRequester ? <Navigate to="/" replace /> : <Settings />;
    case 'users':
      return isRequester ? <Navigate to="/" replace /> : <UserManagement />;
    default:
      return null;
  }
}
