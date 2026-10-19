import React, { useLayoutEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useSession } from './hooks/useSession';
import { getHasAccount } from './lib/accountFlag';
import { supabase } from './lib/supabase';
import {
  applyTheme,
  clearTheme,
  watchSystemTheme,
} from './lib/theme';

import { InstallProvider } from './InstallContext';
import { PullToRefreshProvider } from './hooks/RefreshContext';

import LandingPage from './screens/LandingPage.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Income from './screens/Income.jsx';
import Expenses from './screens/Expenses.jsx';
import Family from './screens/Family.jsx';
import Goals from './screens/Goals.jsx';
import NetWorth from './screens/NetWorth.jsx';
import Settings from './screens/Settings.jsx';
import Profile from './screens/Profile.jsx';

import Sidebar from './components/Sidebar.jsx';
import { BalanceVisibilityProvider } from './components/BalanceVisibility.jsx';

const SCREENS = [
  'dashboard',
  'income',
  'expenses',
  'family',
  'goals',
  'networth',
  'settings',
  'profile',
];

// --- 1. PROTECTED ROUTE ---
function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{ padding: 20, textAlign: 'center' }}
      >
        Loading Anchor...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

// --- 2. ROOT ROUTE ---
function RootRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{ padding: 20, textAlign: 'center' }}
      >
        Loading Anchor...
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app" replace />;
  }

  if (getHasAccount()) {
    return <Navigate to="/signin" replace />;
  }

  return <LandingPage />;
}

// --- 3. APP LAYOUT ---
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // React Router removes the configured basename from location.pathname.
  // Therefore, this works on both GitHub Pages and Vercel.
  const segments = location.pathname
    .split('/')
    .filter(Boolean);

  const segment = segments[segments.length - 1];

  if (!SCREENS.includes(segment)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const activeScreen = segment;

  const setScreen = (key) => {
    if (SCREENS.includes(key)) {
      navigate(`/app/${key}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to log out:', error.message);
      return;
    }

    // Preserve the existing account flag.
    // React Router automatically respects the configured basename.
    navigate('/signin', { replace: true });
  };

  return (
    <div className="app">
      <Sidebar
        activeScreen={activeScreen}
        setScreen={setScreen}
        onLogout={handleLogout}
      />

      <PullToRefreshProvider>
        <main className="main">
          {activeScreen === 'dashboard' && <Dashboard />}
          {activeScreen === 'income' && <Income />}
          {activeScreen === 'expenses' && <Expenses />}
          {activeScreen === 'family' && <Family />}
          {activeScreen === 'goals' && <Goals />}
          {activeScreen === 'networth' && <NetWorth />}
          {activeScreen === 'settings' && <Settings />}
          {activeScreen === 'profile' && (
            <Profile onLogout={handleLogout} />
          )}
        </main>
      </PullToRefreshProvider>
    </div>
  );
}

// --- 4. THEME SCOPE ---
function ThemeScope({ children }) {
  useLayoutEffect(() => {
    applyTheme();

    const stopWatching = watchSystemTheme(applyTheme);

    return () => {
      stopWatching();
      clearTheme();
    };
  }, []);

  return children;
}

// --- 5. MAIN APP & ROUTING ---
export default function App() {
  // Vite BASE_URL is '/anchor-vault/' on GitHub Pages
  // and normally '/' on Vercel.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <InstallProvider>
      <BalanceVisibilityProvider>
        <Router basename={basename}>
          <Routes>
            {/* Smart entry point */}
            <Route path="/" element={<RootRoute />} />

            {/* Public pages */}
            <Route path="/home" element={<LandingPage />} />
            <Route
              path="/signin"
              element={<AuthScreen defaultMode="signin" />}
            />
            <Route
              path="/signup"
              element={<AuthScreen defaultMode="signup" />}
            />

            {/* Protected application */}
            <Route
              path="/app/*"
              element={
                <ThemeScope>
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                </ThemeScope>
              }
            />

            {/* Unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </BalanceVisibilityProvider>
    </InstallProvider>
  );
}
