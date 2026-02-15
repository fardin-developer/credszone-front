import ProfileDashboardPage from '../components/ProfileDashboardPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function ProfileDashboard() {
  return (
    <ProtectedRoute>
      <ProfileDashboardPage />
    </ProtectedRoute>
  );
}
