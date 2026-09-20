import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    totalItems: number;
    totalPrice: number;

    // Actions
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setCartOpen: (isOpen: boolean) => void;
}

const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
    return { totalItems, totalPrice };
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            totalItems: 0,
            totalPrice: 0,

            addItem: (product: Product) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.productId === product.id);
                    let newItems;
                    if (existingItem) {
                        newItems = state.items.map((i) =>
                            i.productId === product.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        );
                    } else {
                        newItems = [...state.items, {
                            productId: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            image: product.image,
                            quantity: 1
                        }];
                    }

                    const totals = calculateTotals(newItems);
                    return { items: newItems, ...totals };
                });
            },

            removeItem: (productId: string) => {
                set((state) => {
                    const newItems = state.items.filter((i) => i.productId !== productId);
                    const totals = calculateTotals(newItems);
                    return { items: newItems, ...totals };
                });
            },

            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => {
                    const newItems = state.items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    );
                    const totals = calculateTotals(newItems);
                    return { items: newItems, ...totals };
                });
            },

            clearCart: () => {
                set({ items: [], totalItems: 0, totalPrice: 0 });
            },

            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            setCartOpen: (isOpen: boolean) => {
                set({ isOpen });
            },
        }),
        {
            name: 'rollon-cart-storage',
            partialize: (state) => ({ items: state.items, totalItems: state.totalItems, totalPrice: state.totalPrice }),
        }
    )
);