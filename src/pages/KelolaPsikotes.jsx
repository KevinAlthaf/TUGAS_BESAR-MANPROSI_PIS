import React, { useState } from 'react';
import { FileQuestion, Plus, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function KelolaPsikotes() {
  const { psychotestPackages, addPsychotestPackage } = useData();
  const [newPackage, setNewPackage] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newPackage.trim()) {
      addPsychotestPackage(newPackage.trim());
      setNewPackage('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileQuestion className="text-blue-500" />
          Kelola Paket Psikotes
        </h2>
        <p className="text-gray-500 text-sm mt-1">Tambahkan pilihan soal psikotes yang bisa digunakan HRD saat memposting lowongan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Tambah Paket Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Paket</label>
                <input 
                  type="text" 
                  value={newPackage}
                  onChange={(e) => setNewPackage(e.target.value)}
                  placeholder="Contoh: Paket D (Advanced Logic)" 
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Tambah Paket
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Daftar Paket Tersedia</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {psychotestPackages.map((pkg, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileQuestion size={20} />
                    </div>
                    <p className="font-medium text-gray-900">{pkg}</p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Fitur hapus segera hadir">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {psychotestPackages.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  Belum ada paket psikotes yang ditambahkan.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
