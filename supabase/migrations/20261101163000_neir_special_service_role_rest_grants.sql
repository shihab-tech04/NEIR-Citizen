-- Correct the private server-side Data API grants used by the isolated NEIR-demo
-- Special Registration Edge Function. The original table lockdown correctly
-- removed anonymous access but also removed privileges needed by service_role.
--
-- Keep RLS enabled, the private Storage bucket unchanged and browser roles
-- unprivileged. No extra functionality or data is introduced.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.neir_special_registrations,
  public.neir_special_documents,
  public.neir_special_registration_events
TO service_role;

GRANT SELECT ON TABLE public.neir_special_reviewers TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.neir_special_registration_events_id_seq TO service_role;

-- Explicitly retain the private Citizen/Admin data boundary.
REVOKE ALL ON TABLE
  public.neir_special_registrations,
  public.neir_special_documents,
  public.neir_special_registration_events,
  public.neir_special_reviewers
FROM anon, authenticated;

ALTER TABLE public.neir_special_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neir_special_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neir_special_registration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neir_special_reviewers ENABLE ROW LEVEL SECURITY;
