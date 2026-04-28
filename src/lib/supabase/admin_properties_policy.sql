-- Allow admins to view all properties
CREATE POLICY "Admins can view all properties"
ON public.properties FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Allow admins to insert properties for any user
CREATE POLICY "Admins can insert properties"
ON public.properties FOR INSERT
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Allow admins to delete properties
CREATE POLICY "Admins can delete properties"
ON public.properties FOR DELETE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Allow admins to update properties (e.g., approving a listing)
CREATE POLICY "Admins can update properties"
ON public.properties FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);
