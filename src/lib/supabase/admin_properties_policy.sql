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
