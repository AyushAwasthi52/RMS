create extension if not exists "pgcrypto";

create type public.order_status as enum ('pending', 'cooking', 'ready', 'served', 'paid');
create type public.user_role as enum ('customer', 'waiter', 'chef', 'manager');
create type public.table_status as enum ('available', 'occupied', 'reserved');

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.app_users(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  available boolean not null default true,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.tables (
  number integer primary key,
  seats integer not null check (seats > 0),
  status public.table_status not null default 'available',
  current_order_id uuid
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_number integer not null references public.tables(number),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  waiter_id uuid references public.app_users(id),
  total numeric(10,2) not null check (total >= 0),
  notes text
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id),
  quantity integer not null check (quantity > 0),
  notes text
);

alter table public.tables
  drop constraint if exists tables_current_order_id_fkey,
  add constraint tables_current_order_id_fkey
    foreign key (current_order_id) references public.orders(id) on delete set null;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric(10,2) not null check (quantity >= 0),
  unit text not null,
  min_threshold numeric(10,2) not null check (min_threshold >= 0),
  last_restocked timestamptz not null default now()
);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
create index if not exists idx_user_sessions_expiry on public.user_sessions(expires_at);

drop function if exists public.app_sign_up(text, text, text, public.user_role);

create or replace function public.app_sign_up(
  p_email text,
  p_full_name text,
  p_password text,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if length(p_password) < 8 then
    raise exception 'Password must be at least 8 characters.';
  end if;

  insert into public.app_users (email, full_name, password_hash)
  values (
    lower(trim(p_email)),
    trim(p_full_name),
    crypt(p_password, gen_salt('bf', 12))
  )
  returning id into v_user_id;

  insert into public.user_roles (user_id, role)
  values (v_user_id, p_role);
end;
$$;

create or replace function public.app_sign_in(
  p_email text,
  p_password text
)
returns table (
  session_token text,
  user_id uuid,
  email text,
  full_name text,
  roles public.user_role[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.app_users%rowtype;
  v_token text;
begin
  select * into v_user
  from public.app_users
  where app_users.email = lower(trim(p_email))
    and app_users.is_active = true
  limit 1;

  if v_user.id is null or v_user.password_hash <> crypt(p_password, v_user.password_hash) then
    raise exception 'Invalid email or password.';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.user_sessions (user_id, token_hash, expires_at)
  values (
    v_user.id,
    encode(digest(v_token, 'sha256'), 'hex'),
    now() + interval '7 days'
  );

  return query
  select
    v_token,
    v_user.id,
    v_user.email,
    v_user.full_name,
    coalesce(array_agg(ur.role), '{}'::public.user_role[])
  from public.user_roles ur
  where ur.user_id = v_user.id;
end;
$$;

create or replace function public.app_validate_session(
  p_token text
)
returns table (
  session_token text,
  user_id uuid,
  email text,
  full_name text,
  roles public.user_role[]
)
language sql
security definer
set search_path = public
as $$
  select
    p_token as session_token,
    u.id as user_id,
    u.email,
    u.full_name,
    coalesce(array_agg(ur.role), '{}'::public.user_role[]) as roles
  from public.user_sessions s
  join public.app_users u on u.id = s.user_id
  left join public.user_roles ur on ur.user_id = u.id
  where s.token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and s.revoked_at is null
    and s.expires_at > now()
    and u.is_active = true
  group by u.id, u.email, u.full_name;
$$;

create or replace function public.app_sign_out(
  p_token text
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.user_sessions
  set revoked_at = now()
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and revoked_at is null;
$$;

grant execute on function public.app_sign_up(text, text, text, public.user_role) to anon;
grant execute on function public.app_sign_in(text, text) to anon;
grant execute on function public.app_validate_session(text) to anon;
grant execute on function public.app_sign_out(text) to anon;

alter table public.app_users enable row level security;
alter table public.user_roles enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.user_sessions enable row level security;

create policy "allow anon read users"
  on public.app_users
  for select
  to anon
  using (true);

create policy "allow anon read roles"
  on public.user_roles
  for select
  to anon
  using (true);

create policy "allow anon read menu"
  on public.menu_items
  for select
  to anon
  using (true);

create policy "allow anon write menu"
  on public.menu_items
  for all
  to anon
  using (true)
  with check (true);

create policy "allow anon read tables"
  on public.tables
  for select
  to anon
  using (true);

create policy "allow anon update tables"
  on public.tables
  for all
  to anon
  using (true)
  with check (true);

create policy "allow anon read orders"
  on public.orders
  for select
  to anon
  using (true);

create policy "allow anon write orders"
  on public.orders
  for all
  to anon
  using (true)
  with check (true);

create policy "allow anon read order items"
  on public.order_items
  for select
  to anon
  using (true);

create policy "allow anon write order items"
  on public.order_items
  for all
  to anon
  using (true)
  with check (true);

create policy "allow anon read inventory"
  on public.inventory_items
  for select
  to anon
  using (true);

create policy "allow anon update inventory"
  on public.inventory_items
  for all
  to anon
  using (true)
  with check (true);
