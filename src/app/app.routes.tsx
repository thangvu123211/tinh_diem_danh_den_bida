import { Navigate, Route, Routes } from 'react-router-dom';
import { guestRoutes } from './features/guest/guest.routes';

export default function AppRoutes() {
  return (
    <Routes>
      {guestRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
