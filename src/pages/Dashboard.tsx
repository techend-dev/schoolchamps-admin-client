import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './dashboard/AdminDashboard';
import WriterDashboard from './dashboard/WriterDashboard';
import SchoolDashboard from './dashboard/SchoolDashboard';
import MarketerDashboard from './dashboard/MarketerDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'writer':
      return <WriterDashboard />;
    case 'school':
      return <SchoolDashboard />;
    case 'marketer':
      return <MarketerDashboard />;
    default:
      return <SchoolDashboard />;
  }
}
