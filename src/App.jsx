import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import CompanyInfoForm from './pages/CompanyInfoForm';
import MainLayout from './layouts/MainLayout';
import DashboardHome from './pages/DashboardHome';
import Lowongan from './pages/Lowongan';
import Pelamar from './pages/Pelamar';
import Wawancara from './pages/Wawancara';
import Rekomendasi from './pages/Rekomendasi';
import KelolaPsikotes from './pages/KelolaPsikotes';
import PesanSupport from './pages/PesanSupport';
import InterviewRoom from './pages/InterviewRoom';
import Pengaturan from './pages/Pengaturan';

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // If HRD hasn't filled company info, force them to onboarding
  if (user.role === 'HRD' && !user.companyInfo && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
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

      {/* Dashboard Routes wrapped in MainLayout */}
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
        <Route path="pelamar" element={<Pelamar />} />
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
