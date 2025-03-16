// Product type that matches the Prisma schema
export type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

// User type
export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
};

// Order type
export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  address: Address;
  email: string;
  createdAt: string;
  updatedAt: string;
  invoiceId: string;
};

// Order item type
export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
};

// Address type
export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

// Discount type
export type Discount = {
  id: string;
  code: string;
  rate: number;
  minPurchase: number | null;
  description: string;
  expiryDate: string | null;
  category: string;
  active: boolean;
};

// Session user with role information
export type SessionUser = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: string;
};