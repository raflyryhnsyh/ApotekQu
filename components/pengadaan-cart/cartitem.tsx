"use client";

import Image from "next/image";
import { QuantityButton } from "./quantitybutton";
import { useCartStore } from "@/lib/store/usecartstore";

interface CartItemCardProps {
    id: string;
    name: string;
    supplier: string;
    price: number;
    quantity: number;
}

export function CartItemCard({
    id,
    name,
    supplier,
    price,
    quantity,
}: CartItemCardProps) {
    const increment = useCartStore((state) => state.increment);
    const decrement = useCartStore((state) => state.decrement);

    return (
        <div className="flex gap-4 items-center p-4 border rounded-xl shadow-sm mb-4">
            <div className="flex-1">
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-600">Supplier: {supplier}</p>
                <p className="text-sm text-gray-600">Rp{price.toLocaleString("id-ID")}</p>
            </div>
            <QuantityButton
                quantity={quantity}
                onIncrement={() => increment(id)}
                onDecrement={() => decrement(id)}
            />
        </div>
    );
}