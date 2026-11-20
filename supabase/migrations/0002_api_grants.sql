-- =====================================================================
-- MediVault: API access grants
-- Newer Supabase projects don't automatically expose new tables to the API.
-- Grant access to signed-in users only; RLS (0001) still decides WHICH rows.
-- Signed-out (anon) users get no table access at all.
-- =====================================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.health_profiles,
  public.emergency_contacts,
  public.documents,
  public.document_extractions,
  public.insurance_policies,
  public.insurance_policy_members,
  public.files
to authenticated;

revoke all on
  public.profiles,
  public.health_profiles,
  public.emergency_contacts,
  public.documents,
  public.document_extractions,
  public.insurance_policies,
  public.insurance_policy_members,
  public.files
from anon;
