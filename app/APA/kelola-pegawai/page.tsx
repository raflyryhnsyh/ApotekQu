"use client";

import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { Pegawai } from "@/types/APA";
import { fetchPegawai, createUser, updateUser, deleteUser, UserResponse } from "@/lib/api/user-management";

export default function KelolaPegawaiPage() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ nama?: string; username?: string; password?: string }>({});
    const [pegawaiData, setPegawaiData] = useState<Pegawai[]>([]);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ 
        show: false, 
        message: '', 
        type: 'success' 
    });
    const [currentPegawai, setCurrentPegawai] = useState<{
        id: string | null;
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

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Fetch data pegawai dari API
    const fetchPegawaiData = async () => {
        try {
            const data = await fetchPegawai(); // Menggunakan API fetchPegawai
            const formattedData: Pegawai[] = data.map((item: UserResponse) => ({
                id: item.id,
                nama: item.nama,
                username: item.username,
                email: item.email,
                tanggal_dibuat: item.tanggal_dibuat
            }));
            setPegawaiData(formattedData);
        } catch (error) {
            console.error('Error fetching pegawai data:', error);
        }
    };

    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            await fetchPegawaiData();
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

        if (!editMode) { // Only validate password for new users
            if (!currentPegawai.password.trim()) {
                newErrors.password = "Password tidak boleh kosong";
            } else if (currentPegawai.password.length < 6) {
                newErrors.password = "Password minimal 6 karakter";
            }
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

    const handleEditPegawai = (pegawai: Pegawai) => {
        setEditMode(true);
        setCurrentPegawai({
            id: pegawai.id,
            nama: pegawai.nama,
            username: pegawai.username,
            password: "", // Don't pre-fill password for security
            tanggal_dibuat: pegawai.tanggal_dibuat
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSavePegawai = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (editMode && currentPegawai.id) {
                // UPDATE - Menggunakan API updateUser
                const updateData = {
                    nama: currentPegawai.nama,
                    username: currentPegawai.username,
                    ...(currentPegawai.password && { password: currentPegawai.password })
                };
                await updateUser(currentPegawai.id, updateData);
            } else {
                // CREATE - Menggunakan API createUser
                const newUserData = {
                    nama: currentPegawai.nama,
                    username: currentPegawai.username,
                    password: currentPegawai.password,
                    role: 'Pegawai'
                };
                await createUser(newUserData);
            }

            await fetchPegawaiData(); // Refresh data
            setShowModal(false);
            resetForm();
            
            // Show success notification
            showToast(
                editMode ? 'Pegawai berhasil diperbarui' : 'Pegawai berhasil ditambahkan',
                'success'
            );
        } catch (error: unknown) {
            console.error('Error saving pegawai:', error);
            
            // Extract error message
            let errorMessage = '';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else {
                errorMessage = 'Terjadi kesalahan saat menyimpan data';
            }

            // Map API errors to field errors with consistent messages
            const lowerErrorMsg = errorMessage.toLowerCase();
            
            if (lowerErrorMsg.includes('username') || lowerErrorMsg.includes('email')) {
                setErrors(prev => ({ ...prev, username: "Username sudah digunakan" }));
            } else if (lowerErrorMsg.includes('nama') || lowerErrorMsg.includes('name')) {
                setErrors(prev => ({ ...prev, nama: "Nama tidak valid" }));
            } else if (lowerErrorMsg.includes('password')) {
                setErrors(prev => ({ ...prev, password: "Password tidak valid" }));
            } else {
                // Generic error - show in first available field
                setErrors(prev => ({ ...prev, nama: errorMessage }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePegawai = async (id: string) => {
        setLoading(true);
        try {
            await deleteUser(id); // Menggunakan API deleteUser
            await fetchPegawaiData(); // Refresh data
            
            // Show success notification
            showToast('Pegawai berhasil dihapus', 'success');
        } catch (error: unknown) {
            console.error('Error deleting pegawai:', error);
            showToast('Gagal menghapus pegawai', 'error');
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
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

    return (
        <div className="bg-gray-50 p-6">
            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px] ${
                        toast.type === 'success' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        {toast.type === 'success' ? (
                            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <p className={`text-sm font-medium ${
                            toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {toast.message}
                        </p>
                        <button
                            onClick={() => setToast({ show: false, message: '', type: 'success' })}
                            className={`ml-auto flex-shrink-0 rounded-md p-1 hover:bg-opacity-20 transition-colors ${
                                toast.type === 'success' 
                                    ? 'text-green-600 hover:bg-green-600' 
                                    : 'text-red-600 hover:bg-red-600'
                            }`}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : pegawaiData.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data pegawai
                                </td>
                            </tr>
                        ) : (
                            pegawaiData.map((pegawai, index) => (
                                <tr key={pegawai.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.id.substring(0, 8)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pegawai.email}</td>
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
                                                onClick={() => setDeleteId(pegawai.id)}
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

            {/* Delete Confirmation Modal */}
            {deleteId !== null && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <h3 className="text-md font-semibold text-gray-900">Hapus Pegawai?</h3>
                            <p className="mt-2 text-gray-600">Apakah Anda yakin ingin menghapus pegawai ini? Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleDeletePegawai(deleteId)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
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
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.nama ? 'border-red-500' : 'border-gray-300'}`}
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
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                                        value={currentPegawai.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                        placeholder="Masukkan username"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500 text-sm">@apotekqu.com</span>
                                    </div>
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Email akan menjadi: {currentPegawai.username}@apotekqu.com
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!editMode && <span className="text-red-500">*</span>}
                                    {editMode && <span className="text-gray-500">(kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    value={currentPegawai.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder={editMode ? "Masukkan password baru (opsional)" : "Masukkan password"}
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
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSavePegawai}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                disabled={loading}
                            >
                                {loading ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}