export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served' | 'paid';
export type UserRole = 'customer' | 'waiter' | 'chef' | 'manager';
export type PaymentMethod = 'cash' | 'upi';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  waiterId?: string;
  total: number;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  tax: number;
  discount: number;
  paidAt: Date;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  lastRestocked: Date;
}

export interface TableInfo {
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
}
