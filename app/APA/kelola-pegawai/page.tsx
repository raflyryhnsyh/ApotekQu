"use client";

import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Pegawai } from "@/types/APA";

export default function KelolaPegawaiPage() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ nama?: string; username?: string; password?: string }>({});
    const [pegawaiData, setPegawaiData] = useState<Pegawai[]>([]);
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

    const supabase = createClient();

    // Fetch data pegawai dari database
    const fetchPegawaiData = async () => {
        try {
            console.log('Fetching pegawai data...'); // Debug log

            const { data, error } = await supabase
                .from('pengguna')
                .select('id, full_name, email, dibuat_pada, role')
                .eq('role', 'Pegawai')
                .order('dibuat_pada', { ascending: false });

            console.log('Supabase response:', { data, error }); // Debug log

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            const formattedData: Pegawai[] = data.map(item => ({
                id: item.id,
                nama: item.full_name,
                username: item.email?.replace('@apotekqu.com', '') || '',
                email: item.email,
                tanggal_dibuat: new Date(item.dibuat_pada).toLocaleDateString('id-ID')
            }));

            console.log('Formatted data:', formattedData); // Debug log
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
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const email = `${currentPegawai.username}@apotekqu.com`;

            if (editMode) {
                // Update existing pegawai
                const updateData = {
                    full_name: currentPegawai.nama,
                    email: email,
                    username: currentPegawai.username
                };

                const { error } = await supabase
                    .from('pengguna')
                    .update(updateData)
                    .eq('id', currentPegawai.id);

                if (error) {
                    console.error('Update error:', error);
                    throw error;
                }
            } else {
                const testUserId = "82c09b44-85ec-4bd2-967b-2ecd6d1bc10f";

                const newUser = {
                    id: testUserId, // Gunakan ID yang sudah ada
                    full_name: currentPegawai.nama,
                    email: email,
                    role: 'Pegawai',
                    dibuat_pada: new Date().toISOString()
                };

                console.log('Creating user in pengguna table with existing auth ID:', newUser);

                const { data: insertData, error: insertError } = await supabase
                    .from('pengguna')
                    .insert([newUser]);

                if (insertError) {
                    console.error('Insert error:', insertError);
                    throw insertError;
                }

                console.log('User created successfully:', insertData);
            }

            // Refresh data
            await fetchPegawaiData();
            setShowModal(false);
            resetForm();

        } catch (error: any) {
            console.error('Full error object:', error);
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error status:', error.status);

            let errorMessage = 'Terjadi kesalahan saat menyimpan data';

            // Handle specific Supabase auth errors
            if (error.message?.includes('User already registered')) {
                errorMessage = 'Email sudah terdaftar di sistem';
            } else if (error.message?.includes('Invalid email')) {
                errorMessage = 'Format email tidak valid';
            } else if (error.message?.includes('Password should be at least')) {
                errorMessage = 'Password minimal 6 karakter';
            } else if (error.message?.includes('signup is disabled')) {
                errorMessage = 'Pendaftaran user baru sedang dinonaktifkan';
            } else if (error.message?.includes('Database error saving new user')) {
                errorMessage = 'Error saat menyimpan ke database auth';
            } else if (error.code === '23505') {
                errorMessage = 'Data duplikat - email atau username sudah ada';
            } else if (error.message?.includes('duplicate key')) {
                errorMessage = 'Email atau username sudah terdaftar';
            } else if (error.message) {
                errorMessage = error.message;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePegawai = async (id: string) => {
        setLoading(true);

        try {
            // Delete from pengguna table first
            const { error: dbError } = await supabase
                .from('pengguna')
                .delete()
                .eq('id', id);

            if (dbError) {
                console.error('Delete error:', dbError);
                throw dbError;
            }

            // Note: Cannot delete from auth.users using client-side code
            // The auth user will remain but without pengguna record
            // This is by design for security reasons

            // Refresh data
            await fetchPegawaiData();

        } catch (error: any) {
            console.error('Error deleting pegawai:', error);
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
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