import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    if (role === 'HRD') {
      navigate('/onboarding'); // HRD must fill company info
    } else {
      navigate('/dashboard'); // Operator goes straight to dashboard
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to manage your job portal</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('HRD')}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-blue-100 hover:border-blue-500 rounded-xl transition-all duration-200 group hover:bg-blue-50"
          >
            <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600">
              <Building2 size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="block font-semibold text-gray-900">Login as HRD</span>
              <span className="block text-sm text-gray-500">Manage candidates & jobs</span>
            </div>
          </button>

          <button
            onClick={() => handleLogin('Operator')}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-green-100 hover:border-green-500 rounded-xl transition-all duration-200 group hover:bg-green-50"
          >
            <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600">
              <Briefcase size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="block font-semibold text-gray-900">Login as Operator</span>
              <span className="block text-sm text-gray-500">Post and manage job listings</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
