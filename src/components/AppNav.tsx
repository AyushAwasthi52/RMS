import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '@/types/restaurant';
import { UtensilsCrossed, ClipboardList, ChefHat, LayoutDashboard, Home } from 'lucide-react';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; path: string }> = {
  customer: { label: 'Customer', icon: <UtensilsCrossed className="h-5 w-5" />, path: '/customer' },
  waiter: { label: 'Waiter', icon: <ClipboardList className="h-5 w-5" />, path: '/waiter' },
  chef: { label: 'Chef', icon: <ChefHat className="h-5 w-5" />, path: '/chef' },
  manager: { label: 'Manager', icon: <LayoutDashboard className="h-5 w-5" />, path: '/manager' },
};

interface AppNavProps {
  role: UserRole;
  navItems?: { label: string; path: string; icon: React.ReactNode }[];
}

export function AppNav({ role, navItems }: AppNavProps) {
  const location = useLocation();
  const config = roleConfig[role];

  return (
    <nav className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-4 w-4" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-display text-lg font-semibold">{config.label} Dashboard</span>
        </div>
      </div>
      {navItems && (
        <div className="flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
