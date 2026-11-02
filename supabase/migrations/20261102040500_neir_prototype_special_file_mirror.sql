-- Preserve the approved 20-IMEI quota and status contract, while atomically
-- associating private uploaded files with the citizen's Special Registration.
-- The existing checklist-only records and the legacy secured documents remain unchanged.
CREATE OR REPLACE FUNCTION public.neir_prototype_submit_special_citizen_files(
  p_mobile text, p_imei text, p_reason text, p_arrival date,
  p_document_types jsonb, p_files jsonb
)
RETURNS TABLE(id uuid, status text, submitted_at timestamptz)
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog, public
AS $$
DECLARE
  result_record record;
BEGIN
  IF p_files IS NULL OR jsonb_typeof(p_files) <> 'array'
    OR p_document_types IS NULL OR jsonb_typeof(p_document_types) <> 'array'
    OR jsonb_array_length(p_files) < 1 OR jsonb_array_length(p_files) > 8
    OR jsonb_array_length(p_files) <> jsonb_array_length(p_document_types)
  THEN RAISE EXCEPTION 'Invalid uploaded document manifest'; END IF;

  IF (SELECT count(DISTINCT d->>'type') FROM jsonb_array_elements(p_files) AS d)
     <> jsonb_array_length(p_files)
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(p_files) AS d
      WHERE jsonb_typeof(d) <> 'object'
        OR d->>'type' IS NULL OR d->>'type' NOT IN
            (SELECT jsonb_array_elements_text(p_document_types))
        OR COALESCE(length(d->>'name'),0) NOT BETWEEN 1 AND 180
        OR d->>'mime' NOT IN ('image/png','image/jpeg','application/pdf')
        OR (d->>'size') !~ '^[0-9]+$'
        OR (d->>'size')::integer NOT BETWEEN 1 AND 1048576
        OR d->>'path' !~ '^prototype/[0-9a-f-]{36}/[A-Za-z][A-Za-z0-9]*-[0-9a-f-]{36}$'
    )
  THEN RAISE EXCEPTION 'Uploaded document metadata is invalid'; END IF;

  SELECT result.id, result.status, result.submitted_at
    INTO result_record
    FROM public.neir_prototype_submit_special_citizen(
      p_mobile,p_imei,p_reason,p_arrival,p_document_types
    ) AS result;

  IF result_record.id IS NULL THEN
    RAISE EXCEPTION 'Special Registration was not created';
  END IF;
  -- SQL transaction commits both the registration and its exact file manifest.
  UPDATE public.neir_prototype_special_applications
     SET documents = p_files
   WHERE neir_prototype_special_applications.id = result_record.id;

  RETURN QUERY
    SELECT result_record.id::uuid, result_record.status::text,
           result_record.submitted_at::timestamptz;
END
$$;
REVOKE ALL ON FUNCTION public.neir_prototype_submit_special_citizen_files(text,text,text,date,jsonb,jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.neir_prototype_submit_special_citizen_files(text,text,text,date,jsonb,jsonb)
  TO service_role;
