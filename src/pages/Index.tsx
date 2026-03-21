import { Link, Navigate } from 'react-router-dom';
import { ClipboardList, ChefHat, LayoutDashboard, LogOut, Settings, User, UtensilsCrossed } from 'lucide-react';
import type { UserRole } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const roleConfig: Record<UserRole, { label: string; description: string; icon: React.ReactNode; path: string }> = {
  customer: { label: 'Customer', description: 'Browse menu and place orders', icon: <UtensilsCrossed className="h-6 w-6" />, path: '/customer' },
  waiter: { label: 'Waiter', description: 'Manage tables and serve orders', icon: <ClipboardList className="h-6 w-6" />, path: '/waiter' },
  chef: { label: 'Chef', description: 'View and prepare kitchen orders', icon: <ChefHat className="h-6 w-6" />, path: '/chef' },
  manager: { label: 'Manager', description: 'Oversee operations and reports', icon: <LayoutDashboard className="h-6 w-6" />, path: '/manager' },
};

export default function Index() {
  const { user, roles, signOut } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userName = user.fullName || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-md border border-border bg-card md:grid-cols-[250px_1fr]">
        <aside className="bg-primary/90 text-primary-foreground p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold">Restaurant Hub</h2>
            <p className="text-xs text-primary-foreground/80">Account workspace</p>
          </div>
          <nav className="space-y-2 text-sm">
            <div className="flex items-center gap-2 opacity-95">
              <Settings className="h-4 w-4" /> Settings
            </div>
            <div className="flex items-center gap-2 opacity-80">
              <User className="h-4 w-4" /> My Profile
            </div>
          </nav>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </aside>

        <main className="p-6 md:p-8 space-y-8">
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-primary">Your Account Settings</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>

          <div className="rounded-md border border-border p-4 space-y-3">
            <div className="text-sm">
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{userName}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Email address</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Role Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles assigned yet. Please contact a manager.</p>
              ) : (
                roles.map((role) => {
                  const config = roleConfig[role];
                  return (
                    <Link
                      key={config.path}
                      to={config.path}
                      className="rounded-md border border-border bg-background p-4 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-primary">{config.icon}</div>
                        <div>
                          <h3 className="font-medium">{config.label}</h3>
                          <p className="text-xs text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
