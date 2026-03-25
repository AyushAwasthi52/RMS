import type { InventoryItem, MenuItem, Order, OrderItem, OrderStatus, StaffMember, TableInfo } from '@/types/restaurant';
import { supabase } from '@/lib/supabase';

function asNumber(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

type DbOrder = {
  id: string;
  table_number: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  waiter_id: string | null;
  total: number | string;
  notes: string | null;
  order_items: Array<{
    id: string;
    quantity: number;
    notes: string | null;
    menu_items: {
      id: string;
      name: string;
      description: string;
      price: number | string;
      category: string;
      available: boolean;
      image: string | null;
    } | null;
  }>;
};

function mapMenuItem(item: {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  available: boolean;
  image: string | null;
}): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: asNumber(item.price),
    category: item.category,
    available: item.available,
    image: item.image ?? undefined,
  };
}

function mapOrder(order: DbOrder): Order {
  const items: OrderItem[] = order.order_items
    .filter((oi) => oi.menu_items)
    .map((oi) => ({
      id: oi.id,
      quantity: oi.quantity,
      notes: oi.notes ?? undefined,
      menuItem: mapMenuItem(oi.menu_items!),
    }));

  return {
    id: order.id,
    tableNumber: order.table_number,
    status: order.status,
    createdAt: new Date(order.created_at),
    updatedAt: new Date(order.updated_at),
    waiterId: order.waiter_id ?? undefined,
    total: asNumber(order.total),
    notes: order.notes ?? undefined,
    items,
  };
}

export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id,name,description,price,category,available,image')
    .order('name');

  if (error) throw error;
  return (data ?? []).map(mapMenuItem);
}

export async function updateMenuItemAvailability(id: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ available })
    .eq('id', id);

  if (error) throw error;
}

export async function createMenuItem(payload: {
  name: string;
  description: string;
  price: number;
  category: string;
  available?: boolean;
}): Promise<void> {
  const { error } = await supabase.from('menu_items').insert({
    name: payload.name,
    description: payload.description,
    price: payload.price,
    category: payload.category,
    available: payload.available ?? true,
  });

  if (error) throw error;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('id,name,quantity,unit,min_threshold,last_restocked')
    .order('name');

  if (error) throw error;
  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: asNumber(item.quantity),
    unit: item.unit,
    minThreshold: asNumber(item.min_threshold),
    lastRestocked: new Date(item.last_restocked),
  }));
}

export async function fetchTables(): Promise<TableInfo[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('number,seats,status,current_order_id')
    .order('number');

  if (error) throw error;
  return (data ?? []).map((table) => ({
    number: table.number,
    seats: table.seats,
    status: table.status,
    currentOrderId: table.current_order_id ?? undefined,
  }));
}

export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      table_number,
      status,
      created_at,
      updated_at,
      waiter_id,
      total,
      notes,
      order_items(
        id,
        quantity,
        notes,
        menu_items(
          id,
          name,
          description,
          price,
          category,
          available,
          image
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as DbOrder[]).map(mapOrder);
}

export async function updateInventoryQuantity(id: string, quantity: number): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .update({
      quantity,
      last_restocked: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function updateOrderStatusById(orderId: string, status: OrderStatus): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: now })
    .eq('id', orderId);

  if (error) throw error;
}

export async function chefAdvanceOrderStatus(orderId: string, nextStatus: OrderStatus): Promise<void> {
  const { error } = await supabase.rpc('app_chef_advance_order', {
    p_order_id: orderId,
    p_next_status: nextStatus,
  });

  if (error) throw error;
}

export async function closeTableForOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from('tables')
    .update({ status: 'available', current_order_id: null })
    .eq('current_order_id', orderId);

  if (error) throw error;
}

export async function createOrder(tableNumber: number, items: OrderItem[], waiterId?: string): Promise<void> {
  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      table_number: tableNumber,
      status: 'pending',
      total,
      waiter_id: waiterId ?? null,
      notes: null,
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItem.id,
    quantity: item.quantity,
    notes: item.notes ?? null,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
  if (itemsError) throw itemsError;

  const { error: tableError } = await supabase
    .from('tables')
    .update({ status: 'occupied', current_order_id: order.id })
    .eq('number', tableNumber);

  if (tableError) throw tableError;
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('id,full_name,user_roles(role)')
    .order('full_name');

  if (error) throw error;
  return (data ?? []).flatMap((profile: { id: string; full_name: string; user_roles: Array<{ role: string }> | null }) => {
    const roles = profile.user_roles ?? [];
    return roles
      .filter((roleRow) => roleRow.role !== 'customer')
      .map((roleRow, index) => ({
      id: `${profile.id}-${index}`,
      name: profile.full_name,
      role: roleRow.role as StaffMember['role'],
      active: true,
    }));
  });
}
