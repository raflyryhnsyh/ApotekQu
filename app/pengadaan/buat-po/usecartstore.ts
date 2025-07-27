import { create } from 'zustand';

// 1. Buat interface untuk produk dasar (tanpa quantity)
interface Product {
    id: string;
    nama: string;
    harga: number;
    supplier: string;
    gambar: string;
    id_supplier: string;
}

// 2. CartItem adalah Product yang ditambah dengan quantity
interface CartItem extends Product {
    quantity: number;
}

interface CartStore {
    cart: CartItem[];
    // 3. Ubah di sini! addToCart sekarang menerima Product, bukan CartItem
    addToCart: (item: Product) => void;
    increment: (id: string) => void;
    decrement: (id: string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
    cart: [],
    // Logika di bawah ini sudah benar dan tidak perlu diubah
    addToCart: (item) =>
        set((state) => {
            const existing = state.cart.find((i) => i.id === item.id);
            if (existing) {
                return {
                    cart: state.cart.map((i) =>
                        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            } else {
                return {
                    cart: [...state.cart, { ...item, quantity: 1 }],
                };
            }
        }),
    increment: (id) =>
        set((state) => ({
            cart: state.cart.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            ),
        })),
    decrement: (id) =>
        set((state) => ({
            cart: state.cart
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0),
        })),
    clearCart: () => set({ cart: [] }),
}));