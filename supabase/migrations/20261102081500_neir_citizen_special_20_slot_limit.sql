-- Special Registration only: count each citizen's non-accepted IMEIs, max 20.
-- Existing accepted and rejected history remains intact and visible.
ALTER TABLE public.neir_prototype_special_applications
  ADD COLUMN IF NOT EXISTS citizen_mobile text;
ALTER TABLE public.neir_prototype_special_applications
  ADD CONSTRAINT neir_prototype_special_citizen_mobile_check
  CHECK (citizen_mobile ~ '^01[0-9]{9}$');
-- NEIR prototype pipeline had no rows before this migration. Do not backfill
-- arbitrary owners if this changes; reconcile ownership before applying.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.neir_prototype_special_applications WHERE citizen_mobile IS NULL) THEN
    RAISE EXCEPTION 'Cannot assign historical registration owners automatically';
  END IF;
END
$$;
ALTER TABLE public.neir_prototype_special_applications
  ALTER COLUMN citizen_mobile SET NOT NULL;

CREATE INDEX IF NOT EXISTS neir_prototype_special_citizen_history
ON public.neir_prototype_special_applications(citizen_mobile,submitted_at DESC);

CREATE OR REPLACE FUNCTION public.neir_prototype_submit_special_citizen(
  p_mobile text, p_imei text, p_reason text, p_arrival date, p_documents jsonb
)
RETURNS TABLE(id uuid,status text,submitted_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog','public'
AS $$
DECLARE v_id uuid;
BEGIN
  IF p_mobile IS NULL OR p_mobile !~ '^01[0-9]{9}$'
    OR p_imei IS NULL OR p_imei !~ '^[0-9]{14,15}$'
    OR p_reason IS NULL OR p_reason NOT IN ('airmail','gift','foreign-tour')
    OR p_arrival IS NULL OR p_arrival > CURRENT_DATE OR p_arrival < DATE '2000-01-01'
    OR p_documents IS NULL OR jsonb_typeof(p_documents) <> 'array'
    OR jsonb_array_length(p_documents) > 8
  THEN RAISE EXCEPTION 'Invalid Special Registration input'; END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(p_documents) d
    WHERE d NOT IN ('courierBill','packingList','commercialInvoice',
      'donorPassport','donorArrivalSeal','imeiBox','giftDeed',
      'passportInfo','arrivalSeal','travelDocument')
  ) THEN RAISE EXCEPTION 'Invalid document checklist'; END IF;
  IF (p_reason='airmail' AND NOT p_documents ? 'commercialInvoice')
    OR (p_reason='gift' AND EXISTS (
      SELECT 1 FROM unnest(ARRAY['donorPassport','donorArrivalSeal','imeiBox','giftDeed']) required
      WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(p_documents) d WHERE d=required)
    ))
    OR (p_reason='foreign-tour' AND EXISTS (
      SELECT 1 FROM unnest(ARRAY['passportInfo','arrivalSeal','imeiBox']) required
      WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(p_documents) d WHERE d=required)
    ))
  THEN RAISE EXCEPTION 'Required documents are missing'; END IF;

  -- Serialize concurrent submissions for the same citizen, not across citizens.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_mobile, 0));
  IF EXISTS (SELECT 1 FROM public.neir_prototype_special_applications WHERE imei=p_imei)
  THEN RAISE EXCEPTION 'This IMEI already has a Special Registration application'; END IF;
  IF (SELECT count(*) FROM public.neir_prototype_special_applications a
      WHERE a.citizen_mobile=p_mobile AND a.status <> 'Accepted') >= 20
  THEN RAISE EXCEPTION 'SPECIAL_REGISTRATION_LIMIT_REACHED'; END IF;

  INSERT INTO public.neir_prototype_special_applications
    (citizen_mobile,imei,reason,arrival_date,documents)
  VALUES (p_mobile,p_imei,p_reason,p_arrival,p_documents)
  RETURNING neir_prototype_special_applications.id INTO v_id;
  INSERT INTO public.neir_prototype_special_events(application_id,new_status,event_type)
  VALUES(v_id,'Pending','Submitted');
  RETURN QUERY SELECT a.id,a.status,a.submitted_at
    FROM public.neir_prototype_special_applications a WHERE a.id=v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.neir_prototype_submit_special_citizen(text,text,text,date,jsonb)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.neir_prototype_submit_special_citizen(text,text,text,date,jsonb)
  TO service_role;
-- Retire the old submit RPC, which cannot identify a citizen or enforce quota.
REVOKE EXECUTE ON FUNCTION public.neir_prototype_submit_special(text,text,date,jsonb)
  FROM PUBLIC,anon,authenticated;
