"use client";

import React, { useState } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';


export default function KelolaPegawaiPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPegawai, setCurrentPegawai] = useState({
    id: '',
    nama: '',
    username: '',
    password: '',
    tanggal_dibuat: ''
  });

  const pegawaiData = [
    { id: '10345', nama: 'Ratu', username: 'ratu_', password: 'ratu_', tanggal_dibuat: '2023-01-01' },
    { id: '67890', nama: 'Abdul', username: 'abdul_', password: 'abdul_', tanggal_dibuat: '2023-01-01' },
    { id: '24580', nama: 'Baskara', username: 'baskara_', password: 'baskara_', tanggal_dibuat: '2023-01-01' },
    { id: '13579', nama: 'Cantika', username: 'cantika_', password: 'cantika_', tanggal_dibuat: '2023-01-01' },
    { id: '97531', nama: 'Dudung', username: 'dudung_', password: 'dudung_', tanggal_dibuat: '2023-01-01' },
    { id: '86420', nama: 'Emelin', username: 'emelin', password: 'emelin', tanggal_dibuat: '2023-01-01' },
    { id: '36925', nama: 'Farhan', username: 'farhan_', password: 'farhan_', tanggal_dibuat: '2023-01-01' },
    { id: '74185', nama: 'Gading', username: 'gading_', password: 'gading_', tanggal_dibuat: '2023-01-01' },
    { id: '52896', nama: 'Halim', username: 'halim_', password: 'halim_', tanggal_dibuat: '2023-01-01' }
  ];

  const handleTambahPegawai = () => {
    setCurrentPegawai({
      id: '',
      nama: '',
      username: '',
      password: '',
      tanggal_dibuat: new Date().toISOString().split('T')[0]
    });
    setEditMode(false);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Kelola Pegawai</h2>
          <button
            onClick={handleTambahPegawai}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Tambah Pegawai</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pegawaiData.map((pegawai) => (
                <tr key={pegawai.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.password}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.tanggal_dibuat}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        // onClick={() => handleEditPegawai(pegawai)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => console.log('Delete', pegawai.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editMode ? 'Edit Pegawai' : 'Tambah Pegawai'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentPegawai.nama}
                  onChange={(e) => setCurrentPegawai({...currentPegawai, nama: e.target.value})}
                  placeholder="Masukkan nama pegawai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentPegawai.username}
                  onChange={(e) => setCurrentPegawai({...currentPegawai, username: e.target.value})}
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={currentPegawai.password}
                  onChange={(e) => setCurrentPegawai({...currentPegawai, password: e.target.value})}
                  placeholder="Masukkan password"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  console.log('Save:', currentPegawai);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {editMode ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}