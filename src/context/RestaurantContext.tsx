import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { InventoryItem, MenuItem, Order, OrderItem, OrderStatus, TableInfo } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import {
  closeTableForOrder,
  createOrder,
  createMenuItem,
  fetchInventory,
  fetchMenuItems,
  fetchOrders,
  fetchTables,
  updateMenuItemAvailability,
  updateInventoryQuantity,
  updateOrderStatusById,
} from '@/lib/restaurantApi';

interface RestaurantContextType {
  orders: Order[];
  tables: TableInfo[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateMenuAvailability: (menuItemId: string, available: boolean) => void;
  addMenuItem: (item: { name: string; description: string; price: number; category: string }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addOrder: (tableNumber: number, items: OrderItem[]) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderForTable: (tableNumber: number) => Order | undefined;
  updateInventory: (id: string, quantity: number) => void;
}

const RestaurantContext = createContext<RestaurantContextType | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersResult, tablesResult, menuResult, inventoryResult] = await Promise.allSettled([
        fetchOrders(),
        fetchTables(),
        fetchMenuItems(),
        fetchInventory(),
      ]);

      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value);
      if (tablesResult.status === 'fulfilled') setTables(tablesResult.value);
      if (menuResult.status === 'fulfilled') setMenuItems(menuResult.value);
      if (inventoryResult.status === 'fulfilled') setInventory(inventoryResult.value);

      const errors: string[] = [];
      if (ordersResult.status === 'rejected') errors.push(`orders: ${ordersResult.reason?.message ?? 'failed'}`);
      if (tablesResult.status === 'rejected') errors.push(`tables: ${tablesResult.reason?.message ?? 'failed'}`);
      if (menuResult.status === 'rejected') errors.push(`menu: ${menuResult.reason?.message ?? 'failed'}`);
      if (inventoryResult.status === 'rejected') errors.push(`inventory: ${inventoryResult.reason?.message ?? 'failed'}`);

      if (errors.length > 0) {
        setError(`Some data failed to load (${errors.join(' | ')})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setTables([]);
      setMenuItems([]);
      setInventory([]);
      setLoading(false);
      return;
    }
    refresh();
  }, [user, refresh]);

  const updateInventory = useCallback((id: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity, lastRestocked: quantity > item.quantity ? new Date() : item.lastRestocked }
          : item,
      ),
    );
    updateInventoryQuantity(id, quantity).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to update inventory.');
      refresh();
    });
  }, [refresh]);

  const updateMenuAvailability = useCallback((menuItemId: string, available: boolean) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === menuItemId ? { ...item, available } : item)),
    );
    updateMenuItemAvailability(menuItemId, available).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to update menu item.');
      refresh();
    });
  }, [refresh]);

  const addMenuItem = useCallback((item: { name: string; description: string; price: number; category: string }) => {
    const optimisticItem: MenuItem = {
      id: `m${Date.now()}`,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: true,
    };
    setMenuItems((prev) => [...prev, optimisticItem]);
    createMenuItem(item).then(refresh).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to add menu item.');
      refresh();
    });
  }, [refresh]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date() } : o)));
    if (status === 'paid') {
      setTables((prev) =>
        prev.map((t) => (t.currentOrderId === orderId ? { ...t, status: 'available', currentOrderId: undefined } : t)),
      );
    }
    updateOrderStatusById(orderId, status)
      .then(async () => {
        if (status === 'paid') {
          await closeTableForOrder(orderId);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to update order status.');
        refresh();
      });
  }, [refresh]);

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
    setOrders((prev) => [newOrder, ...prev]);
    setTables((prev) =>
      prev.map((t) => (t.number === tableNumber ? { ...t, status: 'occupied', currentOrderId: newOrder.id } : t)),
    );
    createOrder(tableNumber, items)
      .then(refresh)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to create order.');
        refresh();
      });
  }, [refresh]);

  const getOrdersByStatus = useCallback((status: OrderStatus) =>
    orders.filter(o => o.status === status), [orders]);

  const getOrderForTable = useCallback((tableNumber: number) =>
    orders.find(o => o.tableNumber === tableNumber && o.status !== 'paid'), [orders]);

  const value = useMemo(
    () => ({
      orders,
      tables,
      menuItems,
      inventory,
      loading,
      error,
      refresh,
      updateMenuAvailability,
      addMenuItem,
      updateOrderStatus,
      addOrder,
      getOrdersByStatus,
      getOrderForTable,
      updateInventory,
    }),
    [
      orders,
      tables,
      menuItems,
      inventory,
      loading,
      error,
      refresh,
      updateMenuAvailability,
      addMenuItem,
      updateOrderStatus,
      addOrder,
      getOrdersByStatus,
      getOrderForTable,
      updateInventory,
    ],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
}
