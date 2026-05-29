import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CheckCircle2, Clock, MapPin, XCircle, BrainCircuit, CalendarClock, ExternalLink, FileText, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function StatusLamaran() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [timeFilter, setTimeFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/applications/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setApplications(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const filteredApps = applications.filter(app => {
    let statusMatch = true;
    if (statusFilter !== 'Semua') {
      if (statusFilter === 'Seleksi Berkas') statusMatch = app.status === 'Menunggu';
      else if (statusFilter === 'Lolos Psikotest') statusMatch = app.status === 'Psikotes';
      else if (statusFilter === 'Lolos Interview') statusMatch = app.status === 'Interview';
      else statusMatch = app.status === statusFilter;
    }
    
    let timeMatch = true;
    const appDate = new Date(app.created_at);
    const now = new Date();
    const diffDays = Math.ceil((now - appDate) / (1000 * 60 * 60 * 24));
    
    if (timeFilter === '14 Hari') timeMatch = diffDays <= 14;
    else if (timeFilter === '1 Bulan') timeMatch = diffDays <= 30;
    else if (timeFilter === '3 Bulan') timeMatch = diffDays <= 90;

    return statusMatch && timeMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ditolak': return 'text-red-500 bg-red-50 border-red-200';
      case 'Diterima': return 'text-green-500 bg-green-50 border-green-200';
      case 'Interview': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'Psikotes': return 'text-purple-500 bg-purple-50 border-purple-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getProgressSteps = (app) => {
    const steps = [
      { label: 'Terkirim', completed: true },
      { label: 'Seleksi Berkas', completed: app.status !== 'Menunggu', current: app.status === 'Menunggu' },
      { label: 'Psikotest', required: app.psikotes === 1, completed: app.status === 'Interview' || app.status === 'Diterima', current: app.status === 'Psikotes' },
      { label: 'Interview', completed: app.status === 'Diterima', current: app.status === 'Interview' },
      { label: 'Hasil', completed: app.status === 'Diterima' || app.status === 'Ditolak', current: app.status === 'Diterima' || app.status === 'Ditolak' }
    ];
    return steps.filter(s => s.required !== false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Status Lamaran</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Lamaran</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Semua">Semua</option>
            <option value="Terkirim">Terkirim</option>
            <option value="Seleksi Berkas">Lolos Seleksi Berkas</option>
            <option value="Lolos Psikotest">Lolos Psikotest</option>
            <option value="Lolos Interview">Lolos Interview</option>
            <option value="Diterima">Diterima</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Jangka Waktu</label>
          <select 
            value={timeFilter} 
            onChange={e => setTimeFilter(e.target.value)}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Semua">Semua Waktu</option>
            <option value="14 Hari">14 Hari Terakhir</option>
            <option value="1 Bulan">1 Bulan Terakhir</option>
            <option value="3 Bulan">3 Bulan Terakhir</option>
          </select>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <div className="w-48 h-48 bg-gray-50 rounded-full mb-6 flex items-center justify-center">
            {/* Simple fallback illustration */}
            <div className="text-gray-300 relative">
              <FileText size={80} />
              <Search className="absolute -bottom-2 -right-2 text-gray-400" size={40} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada lamaran</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Kamu belum memiliki riwayat lamaran yang sesuai dengan filter. Ayo mulai cari lowongan impianmu!</p>
          <Link to="/pelamar/dashboard" className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Cari Lowongan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl font-bold text-gray-400">
                    C
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{app.job_title}</h3>
                    <p className="text-gray-500 mb-2">Company Name (Dirahasiakan)</p>
                    <div className="flex gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><MapPin size={14}/> {app.job_location}</span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Clock size={14}/> Dilamar {new Date(app.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                  {app.status === 'Menunggu' ? 'Seleksi Berkas' : app.status}
                </div>
              </div>
              
              {/* Progress Timeline */}
              <div className="p-6 bg-gray-50/50">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                  <div className="relative z-10 flex justify-between">
                    {getProgressSteps(app).map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-2 transition-colors
                          ${step.completed ? 'bg-green-500 text-white' : step.current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}
                        `}>
                          {step.completed ? <CheckCircle2 size={16} /> : step.current && app.status === 'Ditolak' ? <XCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className={`text-xs font-medium text-center max-w-[80px]
                          ${step.completed ? 'text-green-600' : step.current ? (app.status === 'Ditolak' ? 'text-red-600' : 'text-blue-600') : 'text-gray-400'}
                        `}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Actions for specific statuses */}
                {app.status === 'Psikotes' && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-purple-900 flex items-center gap-2"><BrainCircuit size={18}/> Anda diundang mengikuti Psikotest</h4>
                      <p className="text-sm text-purple-700 mt-1">Silakan selesaikan psikotest untuk melanjutkan ke tahap berikutnya.</p>
                    </div>
                    <Link to={`/pelamar/psikotest/${app.id}`} className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Mulai Psikotest
                    </Link>
                  </div>
                )}

                {app.status === 'Interview' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900 flex items-center gap-2"><CalendarClock size={18}/> Undangan Interview Online</h4>
                      <p className="text-sm text-blue-700 mt-1">HRD telah menjadwalkan atau membuka ruang meeting untuk Anda.</p>
                    </div>
                    {/* Re-using the same InterviewRoom component from HRD but joining as Pelamar */}
                    <button 
                      onClick={() => navigate(`/interview-room/${app.user_id}?roomName=Interview+${encodeURIComponent(app.job_title)}`)} 
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={18} /> Gabung Meeting
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
