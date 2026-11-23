-- Synthetic IMEI fixtures for the existing citizen Special Registration journey.
-- These records are not an official NEIR/BTRC device-verification dataset.
CREATE TABLE IF NOT EXISTS public.neir_special_eligible_imeis (
  imei text PRIMARY KEY CHECK (imei ~ '^[0-9]{15}$'),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.neir_special_eligible_imeis IS
  'NEIR citizen prototype: predefined synthetic eligible IMEIs only, not official registry records.';

ALTER TABLE public.neir_special_eligible_imeis ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.neir_special_eligible_imeis FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.neir_special_eligible_imeis TO service_role;

INSERT INTO public.neir_special_eligible_imeis (imei, enabled) VALUES
  ('990001234567899', true),
  ('990001234567907', true),
  ('990001234567915', true)
ON CONFLICT (imei) DO UPDATE SET enabled = EXCLUDED.enabled;
