import LeaderboardPage from '../components/LeaderboardPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Leaderboard() {
  return (
    <ProtectedRoute>
      <LeaderboardPage />
    </ProtectedRoute>
  );
}
