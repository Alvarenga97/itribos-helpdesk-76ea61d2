import { useRole } from '@/contexts/RoleContext';
import Index from '@/pages/Index';
import TicketList from '@/pages/TicketList';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import UsersPage from '@/pages/Users';
import RequesterHome from '@/pages/requester/RequesterHome';
import { Navigate } from 'react-router-dom';

interface Props {
  page: 'home' | 'tickets' | 'reports' | 'settings' | 'users';
}

export default function RoleRouter({ page }: Props) {
  const { role } = useRole();
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
      return (role === 'AGENT' || role === 'MANAGER') ? <UsersPage /> : <Navigate to="/" replace />;
    default:
      return null;
  }
}
