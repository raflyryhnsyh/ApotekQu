"use client";

import React from 'react';
import ObatCardButton from './obatcardbutton';

interface ObatCardProps {
    nama: string;
    harga: number;
    supplier: string;
    gambar: string;
    quantity: number;
    onAddToCart: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
}

const ObatCard: React.FC<ObatCardProps> = ({
    nama,
    harga,
    supplier,
    gambar,
    quantity,
    onAddToCart,
    onIncrement,
    onDecrement,
}) => {
    return (
                // 1. Mengubah gaya kartu: lebih rounded, padding lebih besar
        <div className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm border">
            {/* Gambar produk */}
            <div className="aspect-square w-full rounded-xl bg-gray-200">
                {/* Anda bisa menaruh <img> di sini jika sudah ada URL gambar */}
                <img src={gambar} alt={nama} className="h-full w-full object-cover rounded-xl" />
            </div>

            {/* 2. Konten utama dibuat flex-1 agar tombol bisa didorong ke bawah */}
            <div className="flex flex-1 flex-col pt-4">
                {/* Urutan teks diubah dan gaya disesuaikan */}
                <h3 className="font-semibold text-gray-800">{nama}</h3>
                <p className="text-sm text-gray-600">Rp{harga.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Supplier: {supplier}</p>

                {/* 3. Tombol didorong ke bawah dengan mt-auto */}
                <div className="mt-auto pt-4">
                    <ObatCardButton
                        count={quantity}
                        onAdd={onAddToCart}
                        onIncrement={onIncrement}
                        onDecrement={onDecrement}
                    />
                </div>
            </div>
        </div>
    );
};

export default ObatCard;