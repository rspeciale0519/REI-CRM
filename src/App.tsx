import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Contacts from './pages/Contacts';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AcceptInvite from '@/pages/AcceptInvite';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/app/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/app/login" element={<Login />} />
            <Route path="/app/signup" element={<Signup />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            
            {/* Protected routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="deals" element={<Deals />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="search" element={<Search />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
