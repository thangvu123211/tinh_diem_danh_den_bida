import { Route } from 'react-router-dom';
import GuestLayout from '../../core/layouts/guest/guest-layout';
import TrangChu from './trang-chu/trang-chu';

export const guestRoutes = (
  <Route path="/" element={<GuestLayout />}>
    <Route index element={<TrangChu />} />
  </Route>
);
