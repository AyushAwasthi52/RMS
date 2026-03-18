import { Link } from 'react-router-dom';
import { UtensilsCrossed, ClipboardList, ChefHat, LayoutDashboard } from 'lucide-react';

const roles = [
  { label: 'Customer', description: 'Browse menu and place orders', icon: <UtensilsCrossed className="h-8 w-8" />, path: '/customer' },
  { label: 'Waiter', description: 'Manage tables and serve orders', icon: <ClipboardList className="h-8 w-8" />, path: '/waiter' },
  { label: 'Chef', description: 'View and prepare kitchen orders', icon: <ChefHat className="h-8 w-8" />, path: '/chef' },
  { label: 'Manager', description: 'Oversee operations and reports', icon: <LayoutDashboard className="h-8 w-8" />, path: '/manager' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold">Restaurant Management System</h1>
          <p className="text-sm text-muted-foreground">Select your role to continue.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(role => (
            <Link
              key={role.path}
              to={role.path}
              className="rounded-md border-2 border-border bg-card p-6 text-center space-y-3 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div className="flex justify-center text-muted-foreground">{role.icon}</div>
              <h2 className="font-display text-lg font-semibold">{role.label}</h2>
              <p className="text-xs text-muted-foreground">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
