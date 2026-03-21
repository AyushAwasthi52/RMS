insert into public.tables (number, seats, status)
values
  (1, 2, 'available'),
  (2, 4, 'available'),
  (3, 4, 'available'),
  (4, 2, 'available'),
  (5, 6, 'available'),
  (6, 4, 'reserved'),
  (7, 4, 'available'),
  (8, 8, 'available'),
  (9, 2, 'available'),
  (10, 6, 'available')
on conflict (number) do nothing;

insert into public.menu_items (name, description, price, category, available)
values
  ('Butter Chicken', 'Creamy tomato-based curry with tender chicken', 320, 'Main Course', true),
  ('Paneer Tikka', 'Grilled cottage cheese with spices', 240, 'Starters', true),
  ('Dal Makhani', 'Slow-cooked black lentils in butter gravy', 220, 'Main Course', true),
  ('Garlic Naan', 'Tandoor-baked flatbread with garlic', 60, 'Breads', true),
  ('Chicken Biryani', 'Fragrant basmati rice with spiced chicken', 280, 'Rice', true),
  ('Gulab Jamun', 'Deep-fried milk dumplings in sugar syrup', 120, 'Desserts', true),
  ('Masala Dosa', 'Crispy crepe with spiced potato filling', 160, 'Starters', true),
  ('Tandoori Chicken', 'Marinated chicken roasted in clay oven', 340, 'Main Course', false),
  ('Mango Lassi', 'Chilled yogurt drink with mango', 90, 'Beverages', true),
  ('Raita', 'Yogurt with cucumber and spices', 70, 'Sides', true)
on conflict do nothing;

insert into public.inventory_items (name, quantity, unit, min_threshold)
values
  ('Chicken', 12, 'kg', 5),
  ('Basmati Rice', 25, 'kg', 10),
  ('Paneer', 3, 'kg', 4),
  ('Butter', 2, 'kg', 3),
  ('Tomatoes', 8, 'kg', 5)
on conflict do nothing;

-- Seed auth users for quick local testing
insert into public.app_users (email, full_name, password_hash, is_active)
values
  ('customer@rms.local', 'Test Customer', extensions.crypt('Password123!', extensions.gen_salt('bf', 12)), true),
  ('waiter@rms.local', 'Test Waiter', extensions.crypt('Password123!', extensions.gen_salt('bf', 12)), true),
  ('chef@rms.local', 'Test Chef', extensions.crypt('Password123!', extensions.gen_salt('bf', 12)), true),
  ('manager@rms.local', 'Test Manager', extensions.crypt('Password123!', extensions.gen_salt('bf', 12)), true),
  ('multirole@rms.local', 'Test Multi Role', extensions.crypt('Password123!', extensions.gen_salt('bf', 12)), true)
on conflict (email) do update
set full_name = excluded.full_name,
    is_active = excluded.is_active;

insert into public.user_roles (user_id, role)
select u.id, v.role::public.user_role
from public.app_users u
join (
  values
    ('customer@rms.local', 'customer'),
    ('waiter@rms.local', 'waiter'),
    ('chef@rms.local', 'chef'),
    ('manager@rms.local', 'manager'),
    ('multirole@rms.local', 'manager'),
    ('multirole@rms.local', 'chef')
) as v(email, role)
  on v.email = u.email
on conflict (user_id, role) do nothing;
