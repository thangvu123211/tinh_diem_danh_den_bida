import { ConfirmProvider } from './shared/confirm-dialog/confirm-dialog';
import AppRoutes from './app.routes';

export default function App() {
  return (
    <ConfirmProvider>
      <AppRoutes />
    </ConfirmProvider>
  );
}
