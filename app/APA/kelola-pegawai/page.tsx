"use client";

import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";

export default function KelolaPegawaiPage() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ nama?: string; username?: string; password?: string }>({});
    const [pegawaiData, setPegawaiData] = useState([
        {
            id: 12345,
            nama: "Ratu",
            username: "ratu",
            password: "ratu",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 67890,
            nama: "Alfajil",
            username: "alfajil",
            password: "alfajil",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 24869,
            nama: "Saskara",
            username: "saskara",
            password: "saskara",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 19379,
            nama: "Cerika",
            username: "cerika",
            password: "cerika",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 97531,
            nama: "Dudung",
            username: "dudung",
            password: "dudung",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 86420,
            nama: "Emelin",
            username: "emelin",
            password: "emelin",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 36925,
            nama: "Farhan",
            username: "farhan",
            password: "farhan",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 74825,
            nama: "Gadhja",
            username: "gadhja",
            password: "gadhja",
            tanggal_dibuat: "2023-01-01"
        },
        {
            id: 52696,
            nama: "Halim",
            username: "halim",
            password: "halim",
            tanggal_dibuat: "2023-01-01"
        }
    ]);
    const [currentPegawai, setCurrentPegawai] = useState<{
        id: number | null;
        nama: string;
        username: string;
        password: string;
        tanggal_dibuat: string;
    }>({
        id: null,
        nama: "",
        username: "",
        password: "",
        tanggal_dibuat: ""
    });

    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            // Simulasi fetch data atau operasi lainnya
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };

        initializePage();
    }, []);

    const validateForm = () => {
        const newErrors: { nama?: string; username?: string; password?: string } = {};

        if (!currentPegawai.nama.trim()) {
            newErrors.nama = "Nama tidak boleh kosong";
        }

        if (!currentPegawai.username.trim()) {
            newErrors.username = "Username tidak boleh kosong";
        } else if (currentPegawai.username.length < 3) {
            newErrors.username = "Username minimal 3 karakter";
        } else {
            // Check if username already exists (exclude current user when editing)
            const existingUser = pegawaiData.find(p =>
                p.username === currentPegawai.username && p.id !== currentPegawai.id
            );
            if (existingUser) {
                newErrors.username = "Username sudah digunakan";
            }
        }

        if (!currentPegawai.password.trim()) {
            newErrors.password = "Password tidak boleh kosong";
        } else if (currentPegawai.password.length < 4) {
            newErrors.password = "Password minimal 4 karakter";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setCurrentPegawai({
            id: null,
            nama: "",
            username: "",
            password: "",
            tanggal_dibuat: ""
        });
        setErrors({});
    };

    const handleAddPegawai = () => {
        setEditMode(false);
        resetForm();
        setShowModal(true);
    };

    type Pegawai = {
        id: number;
        nama: string;
        username: string;
        password: string;
        tanggal_dibuat: string;
    };

    const handleEditPegawai = (pegawai: Pegawai) => {
        setEditMode(true);
        setCurrentPegawai({ ...pegawai });
        setErrors({});
        setShowModal(true);
    };

    const handleSavePegawai = () => {
        if (!validateForm()) {
            return;
        }

        if (editMode) {
            // Update existing pegawai
            setPegawaiData(prev => prev.map(p =>
                p.id === currentPegawai.id
                    ? { ...currentPegawai, id: p.id } // Ensure id is a number
                    : p
            ));
        } else {
            // Add new pegawai
            const newPegawai = {
                ...currentPegawai,
                id: Math.floor(Math.random() * 90000) + 10000,
                tanggal_dibuat: new Date().toISOString().split('T')[0]
            };
            setPegawaiData(prev => [...prev, newPegawai]);
        }
        setShowModal(false);
        resetForm();
    };


    const handleDeletePegawai = (id: number) => {
        setDeleteId(id);
    };


    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (field: keyof typeof currentPegawai, value: string) => {
        setCurrentPegawai(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
                <p className="mt-4 text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Pegawai</h1>
                    <button
                        onClick={handleAddPegawai}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
                    >
                        <Plus size={16} />
                        <span>Tambah Pegawai</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {pegawaiData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data pegawai
                                </td>
                            </tr>
                        ) : (
                            pegawaiData.map((pegawai, index) => (
                                <tr key={pegawai.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.password}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.tanggal_dibuat}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditPegawai(pegawai)}
                                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePegawai(pegawai.id)}
                                                className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {deleteId !== null && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <h3 className="text-md font-semibold text-gray-900">Hapus Pegawai?</h3>
                            <p className="mt-2 text-gray-600">Apakah Anda yakin ingin menghapus pegawai ini?</p>
                        </div>
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    setPegawaiData(prev => prev.filter(p => p.id !== deleteId));
                                    setDeleteId(null);
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editMode ? 'Edit Pegawai' : 'Tambah Pegawai'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.nama ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    value={currentPegawai.nama}
                                    onChange={(e) => handleInputChange('nama', e.target.value)}
                                    placeholder="Masukkan nama pegawai"
                                />
                                {errors.nama && (
                                    <p className="mt-1 text-sm text-red-500">{errors.nama}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    value={currentPegawai.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder="Masukkan username"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    value={currentPegawai.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Masukkan password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSavePegawai}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
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