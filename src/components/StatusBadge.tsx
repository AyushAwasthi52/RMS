import type { OrderStatus } from '@/types/restaurant';
import { Clock, Flame, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', className: 'bg-warning text-warning-foreground', icon: <Clock className="h-3.5 w-3.5" /> },
  cooking: { label: 'Cooking', className: 'bg-primary text-primary-foreground', icon: <Flame className="h-3.5 w-3.5" /> },
  ready: { label: 'Ready', className: 'bg-success text-success-foreground', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  served: { label: 'Served', className: 'bg-muted text-muted-foreground', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  paid: { label: 'Paid', className: 'bg-muted text-muted-foreground', icon: <CreditCard className="h-3.5 w-3.5" /> },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function LowStockBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-destructive text-destructive-foreground px-2 py-0.5 text-xs font-medium">
      <AlertCircle className="h-3 w-3" />
      Low Stock
    </span>
  );
}
