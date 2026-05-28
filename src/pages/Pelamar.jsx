import React, { useState } from 'react';
import { Users, Filter, CheckCircle, XCircle, CalendarClock, BrainCircuit, FileText, ChevronRight, X, ThumbsUp, ThumbsDown, Video, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';

export default function Pelamar() {
  const { applicants, jobs, updateApplicantStatus } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse jobId from query params if present
  const queryParams = new URLSearchParams(location.search);
  const initialJobId = queryParams.get('jobId') || 'All';

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterJob, setFilterJob] = useState(initialJobId);
  const [selectedAiMatch, setSelectedAiMatch] = useState(null);
  
  // Meeting Modal State
  const [meetingModal, setMeetingModal] = useState({ isOpen: false, applicantId: null, type: null });
  const [roomName, setRoomName] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const openMeetingModal = (applicantId) => {
    setMeetingModal({ isOpen: true, applicantId, type: null });
    setRoomName('');
    setMeetingDate('');
    setMeetingTime('');
  };

  const handleCreateMeeting = () => {
    if (meetingModal.type === 'now') {
      if (!roomName) return alert('Nama room harus diisi!');
      navigate(`/interview-room/${meetingModal.applicantId}?roomName=${encodeURIComponent(roomName)}`);
    } else if (meetingModal.type === 'scheduled') {
      if (!meetingDate || !meetingTime) return alert('Tanggal dan Jam harus diisi!');
      alert(`Jadwal meeting berhasil disimpan untuk tanggal ${meetingDate} jam ${meetingTime}`);
      setMeetingModal({ isOpen: false, applicantId: null, type: null });
    }
  };

  const filteredApplicants = applicants.filter(a => {
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    const matchJob = filterJob === 'All' || a.jobId.toString() === filterJob.toString();
    return matchStatus && matchJob;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daftar Pelamar</h2>
          <p className="text-gray-500 text-sm mt-1">Kelola dan review CV pelamar yang masuk ke lowongan Anda.</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={filterJob} 
            onChange={(e) => setFilterJob(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="All">Semua Lowongan</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Interview">Interview</option>
            <option value="Psikotes">Psikotes</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredApplicants.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada pelamar</h3>
            <p className="text-gray-500 text-sm">Tidak ditemukan pelamar dengan kriteria ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Pelamar</th>
                  <th className="px-6 py-4 font-semibold">Lowongan</th>
                  <th className="px-6 py-4 font-semibold">AI Match</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApplicants.map((app) => {
                  const job = jobs.find(j => j.id === app.jobId);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {app.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{app.name}</p>
                            <p className="text-xs text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                              <FileText size={12} /> Lihat CV
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{job?.title || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedAiMatch(app)} 
                          className="flex items-center gap-2 hover:bg-blue-50 p-2 -ml-2 rounded-lg transition-colors group"
                          title="Lihat Detail Analisis AI"
                        >
                          <BrainCircuit size={16} className={app.matchScore >= 85 ? 'text-green-500' : 'text-yellow-500'} />
                          <span className={`font-semibold ${app.matchScore >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {app.matchScore}%
                          </span>
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${app.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${app.status === 'Interview' ? 'bg-blue-100 text-blue-700' : ''}
                          ${app.status === 'Psikotes' ? 'bg-purple-100 text-purple-700' : ''}
                          ${app.status === 'Ditolak' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'Menunggu' && (
                            <>
                              <button 
                                onClick={() => updateApplicantStatus(app.id, 'Interview')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lanjut Interview"
                              >
                                <CalendarClock size={20} />
                              </button>
                              <button 
                                onClick={() => updateApplicantStatus(app.id, 'Psikotes')}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Lanjut Psikotes"
                              >
                                <BrainCircuit size={20} />
                              </button>
                              <button 
                                onClick={() => updateApplicantStatus(app.id, 'Ditolak')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Tolak"
                              >
                                <XCircle size={20} />
                              </button>
                            </>
                          )}
                          {app.status === 'Interview' && (
                            <button 
                              onClick={() => openMeetingModal(app.id)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                            >
                              Buat Room
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Match Details Modal */}
      {selectedAiMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start text-white">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BrainCircuit /> Analisis AI
                </h3>
                <p className="text-blue-100 text-sm mt-1">Kecocokan CV {selectedAiMatch.name} dengan Requirement</p>
              </div>
              <button onClick={() => setSelectedAiMatch(null)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-2 ${selectedAiMatch.matchScore >= 85 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {selectedAiMatch.matchScore}%
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Match Score</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 font-semibold text-green-800 mb-3">
                    <ThumbsUp size={18} className="text-green-500" /> Poin Kelebihan
                  </h4>
                  <ul className="space-y-2">
                    {selectedAiMatch.aiMatchDetails?.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span> {s}
                      </li>
                    ))}
                    {!selectedAiMatch.aiMatchDetails && <li className="text-sm text-green-700 italic">Data tidak tersedia</li>}
                  </ul>
                </div>
                
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                  <h4 className="flex items-center gap-2 font-semibold text-red-800 mb-3">
                    <ThumbsDown size={18} className="text-red-500" /> Poin Kekurangan / Gap
                  </h4>
                  <ul className="space-y-2">
                    {selectedAiMatch.aiMatchDetails?.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span> {w}
                      </li>
                    ))}
                    {!selectedAiMatch.aiMatchDetails && <li className="text-sm text-red-700 italic">Data tidak tersedia</li>}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Kesimpulan AI:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic border border-gray-100">
                  "{selectedAiMatch.aiMatchDetails?.conclusion || 'Menunggu analisis lebih lanjut.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Meeting Modal */}
      {meetingModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Buat Room Interview</h3>
              <button onClick={() => setMeetingModal({ isOpen: false, applicantId: null, type: null })} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!meetingModal.type ? (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setMeetingModal(prev => ({ ...prev, type: 'now' }))}
                    className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Video size={24} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-700">Meeting Sekarang</span>
                  </button>
                  <button 
                    onClick={() => setMeetingModal(prev => ({ ...prev, type: 'scheduled' }))}
                    className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Calendar size={24} />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-green-700">Meeting Terjadwal</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => setMeetingModal(prev => ({ ...prev, type: null }))}
                    className="text-sm text-blue-600 hover:underline mb-2 inline-block"
                  >
                    &larr; Kembali
                  </button>
                  
                  {meetingModal.type === 'now' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Room Meeting</label>
                      <input 
                        type="text" 
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Contoh: Interview Frontend Dev"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  )}

                  {meetingModal.type === 'scheduled' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Meeting</label>
                        <input 
                          type="date" 
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                        <input 
                          type="time" 
                          value={meetingTime}
                          onChange={(e) => setMeetingTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleCreateMeeting}
                    className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors ${meetingModal.type === 'now' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {meetingModal.type === 'now' ? 'Masuk ke Room' : 'Simpan Jadwal'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
