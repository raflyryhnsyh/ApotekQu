"use client";
import React, { useState } from 'react';

interface ObatCardButtonProps {
    count: number;
    onAdd: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    onAddToCart?: () => void;
}

const ObatCardButton: React.FC<ObatCardButtonProps> = ({
    count,
    onAdd,
    onIncrement,
    onDecrement,
    onAddToCart
}) => {
    return (
        <div suppressHydrationWarning>
            {count === 0 ? (
                // 1. Gaya tombol "Tambah" yang baru
                <button
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-100 py-2.5 text-sm font-medium text-black transition hover:bg-green-200"
                    onClick={onAdd}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Tambah
                </button>
            ) : (
                // 2. Gaya tombol increment/decrement yang baru
                <div className="flex w-full items-center justify-between">
                    <button
                        onClick={onDecrement}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800 transition hover:bg-green-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>

                    <span className="text-base font-semibold text-gray-800">{count}</span>

                    <button
                        onClick={onIncrement}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800 transition hover:bg-green-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ObatCardButton;