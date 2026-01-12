-- Run this in the Supabase SQL Editor to make a user an admin.
-- Make sure to change the email if it is different.

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"type": "admin"}'::jsonb
where email = 'admin@premiumconnect.com';
