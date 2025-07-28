export interface Pegawai {
    id: string;
    nama: string;
    username: string;
    email?: string;
    tanggal_dibuat: string;
    auth_id?: string;
    password?: string; // Make this optional
}