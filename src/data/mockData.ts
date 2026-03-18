import type { MenuItem, Order, StaffMember, InventoryItem, TableInfo } from '@/types/restaurant';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'm1', name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 320, category: 'Main Course', available: true },
  { id: 'm2', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 240, category: 'Starters', available: true },
  { id: 'm3', name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter gravy', price: 220, category: 'Main Course', available: true },
  { id: 'm4', name: 'Garlic Naan', description: 'Tandoor-baked flatbread with garlic', price: 60, category: 'Breads', available: true },
  { id: 'm5', name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 280, category: 'Rice', available: true },
  { id: 'm6', name: 'Gulab Jamun', description: 'Deep-fried milk dumplings in sugar syrup', price: 120, category: 'Desserts', available: true },
  { id: 'm7', name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 160, category: 'Starters', available: true },
  { id: 'm8', name: 'Tandoori Chicken', description: 'Marinated chicken roasted in clay oven', price: 340, category: 'Main Course', available: false },
  { id: 'm9', name: 'Mango Lassi', description: 'Chilled yogurt drink with mango', price: 90, category: 'Beverages', available: true },
  { id: 'm10', name: 'Raita', description: 'Yogurt with cucumber and spices', price: 70, category: 'Sides', available: true },
  { id: 'm11', name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes', price: 80, category: 'Starters', available: true },
  { id: 'm12', name: 'Kheer', description: 'Rice pudding with cardamom and nuts', price: 110, category: 'Desserts', available: true },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1', tableNumber: 3, status: 'pending', createdAt: new Date(Date.now() - 300000), updatedAt: new Date(Date.now() - 300000), waiterId: 's1', total: 640, notes: 'Extra spicy',
    items: [
      { id: 'oi1', menuItem: MENU_ITEMS[0], quantity: 2, notes: 'Extra spicy' },
    ],
  },
  {
    id: 'o2', tableNumber: 7, status: 'cooking', createdAt: new Date(Date.now() - 600000), updatedAt: new Date(Date.now() - 120000), waiterId: 's1', total: 560,
    items: [
      { id: 'oi2', menuItem: MENU_ITEMS[4], quantity: 1 },
      { id: 'oi3', menuItem: MENU_ITEMS[4], quantity: 1 },
    ],
  },
  {
    id: 'o3', tableNumber: 1, status: 'ready', createdAt: new Date(Date.now() - 900000), updatedAt: new Date(Date.now() - 60000), waiterId: 's2', total: 400,
    items: [
      { id: 'oi4', menuItem: MENU_ITEMS[1], quantity: 1 },
      { id: 'oi5', menuItem: MENU_ITEMS[6], quantity: 1 },
    ],
  },
  {
    id: 'o4', tableNumber: 5, status: 'served', createdAt: new Date(Date.now() - 1800000), updatedAt: new Date(Date.now() - 300000), waiterId: 's1', total: 870,
    items: [
      { id: 'oi6', menuItem: MENU_ITEMS[0], quantity: 1 },
      { id: 'oi7', menuItem: MENU_ITEMS[2], quantity: 1 },
      { id: 'oi8', menuItem: MENU_ITEMS[3], quantity: 2 },
      { id: 'oi9', menuItem: MENU_ITEMS[5], quantity: 2 },
    ],
  },
];

export const STAFF: StaffMember[] = [
  { id: 's1', name: 'Rahul Sharma', role: 'waiter', active: true },
  { id: 's2', name: 'Priya Patel', role: 'waiter', active: true },
  { id: 's3', name: 'Amit Kumar', role: 'chef', active: true },
  { id: 's4', name: 'Deepa Singh', role: 'chef', active: true },
  { id: 's5', name: 'Vikram Joshi', role: 'manager', active: true },
];

export const INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Chicken', quantity: 12, unit: 'kg', minThreshold: 5, lastRestocked: new Date(Date.now() - 86400000) },
  { id: 'i2', name: 'Basmati Rice', quantity: 25, unit: 'kg', minThreshold: 10, lastRestocked: new Date(Date.now() - 172800000) },
  { id: 'i3', name: 'Paneer', quantity: 3, unit: 'kg', minThreshold: 4, lastRestocked: new Date(Date.now() - 86400000) },
  { id: 'i4', name: 'Butter', quantity: 2, unit: 'kg', minThreshold: 3, lastRestocked: new Date(Date.now() - 259200000) },
  { id: 'i5', name: 'Tomatoes', quantity: 8, unit: 'kg', minThreshold: 5, lastRestocked: new Date(Date.now() - 43200000) },
  { id: 'i6', name: 'Onions', quantity: 15, unit: 'kg', minThreshold: 8, lastRestocked: new Date(Date.now() - 86400000) },
  { id: 'i7', name: 'Cream', quantity: 1, unit: 'L', minThreshold: 2, lastRestocked: new Date(Date.now() - 172800000) },
  { id: 'i8', name: 'Naan Flour', quantity: 20, unit: 'kg', minThreshold: 10, lastRestocked: new Date(Date.now() - 86400000) },
];

export const TABLES: TableInfo[] = [
  { number: 1, seats: 2, status: 'occupied', currentOrderId: 'o3' },
  { number: 2, seats: 4, status: 'available' },
  { number: 3, seats: 4, status: 'occupied', currentOrderId: 'o1' },
  { number: 4, seats: 2, status: 'available' },
  { number: 5, seats: 6, status: 'occupied', currentOrderId: 'o4' },
  { number: 6, seats: 4, status: 'reserved' },
  { number: 7, seats: 4, status: 'occupied', currentOrderId: 'o2' },
  { number: 8, seats: 8, status: 'available' },
  { number: 9, seats: 2, status: 'available' },
  { number: 10, seats: 6, status: 'available' },
];
