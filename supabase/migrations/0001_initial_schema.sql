-- =====================================================================
-- MediVault: initial schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
--
-- Model: an account (auth.users) owns many profiles (self + family).
-- All health data hangs off profile_id. RLS: you can only touch rows
-- belonging to profiles you own.
-- =====================================================================


-- ---------- Shared helpers ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------- Profiles (self + family members) ----------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  relationship text not null
    check (relationship in ('self', 'spouse', 'parent', 'sibling', 'child', 'other')),
  name text not null check (char_length(name) between 1 and 100),
  consent_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Family members can only be added with explicit consent (recorded with a timestamp).
  constraint consent_required_for_family
    check (relationship = 'self' or consent_confirmed_at is not null)
);

create unique index profiles_one_self_per_user on public.profiles (owner_user_id)
  where relationship = 'self';
create index profiles_owner_idx on public.profiles (owner_user_id);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- A profile can't be turned into or out of "self".
create or replace function public.prevent_self_relationship_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (old.relationship = 'self') <> (new.relationship = 'self') then
    raise exception 'The relationship of the self profile cannot be changed';
  end if;
  return new;
end;
$$;

create trigger profiles_self_relationship_locked before update on public.profiles
  for each row execute function public.prevent_self_relationship_change();

-- Used by RLS policies. SECURITY DEFINER avoids RLS recursion on profiles
-- and keeps policy checks fast.
create or replace function public.is_profile_owner(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = p_profile_id and owner_user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_profile_owner(uuid) from public, anon;
grant execute on function public.is_profile_owner(uuid) to authenticated;

-- Create the "self" profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (owner_user_id, relationship, name)
  values (
    new.id,
    'self',
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Me')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------- Health profile (one per profile, entered by the user) ----------

create table public.health_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  date_of_birth date not null check (date_of_birth >= '1900-01-01'),
  gender text check (gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say')),
  blood_group text check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  no_known_allergies boolean not null default false,
  allergies text[] not null default '{}',
  conditions text[] not null default '{}',
  -- [{ "name": "...", "dosage": "..." }]
  medications jsonb not null default '[]' check (jsonb_typeof(medications) = 'array'),
  supplements jsonb not null default '[]' check (jsonb_typeof(supplements) = 'array'),
  medical_history text not null default '' check (char_length(medical_history) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint allergies_consistent
    check (not (no_known_allergies and cardinality(allergies) > 0))
);

create trigger health_profiles_updated_at before update on public.health_profiles
  for each row execute function public.set_updated_at();


-- ---------- Emergency contacts ----------

create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  relationship text not null check (char_length(relationship) between 1 and 50),
  phone text not null check (phone ~ '^\+?[0-9 -]{6,20}$'),
  alternate_phone text check (alternate_phone ~ '^\+?[0-9 -]{6,20}$'),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index emergency_contacts_profile_idx on public.emergency_contacts (profile_id);
create unique index emergency_contacts_one_primary on public.emergency_contacts (profile_id)
  where is_primary;

create trigger emergency_contacts_updated_at before update on public.emergency_contacts
  for each row execute function public.set_updated_at();


-- ---------- Documents (medical + identity) ----------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('medical', 'identity')),
  title text not null check (char_length(title) between 1 and 200),
  -- Medical documents
  category text check (category in
    ('Medical Report', 'Blood Test', 'Prescription', 'Discharge Summary', 'Supplement', 'Other')),
  status text not null default 'uploading'
    check (status in ('uploading', 'processing', 'review_required', 'completed', 'failed')),
  error_message text,
  -- Identity documents: only the last 4 characters are ever stored, never the full number.
  id_type text check (id_type in
    ('aadhaar', 'pan', 'voter_id', 'passport', 'driving_licence', 'other')),
  id_last4 text check (id_last4 ~ '^[A-Z0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kind_fields check (
    (kind = 'identity' and id_type is not null and category is null)
    or (kind = 'medical' and id_type is null and id_last4 is null)
  ),
  constraint aadhaar_last4_is_digits check (
    id_type is distinct from 'aadhaar' or id_last4 ~ '^[0-9]{4}$'
  )
);

create index documents_profile_kind_idx on public.documents (profile_id, kind, created_at desc);

create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();


-- ---------- AI extractions (medical documents only) ----------

create table public.document_extractions (
  document_id uuid primary key references public.documents (id) on delete cascade,
  fields jsonb not null,
  model text not null,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_has_timestamp check (verified = (verified_at is not null))
);

create trigger document_extractions_updated_at before update on public.document_extractions
  for each row execute function public.set_updated_at();

-- Identity documents must never be processed by AI: enforce it in the database too.
create or replace function public.ensure_extraction_is_medical()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.documents where id = new.document_id and kind = 'medical'
  ) then
    raise exception 'AI extractions are only allowed for medical documents';
  end if;
  return new;
end;
$$;

create trigger document_extractions_medical_only before insert or update on public.document_extractions
  for each row execute function public.ensure_extraction_is_medical();


-- ---------- Insurance (one policy can cover several profiles) ----------

create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  insurer text not null check (char_length(insurer) between 2 and 80),
  plan_name text check (char_length(plan_name) <= 80),
  policy_number text not null check (char_length(policy_number) between 3 and 40),
  member_id text check (char_length(member_id) <= 40),
  cover_type text not null check (cover_type in ('individual', 'family_floater')),
  sum_insured bigint check (sum_insured >= 0),
  valid_until date,
  tpa_name text check (char_length(tpa_name) <= 80),
  tpa_helpline text check (tpa_helpline ~ '^\+?[0-9 -]{6,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index insurance_policies_owner_idx on public.insurance_policies (owner_user_id);

create trigger insurance_policies_updated_at before update on public.insurance_policies
  for each row execute function public.set_updated_at();

create table public.insurance_policy_members (
  policy_id uuid not null references public.insurance_policies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (policy_id, profile_id)
);

create index insurance_policy_members_profile_idx on public.insurance_policy_members (profile_id);


-- ---------- Files (metadata for objects in the private "vault" bucket) ----------

create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  insurance_policy_id uuid references public.insurance_policies (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now(),
  constraint exactly_one_parent check (num_nonnulls(document_id, insurance_policy_id) = 1),
  -- Files live under "<owner_user_id>/..." in storage; the storage policies rely on this.
  constraint path_in_owner_folder check (storage_path like owner_user_id::text || '/%')
);

create index files_document_idx on public.files (document_id);
create index files_policy_idx on public.files (insurance_policy_id);

-- Note: deleting a row does not delete the storage object. The app deletes the
-- storage object first, then the row.


-- =====================================================================
-- Row Level Security
-- Policies apply to signed-in users only; anonymous users get nothing.
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.health_profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.documents enable row level security;
alter table public.document_extractions enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.insurance_policy_members enable row level security;
alter table public.files enable row level security;

-- Profiles: the "self" profile is created by the signup trigger and can't be deleted.
create policy "profiles: owner can read" on public.profiles
  for select to authenticated
  using (owner_user_id = (select auth.uid()));

create policy "profiles: owner can add family members" on public.profiles
  for insert to authenticated
  with check (owner_user_id = (select auth.uid()) and relationship <> 'self');

create policy "profiles: owner can update" on public.profiles
  for update to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

create policy "profiles: owner can delete family members" on public.profiles
  for delete to authenticated
  using (owner_user_id = (select auth.uid()) and relationship <> 'self');

-- Tables keyed by profile_id
create policy "health_profiles: profile owner" on public.health_profiles
  for all to authenticated
  using (public.is_profile_owner(profile_id))
  with check (public.is_profile_owner(profile_id));

create policy "emergency_contacts: profile owner" on public.emergency_contacts
  for all to authenticated
  using (public.is_profile_owner(profile_id))
  with check (public.is_profile_owner(profile_id));

create policy "documents: profile owner" on public.documents
  for all to authenticated
  using (public.is_profile_owner(profile_id))
  with check (public.is_profile_owner(profile_id));

create policy "document_extractions: document owner" on public.document_extractions
  for all to authenticated
  using (exists (
    select 1 from public.documents d
    where d.id = document_id and public.is_profile_owner(d.profile_id)
  ))
  with check (exists (
    select 1 from public.documents d
    where d.id = document_id and public.is_profile_owner(d.profile_id)
  ));

-- Insurance: owned by the account; members must be the account's own profiles.
create policy "insurance_policies: owner" on public.insurance_policies
  for all to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

create policy "insurance_policy_members: owner" on public.insurance_policy_members
  for all to authenticated
  using (
    public.is_profile_owner(profile_id)
    and exists (
      select 1 from public.insurance_policies p
      where p.id = policy_id and p.owner_user_id = (select auth.uid())
    )
  )
  with check (
    public.is_profile_owner(profile_id)
    and exists (
      select 1 from public.insurance_policies p
      where p.id = policy_id and p.owner_user_id = (select auth.uid())
    )
  );

-- Files: owned by the account, and the parent must be the account's too.
create policy "files: owner" on public.files
  for all to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (
    owner_user_id = (select auth.uid())
    and (document_id is null or exists (
      select 1 from public.documents d
      where d.id = document_id and public.is_profile_owner(d.profile_id)
    ))
    and (insurance_policy_id is null or exists (
      select 1 from public.insurance_policies p
      where p.id = insurance_policy_id and p.owner_user_id = (select auth.uid())
    ))
  );


-- =====================================================================
-- Storage: private "vault" bucket. Objects live at "<user_id>/<file_id>".
-- No public URLs; the app uses short-lived signed URLs.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vault', 'vault', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "vault: owner can read" on storage.objects
  for select to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "vault: owner can upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "vault: owner can update" on storage.objects
  for update to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "vault: owner can delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'vault' and (storage.foldername(name))[1] = (select auth.uid())::text);
