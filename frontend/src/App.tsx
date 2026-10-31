import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ForgotPasswordView } from './features/auth/ForgotPasswordView';
import { LoginView } from './features/auth/LoginView';
import { RegisterView } from './features/auth/RegisterView';
import { ExplorerView } from './features/explorer/ExplorerView';
import { ProfileView } from './features/profile/ProfileView';
import { ProtectedRoute, PublicRoute } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
          </Route>

          {/* Protected Main Workspace Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppShell />}>
              {/* Use index route for '/' */}
              <Route index element={<ExplorerView />} />
              <Route path="profile" element={<ProfileView />} />
            </Route>
          </Route>

          {/* Catch-all: Redirect unmatched routes to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
