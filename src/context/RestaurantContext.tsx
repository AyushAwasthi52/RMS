import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Order, OrderStatus, MenuItem, OrderItem, TableInfo, InventoryItem } from '@/types/restaurant';
import { INITIAL_ORDERS, TABLES, MENU_ITEMS, INVENTORY } from '@/data/mockData';

interface RestaurantContextType {
  orders: Order[];
  tables: TableInfo[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (tableNumber: number, items: OrderItem[]) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderForTable: (tableNumber: number) => Order | undefined;
  updateInventory: (id: string, quantity: number) => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tables, setTables] = useState<TableInfo[]>(TABLES);
  const [menuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INVENTORY);

  const updateInventory = useCallback((id: string, quantity: number) => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, quantity, lastRestocked: quantity > item.quantity ? new Date() : item.lastRestocked } : item
    ));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date() } : o
    ));
    if (status === 'paid') {
      setTables(prev => prev.map(t =>
        t.currentOrderId === orderId ? { ...t, status: 'available', currentOrderId: undefined } : t
      ));
    }
  }, []);

  const addOrder = useCallback((tableNumber: number, items: OrderItem[]) => {
    const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const newOrder: Order = {
      id: `o${Date.now()}`,
      tableNumber,
      items,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      total,
    };
    setOrders(prev => [...prev, newOrder]);
    setTables(prev => prev.map(t =>
      t.number === tableNumber ? { ...t, status: 'occupied', currentOrderId: newOrder.id } : t
    ));
  }, []);

  const getOrdersByStatus = useCallback((status: OrderStatus) =>
    orders.filter(o => o.status === status), [orders]);

  const getOrderForTable = useCallback((tableNumber: number) =>
    orders.find(o => o.tableNumber === tableNumber && o.status !== 'paid'), [orders]);

  return (
    <RestaurantContext.Provider value={{ orders, tables, menuItems, inventory, updateOrderStatus, addOrder, getOrdersByStatus, getOrderForTable, updateInventory }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
