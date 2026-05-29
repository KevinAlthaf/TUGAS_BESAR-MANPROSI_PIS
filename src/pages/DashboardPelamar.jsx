import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, SlidersHorizontal, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPelamar() {
  const { jobs } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cvMatchMode, setCvMatchMode] = useState(false);

  // Helper to safely get jobs
  const activeJobs = (jobs || []).filter(j => j.status === 'Active' || j.status === 'Dibuka');

  const handleCvMatch = () => {
    if (!user?.profile?.cvUrl) {
      alert("Anda belum mengunggah CV. Silakan unggah CV Anda di halaman Profil terlebih dahulu.");
      navigate('/pelamar/profile');
    } else {
      setCvMatchMode(true);
    }
  };

  // Mock categorizations
  let promotedJobs = activeJobs.slice(0, 3);
  let s1Jobs = activeJobs.filter(j => j.description?.toLowerCase().includes('s1') || j.title?.toLowerCase().includes('manager')).slice(0, 3);
  let otherJobs = activeJobs.slice(0, 4);

  if (cvMatchMode) {
    // If CV match is active, just mock filtering the jobs
    promotedJobs = activeJobs.filter(j => Math.random() > 0.5).slice(0, 3);
    s1Jobs = [];
    otherJobs = activeJobs.filter(j => Math.random() > 0.5).slice(0, 4);
  }

  const JobCard = ({ job, matchScore }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow relative">
      {matchScore && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <CheckCircle2 size={12} /> {matchScore}% Cocok
        </div>
      )}
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-gray-400">{job.company?.charAt(0) || 'C'}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 leading-tight">{job.title}</h4>
          <p className="text-sm text-gray-500 mb-2">{job.company || 'Perusahaan Dirahasiakan'}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              <MapPin size={12} className="mr-1" /> {job.location || 'Remote'}
            </span>
            <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Full-time
            </span>
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-400">Diperbarui hari ini</span>
            <button className="text-blue-600 font-medium text-sm hover:underline">Lihat Detail</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-[#0052cc] text-white pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Cari Loker Makin Mudah dan <span className="text-yellow-400">#Cuan</span></h1>
            <p className="text-blue-100">Info Loker Terbaru & Terpercaya</p>
          </div>

          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto">
            <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-3">
              <Search className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Cari nama pekerjaan/perusahaan" 
                className="w-full text-gray-800 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-3">
              <MapPin className="text-gray-400 mr-2" size={20} />
              <input 
                type="text" 
                placeholder="Semua Lokasi" 
                className="w-full text-gray-800 focus:outline-none"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors whitespace-nowrap">
              Cari
            </button>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button className="flex items-center gap-2 text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 transition-all">
              <SlidersHorizontal size={16} /> Filter
            </button>
            <button 
              onClick={handleCvMatch}
              className={`flex items-center gap-2 text-sm text-white px-4 py-2 rounded-full border transition-all ${
                cvMatchMode ? 'bg-green-500 border-green-500' : 'bg-white/10 hover:bg-white/20 border-white/20'
              }`}
            >
              <FileText size={16} /> {cvMatchMode ? 'Mode CV Aktif' : 'Cari Berdasarkan CV'}
            </button>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-12 -right-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 -mt-6 relative z-10">
        
        {cvMatchMode && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-green-800">Menampilkan Lowongan Relevan dengan CV Anda</h3>
              <p className="text-sm text-green-600">Sistem telah menganalisis CV Anda dan menemukan kecocokan berikut.</p>
            </div>
            <button onClick={() => setCvMatchMode(false)} className="text-sm text-green-700 font-medium hover:underline">
              Matikan Mode
            </button>
          </div>
        )}

        {/* Section 1 */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-gray-900">{cvMatchMode ? 'Top Rekomendasi' : 'Lowongan Dipromosikan'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotedJobs.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} matchScore={cvMatchMode ? 90 + idx : null} />
            ))}
            {promotedJobs.length === 0 && <div className="col-span-full p-4 text-center text-gray-500 bg-white rounded-xl border border-dashed">Belum ada lowongan.</div>}
          </div>
        </div>

        {/* Banner CTA */}
        {!cvMatchMode && (
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl mb-1">Buat dan review CV dalam satu genggaman.</h3>
                <p className="text-sm text-blue-100 mb-4">Coba fitur terbaru untuk tingkatkan peluang kerja.</p>
                <button onClick={() => navigate('/pelamar/profile')} className="bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors">
                  Upload CV Sekarang
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl mb-1">Masuk dan lengkapi data dirimu, yuk!</h3>
                <p className="text-sm text-orange-100 mb-4">Klik untuk masuk dan permudah proses lamaranmu.</p>
                <button onClick={() => navigate('/pelamar/profile')} className="bg-white text-orange-600 text-sm font-bold px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
                  Lengkapi Profil
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 2 */}
        {!cvMatchMode && s1Jobs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lowongan Pilihan S1 / Manajerial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {s1Jobs.map((job, idx) => (
                <JobCard key={job.id || idx} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Section 3 */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{cvMatchMode ? 'Rekomendasi Lainnya' : 'Mungkin Kamu Tertarik'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherJobs.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} matchScore={cvMatchMode ? 75 + Math.floor(Math.random()*15) : null} />
            ))}
            {otherJobs.length === 0 && <div className="col-span-full p-4 text-center text-gray-500 bg-white rounded-xl border border-dashed">Belum ada lowongan.</div>}
          </div>
          
          {otherJobs.length > 0 && (
            <div className="text-center mt-8">
              <button className="bg-blue-50 text-blue-600 font-semibold px-6 py-2.5 rounded-full hover:bg-blue-100 transition-colors">
                Lihat Lebih Banyak
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
