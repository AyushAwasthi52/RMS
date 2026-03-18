import { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { AppNav } from '@/components/AppNav';
import { LowStockBadge } from '@/components/StatusBadge';
import { STAFF } from '@/data/mockData';
import { BarChart3, Package, Users, UtensilsCrossed, TrendingUp, AlertTriangle, CreditCard, Plus } from 'lucide-react';

type ManagerTab = 'overview' | 'menu' | 'inventory' | 'staff';

export default function ManagerDashboard() {
  const { orders, menuItems, inventory, updateInventory } = useRestaurant();
  const [tab, setTab] = useState<ManagerTab>('overview');

  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + Math.round(o.total * 1.05), 0);
  const activeOrders = orders.filter(o => o.status !== 'paid').length;
  const lowStockItems = inventory.filter(i => i.quantity <= i.minThreshold);
  const totalOrders = paidOrders.length;

  const tabs: { id: ManagerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="h-4 w-4" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="h-4 w-4" /> },
    { id: 'staff', label: 'Staff', icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppNav
        role="manager"
        navItems={tabs.map(t => ({ label: t.label, path: '#', icon: t.icon }))}
      />
      {/* Custom tab nav since we're using local state */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {tab === 'overview' && (
          <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Revenue", value: `₹${totalRevenue}`, icon: <TrendingUp className="h-5 w-5 text-success" /> },
                { label: 'Active Orders', value: activeOrders, icon: <BarChart3 className="h-5 w-5 text-primary" /> },
                { label: 'Paid Orders', value: totalOrders, icon: <CreditCard className="h-5 w-5 text-muted-foreground" /> },
                { label: 'Low Stock Alerts', value: lowStockItems.length, icon: <AlertTriangle className="h-5 w-5 text-destructive" /> },
              ].map(stat => (
                <div key={stat.label} className="rounded-md border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    {stat.icon}
                  </div>
                  <span className="font-display text-2xl font-bold">{stat.value}</span>
                </div>
              ))}
            </div>

            {lowStockItems.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <h3 className="font-medium text-sm flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Low Stock Alerts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-sm bg-card border border-border p-2 text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-destructive font-medium">{item.quantity} {item.unit} remaining</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-md border border-border bg-card p-4">
              <h3 className="font-display text-base font-semibold mb-3">Recent Orders</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Order</th>
                    <th className="pb-2 font-medium">Table</th>
                    <th className="pb-2 font-medium">Items</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(order => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-2 font-medium">{order.id}</td>
                      <td className="py-2">{order.tableNumber}</td>
                      <td className="py-2">{order.items.length}</td>
                      <td className="py-2 capitalize">{order.status}</td>
                      <td className="py-2 text-right font-medium">₹{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold">Menu Management</h1>
            </div>
            <div className="rounded-md border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 font-medium">₹{item.price}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium ${item.available ? 'text-success' : 'text-destructive'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Inventory</h1>
            <div className="rounded-md border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Item</th>
                    <th className="p-3 font-medium">Quantity</th>
                    <th className="p-3 font-medium">Min Threshold</th>
                     <th className="p-3 font-medium">Status</th>
                     <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.quantity} {item.unit}</td>
                      <td className="p-3">{item.minThreshold} {item.unit}</td>
                      <td className="p-3">
                        {item.quantity <= item.minThreshold ? <LowStockBadge /> : (
                          <span className="text-xs font-medium text-success">In Stock</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => updateInventory(item.id, item.quantity + 10)}
                          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Plus className="h-3 w-3" /> Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'staff' && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-bold">Staff</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAFF.map(member => (
                <div key={member.id} className="rounded-md border border-border bg-card p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm text-muted-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                  </div>
                  <span className={`ml-auto text-xs font-medium ${member.active ? 'text-success' : 'text-muted-foreground'}`}>
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
