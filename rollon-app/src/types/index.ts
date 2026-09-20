export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image?: string;
    icon?: string;
    productCount: number;
    gradient?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    salePrice?: number;
    image: string;
    images?: string[];
    category: string;
    categoryId: string;
    rating: number;
    reviewCount: number;
    featured?: boolean;
    inStock: boolean;
    stock: number;
    badge?: string;
    tags?: string[];
    specifications?: Record<string, string>;
    new?: boolean;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    orders: number;
    createdAt: string;
    address?: string;
    city?: string;
    zone?: string;
}

export interface OrderItem {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

export interface ShippingAddress {
    name: string;
    address: string;
    city: string;
    phone: string;
    zone?: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    createdAt: string;
    updatedAt?: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
}

export interface Testimonial {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    quote: string;
}

// CANONICAL CartItem — Use this in ALL stores and components
export interface CartItem {
    productId: string;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    image: string;
    variant?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatar?: string;
}