import { useEffect, useMemo, useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { AppNav } from '@/components/AppNav';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import type { MenuItem, OrderItem } from '@/types/restaurant';
import { Plus, Minus, ShoppingCart, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerDashboard() {
  const { menuItems, tables, orders, getOrderForTable, addOrder, loading, error } = useRestaurant();
  const { user } = useAuth();
  const [cart, setCart] = useState<Map<string, { item: MenuItem; qty: number }>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('rms_selected_table');
    if (!raw) return;
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    setSelectedTable(parsed);
  }, []);

  useEffect(() => {
    if (selectedTable === null) {
      localStorage.removeItem('rms_selected_table');
      return;
    }
    localStorage.setItem('rms_selected_table', String(selectedTable));
  }, [selectedTable]);

  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filtered = selectedCategory === 'All' ? menuItems : menuItems.filter(i => i.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      next.set(item.id, { item, qty: (existing?.qty || 0) + 1 });
      return next;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const next = new Map(prev);
      const existing = next.get(itemId);
      if (existing && existing.qty > 1) {
        next.set(itemId, { ...existing, qty: existing.qty - 1 });
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const cartTotal = Array.from(cart.values()).reduce((sum, { item, qty }) => sum + item.price * qty, 0);
  const cartCount = Array.from(cart.values()).reduce((sum, { qty }) => sum + qty, 0);

  const availableTables = useMemo(() => tables.filter((t) => t.status === 'available'), [tables]);
  const myActiveOrder = useMemo(() => {
    if (!selectedTable) return undefined;
    return getOrderForTable(selectedTable);
  }, [getOrderForTable, selectedTable]);

  const canPlaceOrder = !!selectedTable && cart.size > 0 && !myActiveOrder && !placing;

  const placeOrder = async () => {
    if (!selectedTable) return;
    setPlacing(true);
    const items: OrderItem[] = Array.from(cart.values()).map(({ item, qty }, i) => ({
      id: `new-${i}`,
      menuItem: item,
      quantity: qty,
    }));
    try {
      await addOrder(selectedTable, items);
      setCart(new Map());
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav role="customer" />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <h1 className="font-display text-2xl font-bold">Menu</h1>
          <div className="text-sm text-muted-foreground">
            {user ? <>Signed in as <span className="text-foreground">{user.email}</span></> : null}
          </div>
        </div>
        {loading && <p className="text-sm text-muted-foreground mb-4">Loading menu...</p>}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}
        <div className="rounded-md border border-border bg-card p-4 mb-6">
          <h2 className="font-display text-base font-semibold mb-3">Choose your seat</h2>
          {availableTables.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available tables right now.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {availableTables.map((t) => (
                <button
                  key={t.number}
                  onClick={() => setSelectedTable(t.number)}
                  disabled={!!myActiveOrder || placing}
                  className={`rounded-md border-2 p-3 text-center transition-colors ${
                    selectedTable === t.number
                      ? 'border-primary ring-1 ring-ring'
                      : 'border-border hover:border-primary/60'
                  } ${myActiveOrder ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-display text-lg font-bold">{t.number}</div>
                  <div className="text-xs text-muted-foreground">{t.seats} seats</div>
                </button>
              ))}
            </div>
          )}
          {selectedTable && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Table {selectedTable}</p>
              {myActiveOrder ? (
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <StatusBadge status={myActiveOrder.status} />
                  <p className="text-sm text-muted-foreground">
                    {myActiveOrder.status === 'paid' ? 'Paid' : 'In progress'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-success">Ready to place your order.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
          {filtered.map(item => {
            const inCart = cart.get(item.id)?.qty || 0;
            return (
              <div key={item.id} className={`rounded-md border border-border bg-card p-4 space-y-2 ${!item.available ? 'opacity-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <span className="font-semibold text-sm">₹{item.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                  {item.available ? (
                    <div className="flex items-center gap-2">
                      {inCart > 0 && (
                        <>
                          <button onClick={() => removeFromCart(item.id)} className="h-7 w-7 rounded-sm border border-border flex items-center justify-center hover:bg-muted">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{inCart}</span>
                        </>
                      )}
                      <button onClick={() => addToCart(item)} className="h-7 w-7 rounded-sm bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-destructive font-medium">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium text-sm">{cartCount} items</span>
                <span className="font-semibold">₹{cartTotal}</span>
              </div>
              <Button onClick={placeOrder} disabled={!canPlaceOrder} className="gap-2">
                <Send className="h-4 w-4" />
                {placing ? 'Placing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
