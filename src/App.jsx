import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import PasswordGate, { hasAccess } from '@/components/PasswordGate';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ApprovalConfirmed from '@/pages/ApprovalConfirmed';

// App pages
import Welcome from '@/pages/Welcome';
import Company from '@/pages/Company';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import NearbyMap from '@/pages/NearbyMap';
import Messages from '@/pages/Messages';
import Chat from '@/pages/Chat';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import UserDetail from '@/pages/UserDetail';
import SettingsPage from '@/pages/SettingsPage';
import Premium from '@/pages/Premium';
import EditProfile from '@/pages/EditProfile';
import AdminPanel from '@/pages/AdminPanel';
import PlatinumFeed from '@/pages/PlatinumFeed';
import Leaderboard from '@/pages/Leaderboard';
import AppLayout from '@/components/nex/AppLayout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[hsl(0,0%,4%)]">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/company" element={<Company />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/approved" element={<ApprovalConfirmed />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/welcome" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/user/:userId" element={<UserDetail />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/admin" element={<AdminPanel />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<NearbyMap />} />
          <Route path="/discover" element={<Home />} />
          <Route path="/platinum-lounge" element={<PlatinumFeed />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/map" element={<NearbyMap />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const isPublicPath = window.location.pathname === '/company' ||
    window.location.pathname.startsWith('/legal/');

  if (!hasAccess() && !isPublicPath) {
    return <PasswordGate />;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App