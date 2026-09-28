import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SuspenseFallback from './components/SuspenseFallback';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Materials = lazy(() => import('./pages/Materials'));
const Finances = lazy(() => import('./pages/Finances'));
const Profile = lazy(() => import('./pages/Profile'));

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1234567890-example.apps.googleusercontent.com';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="timetable" element={<Timetable />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="materials" element={<Materials />} />
                <Route path="finances" element={<Finances />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

