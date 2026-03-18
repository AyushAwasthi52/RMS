import { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { AppNav } from '@/components/AppNav';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import type { MenuItem, OrderItem } from '@/types/restaurant';
import { Plus, Minus, ShoppingCart, Send } from 'lucide-react';

export default function CustomerDashboard() {
  const { menuItems, addOrder } = useRestaurant();
  const [cart, setCart] = useState<Map<string, { item: MenuItem; qty: number }>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const placeOrder = () => {
    const items: OrderItem[] = Array.from(cart.values()).map(({ item, qty }, i) => ({
      id: `new-${i}`,
      menuItem: item,
      quantity: qty,
    }));
    addOrder(Math.floor(Math.random() * 10) + 1, items);
    setCart(new Map());
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav role="customer" />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="font-display text-2xl font-bold mb-6">Menu</h1>

        {orderPlaced && (
          <div className="mb-4 rounded-md border border-success bg-success/10 p-3 text-sm font-medium text-success flex items-center gap-2">
            <Send className="h-4 w-4" /> Order placed successfully! Your food is being prepared.
          </div>
        )}

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
              <Button onClick={placeOrder} className="gap-2">
                <Send className="h-4 w-4" />
                Place Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
