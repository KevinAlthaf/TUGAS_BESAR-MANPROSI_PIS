import React from 'react';
import { Calendar, CheckCircle, XCircle, BrainCircuit, Star, AlertCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function Wawancara() {
  const { applicants, jobs, updateApplicantStatus } = useData();

  const interviewCandidates = applicants.filter(a => a.status === 'Interview');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Hasil & Keputusan Wawancara</h2>
        <p className="text-gray-500 text-sm mt-1">Tinjau ringkasan hasil interview dari sistem dan tentukan keputusan akhir kandidat.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {interviewCandidates.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum ada kandidat</h3>
            <p className="text-gray-500 text-sm">Pilih pelamar yang lolos seleksi di halaman Pelamar untuk menjadwalkan wawancara.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {interviewCandidates.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <div key={app.id} className="border border-gray-100 rounded-xl p-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white flex flex-col h-full">
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          <p className="text-sm text-gray-500">{job?.title}</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 bg-gray-50/50">
                    {app.interviewSummary ? (
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor Interview</span>
                            <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">
                              <Star size={16} className="fill-green-500" /> {app.interviewSummary.score}/100
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Catatan Interviewer</span>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 italic shadow-sm">
                              "{app.interviewSummary.notes}"
                            </p>
                         </div>
                         <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Kesimpulan Sistem</span>
                            <div className={`text-sm font-medium px-3 py-2.5 rounded-lg flex items-center gap-2 border
                              ${app.interviewSummary.conclusion === 'Layak Diterima' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                            `}>
                              <BrainCircuit size={16} className={app.interviewSummary.conclusion === 'Layak Diterima' ? 'text-green-600' : 'text-yellow-600'} /> 
                              {app.interviewSummary.conclusion}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-6">
                        <AlertCircle size={24} className="text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Menunggu Hasil Interview</p>
                        <p className="text-xs text-gray-500 mt-1 px-4">Sistem sedang memproses rekam jejak wawancara kandidat ini.</p>
                      </div>
                    )}
                  </div>

                  {app.status === 'Interview' && (
                    <div className="px-5 pb-4 bg-gray-50/50">
                      <Link 
                        to={`/interview-room/${app.id}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
                      >
                        <Video size={18} /> Masuk Ruang Interview
                      </Link>
                    </div>
                  )}

                  <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                    <button 
                      onClick={() => updateApplicantStatus(app.id, 'Ditolak')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors text-sm font-bold"
                    >
                      <XCircle size={18} /> Tolak
                    </button>
                    <button 
                      onClick={() => updateApplicantStatus(app.id, 'Diterima')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold shadow-sm hover:shadow"
                    >
                      <CheckCircle size={18} /> Terima
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
