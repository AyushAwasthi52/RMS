import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const roleOptions: UserRole[] = ['customer', 'waiter', 'chef', 'manager'];

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignup && fullName.trim().length < 2) {
        throw new Error('Please enter a valid full name.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      if (isSignup) {
        await signUp(email, password, fullName, role);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        setError(String((err as { message: unknown }).message));
      } else {
        setError('Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center p-6">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6 space-y-5">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-primary">
            {isSignup ? 'Create your account' : 'Sign in to dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">Restaurant management access with encrypted database auth.</p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {isSignup && (
            <Input
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {isSignup && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setIsSignup((prev) => !prev)}
        >
          {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
