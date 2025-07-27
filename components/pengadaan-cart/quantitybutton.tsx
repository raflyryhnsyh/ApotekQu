"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityButtonProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export function QuantityButton({
    quantity,
    onIncrement,
    onDecrement,
}: QuantityButtonProps) {
    return (
        // 1. Jarak antar elemen diperkecil
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onDecrement}
                // 2. Ukuran tombol diperkecil
                className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-black transition hover:bg-green-200"
            >
                <Minus size={14} />
            </button>
            
            {/* 3. Ukuran angka diperkecil */}
            <span className="min-w-[20px] text-center text-base font-medium">
                {quantity}
            </span>
            
            <button
                type="button"
                onClick={onIncrement}
                // 2. Ukuran tombol diperkecil
                className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-black transition hover:bg-green-200"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}