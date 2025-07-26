import { useEffect, useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";

export default function APAPage() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
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
    const [currentPegawai, setCurrentPegawai] = useState({
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

    const handleAddPegawai = () => {
        setEditMode(false);
        setCurrentPegawai({
            id: null,
            nama: "",
            username: "",
            password: "",
            tanggal_dibuat: ""
        });
        setShowModal(true);
    };

    const handleEditPegawai = (pegawai) => {
        setEditMode(true);
        setCurrentPegawai(pegawai);
        setShowModal(true);
    };

    const handleSavePegawai = () => {
        if (editMode) {
            // Update existing pegawai
            setPegawaiData(prev => prev.map(p => 
                p.id === currentPegawai.id ? currentPegawai : p
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
    };

    const handleDeletePegawai = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pegawai ini?')) {
            setPegawaiData(prev => prev.filter(p => p.id !== id));
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
                        {pegawaiData.map((pegawai, index) => (
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
                        ))}
                    </tbody>
                </table>
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
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={currentPegawai.nama}
                                    onChange={(e) => setCurrentPegawai({...currentPegawai, nama: e.target.value})}
                                    placeholder="Masukkan nama pegawai"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={currentPegawai.username}
                                    onChange={(e) => setCurrentPegawai({...currentPegawai, username: e.target.value})}
                                    placeholder="Masukkan username"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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