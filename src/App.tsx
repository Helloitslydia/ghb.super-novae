import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Recording from './pages/Recording';
import NewRecording from './pages/NewRecording.tsx';
import DocumentUpload from './pages/DocumentUpload';
import DocumentStatus from './pages/DocumentStatus';
import Admin from './pages/Admin';
import AdminGBH from './pages/AdminGBH';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ContactWidget } from './components/ContactWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-gbh" element={<AdminGBH />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/upload-docs"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentupload"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application"
            element={
              <ProtectedRoute>
                <DocumentStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recording/:id"
            element={
              <ProtectedRoute>
                <Recording />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-recording"
            element={
              <ProtectedRoute>
                <NewRecording />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <ContactWidget />
    </AuthProvider>
  );
}

export default App;