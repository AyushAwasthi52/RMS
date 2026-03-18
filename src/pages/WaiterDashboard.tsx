import { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { AppNav } from '@/components/AppNav';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, CreditCard, Send } from 'lucide-react';

export default function WaiterDashboard() {
  const { orders, tables, getOrderForTable, updateOrderStatus } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const selectedOrder = selectedTable ? getOrderForTable(selectedTable) : undefined;
  const activeOrders = orders.filter(o => o.status !== 'paid');

  const tableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-muted text-muted-foreground border-border';
      case 'occupied': return 'bg-primary/10 text-primary border-primary';
      case 'reserved': return 'bg-warning/10 text-warning-foreground border-warning';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav role="waiter" />
      <div className="flex h-[calc(100vh-57px)]">
        {/* Left: Table Map */}
        <div className="w-1/2 border-r border-border p-6 overflow-auto">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" /> Tables
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {tables.map(table => (
              <button
                key={table.number}
                onClick={() => setSelectedTable(table.number)}
                className={`rounded-md border-2 p-4 text-center transition-colors ${tableStatusColor(table.status)} ${
                  selectedTable === table.number ? 'ring-2 ring-ring ring-offset-2' : ''
                }`}
              >
                <div className="font-display text-xl font-bold">{table.number}</div>
                <div className="text-xs font-medium capitalize">{table.status}</div>
                <div className="text-xs text-muted-foreground">{table.seats} seats</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Order Panel */}
        <div className="w-1/2 p-6 overflow-auto">
          {selectedTable && selectedOrder ? (
            <div>
              <h2 className="font-display text-lg font-semibold mb-4">Table {selectedTable} — Order</h2>
              <OrderCard
                order={selectedOrder}
                actions={
                  <>
                    {selectedOrder.status === 'ready' && (
                      <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'served')} className="gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> Mark Served
                      </Button>
                    )}
                    {selectedOrder.status === 'served' && (
                      <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'paid')} className="gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" /> Mark Paid
                      </Button>
                    )}
                    {selectedOrder.status === 'pending' && (
                      <Button size="sm" onClick={() => updateOrderStatus(selectedOrder.id, 'cooking')} className="gap-1.5">
                        <Send className="h-3.5 w-3.5" /> Send to Kitchen
                      </Button>
                    )}
                  </>
                }
              />
              {selectedOrder.status === 'served' && (
                <div className="mt-4 rounded-md border border-border bg-card p-4 space-y-2">
                  <h3 className="font-medium text-sm">Bill Summary</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span>Subtotal</span><span>₹{selectedOrder.total}</span></div>
                    <div className="flex justify-between"><span>Tax (5%)</span><span>₹{Math.round(selectedOrder.total * 0.05)}</span></div>
                    <div className="flex justify-between font-semibold border-t border-border pt-1">
                      <span>Total</span><span>₹{Math.round(selectedOrder.total * 1.05)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedTable ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No active order for Table {selectedTable}.</p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-lg font-semibold mb-4">Active Orders</h2>
              <div className="space-y-3">
                {activeOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No active orders.</p>
                ) : (
                  activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} compact />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
