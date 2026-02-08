"use client";

import { useEffect } from "react";
import { X, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    type?: ToastType;
    title?: string;
    children: React.ReactNode;
    duration?: number;
}

export function Toast({
    isOpen,
    onClose,
    type = "success",
    title,
    children,
    duration = 3000,
}: ToastProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const typeStyles = {
        success: {
            bg: "bg-green-50 border-green-200",
            icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
            text: "text-green-800",
            titleText: "text-green-900",
        },
        error: {
            bg: "bg-red-50 border-red-200",
            icon: <XCircle className="w-5 h-5 text-red-600" />,
            text: "text-red-800",
            titleText: "text-red-900",
        },
        warning: {
            bg: "bg-yellow-50 border-yellow-200",
            icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
            text: "text-yellow-800",
            titleText: "text-yellow-900",
        },
        info: {
            bg: "bg-blue-50 border-blue-200",
            icon: <Info className="w-5 h-5 text-blue-600" />,
            text: "text-blue-800",
            titleText: "text-blue-900",
        },
    };

    const style = typeStyles[type];

    return (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
            <div
                className={`flex items-start gap-3 rounded-lg border ${style.bg} p-4 shadow-lg min-w-[320px] max-w-md`}
            >
                <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
                <div className="flex-1 space-y-1">
                    {title && (
                        <p className={`font-semibold ${style.titleText}`}>
                            {title}
                        </p>
                    )}
                    <div className={`text-sm ${style.text}`}>{children}</div>
                </div>
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors ${style.text}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
