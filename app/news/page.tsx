import NewsPage from '../components/NewsPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function News() {
  return (
    <ProtectedRoute>
      <NewsPage />
    </ProtectedRoute>
  );
}

