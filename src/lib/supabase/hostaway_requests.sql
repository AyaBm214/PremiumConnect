-- Create the `hostaway_requests` table
CREATE TABLE IF NOT EXISTS public.hostaway_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    property_name TEXT, -- Can be account or specific property name
    request_date TIMESTAMPTZ DEFAULT now() NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_progress', 'completed')),
    hostaway_password TEXT, -- Provided by admin upon completion
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.hostaway_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view their own requests
CREATE POLICY "Users can view own hostaway requests"
ON public.hostaway_requests FOR SELECT
USING (auth.uid() = client_id);

-- Policy: Clients can insert their own requests
CREATE POLICY "Users can insert own hostaway requests"
ON public.hostaway_requests FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all hostaway requests"
ON public.hostaway_requests FOR SELECT
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update all hostaway requests"
ON public.hostaway_requests FOR UPDATE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Policy: Admins can delete requests
CREATE POLICY "Admins can delete hostaway requests"
ON public.hostaway_requests FOR DELETE
USING (
  (auth.jwt() -> 'user_metadata' ->> 'type') = 'admin'
  OR 
  (auth.jwt() ->> 'email') = 'admin@premiumconnect.com'
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hostaway_requests_updated_at
BEFORE UPDATE ON public.hostaway_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
