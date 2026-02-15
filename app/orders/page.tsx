import OrderHistoryPage from '../components/OrderHistoryPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function OrderHistory() {
  return (
    <ProtectedRoute>
      <OrderHistoryPage />
    </ProtectedRoute>
  );
}
