import { useRestaurant } from '@/context/RestaurantContext';
import { AppNav } from '@/components/AppNav';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { Clock, Flame, CheckCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/restaurant';

const lanes: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
  { status: 'cooking', label: 'Cooking', icon: <Flame className="h-4 w-4" /> },
  { status: 'ready', label: 'Ready', icon: <CheckCircle className="h-4 w-4" /> },
];

export default function ChefDashboard() {
  const { orders, menuItems, updateOrderStatus, updateMenuAvailability, loading, error } = useRestaurant();

  const nextStatus: Record<string, OrderStatus> = {
    pending: 'cooking',
    cooking: 'ready',
  };

  const nextLabel: Record<string, string> = {
    pending: 'Start Cooking',
    cooking: 'Mark Ready',
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav role="chef" />
      <div className="p-6">
        <h1 className="font-display text-2xl font-bold mb-6">Kitchen Dashboard</h1>
        {loading && <p className="text-sm text-muted-foreground mb-4">Loading data...</p>}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        <div className="rounded-md border border-border bg-card p-4 mb-6">
          <h2 className="font-display text-base font-semibold mb-3">Menu Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <div key={item.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={item.available ? 'outline' : 'default'}
                    onClick={() => updateMenuAvailability(item.id, !item.available)}
                  >
                    {item.available ? 'Exclude' : 'Include'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lanes.map(lane => {
            const laneOrders = orders.filter(o => o.status === lane.status);
            return (
              <div key={lane.status} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  {lane.icon}
                  <h2 className="font-display text-base font-semibold">{lane.label}</h2>
                  <span className="ml-auto rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {laneOrders.length}
                  </span>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {laneOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No {lane.label.toLowerCase()} orders.</p>
                  ) : (
                    laneOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        actions={
                          nextStatus[order.status] ? (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, nextStatus[order.status])} className="gap-1.5">
                              {lane.status === 'pending' ? <Flame className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              {nextLabel[order.status]}
                            </Button>
                          ) : null
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
