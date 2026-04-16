-- Add onboarding_phase column to properties table
-- 1: Signature du contrat
-- 2: Audit documentaire
-- 3: Démarrage d'embarquement
-- 4: Vérification des accès
-- 5: Finalisation

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS onboarding_phase INTEGER DEFAULT 1;

-- Update existing records if any
UPDATE public.properties SET onboarding_phase = 1 WHERE onboarding_phase IS NULL;
