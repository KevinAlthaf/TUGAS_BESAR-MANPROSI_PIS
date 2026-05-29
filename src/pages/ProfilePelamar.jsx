import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, User, Save, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePelamar() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    skills: user?.profile?.skills?.join(', ') || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        skills: formData.skills.split(',').map(s => s.trim())
      });
      // We also could update user name/phone but auth context might need a different method
      // For now, updateProfile in AuthContext handles nested profile objects
      setIsSaving(false);
      alert("Profil berhasil diperbarui!");
    }, 600);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        updateProfile({ cvUrl: file.name });
        setIsUploading(false);
        alert("CV berhasil diunggah!");
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
        <button 
          onClick={() => navigate('/pelamar/dashboard')}
          className="text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CV Upload Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <User size={48} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name || 'Pelamar'}</h2>
            <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Curriculum Vitae
              </h3>
              
              {user?.profile?.cvUrl ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-1">
                    <CheckCircle2 size={16} /> CV Terunggah
                  </div>
                  <p className="text-sm text-green-600 truncate">{user.profile.cvUrl}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  Unggah CV Anda untuk menggunakan fitur "Cari Berdasarkan CV"
                </p>
              )}

              <label className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer transition-colors ${
                isUploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium'
              }`}>
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    {user?.profile?.cvUrl ? 'Perbarui CV' : 'Unggah CV'}
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={isUploading} />
              </label>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Personal</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed" 
                    disabled
                  />
                  <p className="text-xs text-gray-400 mt-1">Nama tidak dapat diubah setelah registrasi.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed" 
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keahlian (Skills)</label>
                <textarea 
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="Contoh: React, Node.js, Microsoft Excel, Public Speaking" 
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <p className="text-xs text-gray-500 mt-1">Pisahkan dengan koma (,)</p>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl transition-colors flex items-center gap-2"
                >
                  {isSaving ? 'Menyimpan...' : (
                    <>
                      <Save size={18} /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
