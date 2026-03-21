import type { UserRole } from '@/types/restaurant';
import { supabase } from '@/lib/supabase';

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
};

type AuthResponse = {
  session_token: string;
  user_id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
};

function mapAuthResponse(row: AuthResponse) {
  return {
    token: row.session_token,
    user: {
      id: row.user_id,
      email: row.email,
      fullName: row.full_name,
    } as AppUser,
    roles: row.roles,
  };
}

export async function signUpWithDatabase(email: string, password: string, fullName: string, role: UserRole) {
  const { error } = await supabase.rpc('app_sign_up', {
    p_email: email,
    p_full_name: fullName,
    p_password: password,
    p_role: role,
  });
  if (error) throw error;
}

export async function signInWithDatabase(email: string, password: string) {
  const { data, error } = await supabase.rpc('app_sign_in', {
    p_email: email,
    p_password: password,
  });
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Invalid email or password.');
  return mapAuthResponse(data[0] as AuthResponse);
}

export async function validateDatabaseSession(token: string) {
  const { data, error } = await supabase.rpc('app_validate_session', {
    p_token: token,
  });
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return mapAuthResponse(data[0] as AuthResponse);
}

export async function signOutDatabaseSession(token: string) {
  const { error } = await supabase.rpc('app_sign_out', {
    p_token: token,
  });
  if (error) throw error;
}
