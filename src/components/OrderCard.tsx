import type { Order } from '@/types/restaurant';
import { StatusBadge } from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  actions?: React.ReactNode;
  compact?: boolean;
}

export function OrderCard({ order, actions, compact }: OrderCardProps) {
  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-semibold">Table {order.tableNumber}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(order.createdAt, { addSuffix: true })}
        </span>
      </div>
      {!compact && (
        <ul className="space-y-1 text-sm">
          {order.items.map(item => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantity}× {item.menuItem.name}
                {item.notes && <span className="text-muted-foreground ml-1">({item.notes})</span>}
              </span>
              <span className="font-medium">₹{item.menuItem.price * item.quantity}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-semibold">Total: ₹{order.total}</span>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
