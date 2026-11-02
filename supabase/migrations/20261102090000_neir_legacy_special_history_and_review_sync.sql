-- Preserve the pre-existing legacy Special Registration applications and their IDs.
-- Historical attached documents remain in their original SQL/storage tables.
-- Only the document checklist is copied to the shared Citizen/Admin list.
INSERT INTO public.neir_prototype_special_applications
  (id,citizen_mobile,imei,reason,arrival_date,status,remarks,documents,submitted_at,updated_at)
SELECT l.id,l.citizen_mobile,l.imei,l.reason,l.arrival_date,l.status,
  l.reviewer_remarks,
  COALESCE((SELECT jsonb_agg(DISTINCT d.document_type)
    FROM public.neir_special_documents d WHERE d.registration_id=l.id),'[]'::jsonb),
  l.submitted_at,l.updated_at
FROM public.neir_special_registrations l
WHERE l.status IN ('Pending','In Progress','Accepted','Rejected')
ON CONFLICT (imei) DO NOTHING;

-- Admin actions already use the shared status RPC; keep the original legacy
-- row in sync for migrated IDs while preserving both existing event histories.
CREATE OR REPLACE FUNCTION public.neir_prototype_update_special(
  p_id uuid,p_status text,p_remarks text
)
RETURNS TABLE(id uuid,status text,updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog','public'
AS $$
DECLARE old_status text;
BEGIN
 IF p_status NOT IN ('In Progress','Accepted','Rejected')
    OR length(coalesce(p_remarks,''))>2000
    OR (p_status='Rejected' AND length(trim(coalesce(p_remarks,'')))=0)
 THEN RAISE EXCEPTION 'Invalid review update'; END IF;
 SELECT a.status INTO old_status FROM public.neir_prototype_special_applications a
 WHERE a.id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
 IF old_status NOT IN ('Pending','In Progress')
 THEN RAISE EXCEPTION 'Application already decided'; END IF;

 UPDATE public.neir_prototype_special_applications a
 SET status=p_status,remarks=coalesce(p_remarks,''),updated_at=now()
 WHERE a.id=p_id;
 UPDATE public.neir_special_registrations l
 SET status=p_status,reviewer_remarks=coalesce(p_remarks,''),
     updated_at=now(),
     reviewed_at=CASE WHEN p_status IN ('Accepted','Rejected')
       THEN now() ELSE l.reviewed_at END
 WHERE l.id=p_id;

 INSERT INTO public.neir_prototype_special_events(application_id,previous_status,new_status,event_type)
 VALUES(p_id,old_status,p_status,'Status changed');
 RETURN QUERY SELECT a.id,a.status,a.updated_at
   FROM public.neir_prototype_special_applications a WHERE a.id=p_id;
END;
$$;
