import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyInfoForm from './pages/CompanyInfoForm';
import MainLayout from './layouts/MainLayout';
import PelamarLayout from './layouts/PelamarLayout';
import DashboardHome from './pages/DashboardHome';
import DashboardPelamar from './pages/DashboardPelamar';
import ProfilePelamar from './pages/ProfilePelamar';
import Lowongan from './pages/Lowongan';
import Pelamar from './pages/Pelamar';
import Wawancara from './pages/Wawancara';
import Rekomendasi from './pages/Rekomendasi';
import KelolaPsikotes from './pages/KelolaPsikotes';
import PesanSupport from './pages/PesanSupport';
import InterviewRoom from './pages/InterviewRoom';
import StatusLamaran from './pages/StatusLamaran';
import PsikotestPelamar from './pages/PsikotestPelamar';
import Pengaturan from './pages/Pengaturan';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireRole && user.role !== requireRole) {
    // Redirect based on their actual role
    if (user.role === 'Pelamar') return <Navigate to="/pelamar/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // If HRD hasn't filled company info, force them to onboarding
  if (user.role === 'HRD' && !user.companyInfo && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Pelamar') return <Navigate to="/pelamar/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute requireRole="HRD">
            <CompanyInfoForm />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/interview-room/:id" 
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        } 
      />

      {/* Pelamar Routes wrapped in PelamarLayout */}
      <Route 
        path="/pelamar" 
        element={
          <ProtectedRoute requireRole="Pelamar">
            <PelamarLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPelamar />} />
        <Route path="profile" element={<ProfilePelamar />} />
        <Route path="status-lamaran" element={<StatusLamaran />} />
        <Route path="psikotest/:id" element={<PsikotestPelamar />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Dashboard Routes wrapped in MainLayout (HRD & Operator) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="lowongan" element={<Lowongan />} />
        <Route path="data-pelamar" element={<Pelamar />} />
        <Route path="wawancara" element={<Wawancara />} />
        <Route path="rekomendasi" element={<Rekomendasi />} />
        <Route path="kelola-psikotes" element={<ProtectedRoute requireRole="Operator"><KelolaPsikotes /></ProtectedRoute>} />
        <Route path="pesan-support" element={<ProtectedRoute requireRole="Operator"><PesanSupport /></ProtectedRoute>} />
        <Route path="pengaturan" element={<Pengaturan />} />
        <Route path="informasi" element={<div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 mt-4 mx-4">Halaman Informasi (Segera Hadir)</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
