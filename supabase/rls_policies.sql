-- =====================================================================
-- MedCare Connect — Supabase RLS setup
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- =====================================================================
-- Grants the app's anon key full SELECT/INSERT/UPDATE/DELETE on every
-- table the portal uses. This is appropriate for a single-app deployment
-- where the frontend is the only consumer.
-- =====================================================================

-- Enable RLS on all tables
alter table public.employees              enable row level security;
alter table public.entitlements           enable row level security;
alter table public.employee_entitlements  enable row level security;
alter table public.patients               enable row level security;
alter table public.appointments           enable row level security;
alter table public.medical_records        enable row level security;
alter table public.lab_tests              enable row level security;
alter table public.prescriptions          enable row level security;
alter table public.billing                enable row level security;
alter table public.notifications          enable row level security;
alter table public.audit_logs             enable row level security;

-- Drop existing policies if re-running
do $$ declare
  r record;
begin
  for r in (
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'employees','entitlements','employee_entitlements',
        'patients','appointments','medical_records','lab_tests',
        'prescriptions','billing','notifications','audit_logs'
      )
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- ── employees ─────────────────────────────────────────────────────────
create policy "app_employees_select" on public.employees
  for select to anon using (true);

create policy "app_employees_insert" on public.employees
  for insert to anon with check (true);

create policy "app_employees_update" on public.employees
  for update to anon using (true) with check (true);

create policy "app_employees_delete" on public.employees
  for delete to anon using (true);

-- ── entitlements ──────────────────────────────────────────────────────
create policy "app_entitlements_select" on public.entitlements
  for select to anon using (true);

create policy "app_entitlements_insert" on public.entitlements
  for insert to anon with check (true);

create policy "app_entitlements_update" on public.entitlements
  for update to anon using (true) with check (true);

create policy "app_entitlements_delete" on public.entitlements
  for delete to anon using (true);

-- ── employee_entitlements ─────────────────────────────────────────────
create policy "app_emp_ent_select" on public.employee_entitlements
  for select to anon using (true);

create policy "app_emp_ent_insert" on public.employee_entitlements
  for insert to anon with check (true);

create policy "app_emp_ent_update" on public.employee_entitlements
  for update to anon using (true) with check (true);

create policy "app_emp_ent_delete" on public.employee_entitlements
  for delete to anon using (true);

-- ── patients ──────────────────────────────────────────────────────────
create policy "app_patients_select" on public.patients
  for select to anon using (true);

create policy "app_patients_insert" on public.patients
  for insert to anon with check (true);

create policy "app_patients_update" on public.patients
  for update to anon using (true) with check (true);

create policy "app_patients_delete" on public.patients
  for delete to anon using (true);

-- ── appointments ──────────────────────────────────────────────────────
create policy "app_appointments_select" on public.appointments
  for select to anon using (true);

create policy "app_appointments_insert" on public.appointments
  for insert to anon with check (true);

create policy "app_appointments_update" on public.appointments
  for update to anon using (true) with check (true);

create policy "app_appointments_delete" on public.appointments
  for delete to anon using (true);

-- ── medical_records ───────────────────────────────────────────────────
create policy "app_medical_records_select" on public.medical_records
  for select to anon using (true);

create policy "app_medical_records_insert" on public.medical_records
  for insert to anon with check (true);

create policy "app_medical_records_update" on public.medical_records
  for update to anon using (true) with check (true);

create policy "app_medical_records_delete" on public.medical_records
  for delete to anon using (true);

-- ── lab_tests ─────────────────────────────────────────────────────────
create policy "app_lab_tests_select" on public.lab_tests
  for select to anon using (true);

create policy "app_lab_tests_insert" on public.lab_tests
  for insert to anon with check (true);

create policy "app_lab_tests_update" on public.lab_tests
  for update to anon using (true) with check (true);

create policy "app_lab_tests_delete" on public.lab_tests
  for delete to anon using (true);

-- ── prescriptions ─────────────────────────────────────────────────────
create policy "app_prescriptions_select" on public.prescriptions
  for select to anon using (true);

create policy "app_prescriptions_insert" on public.prescriptions
  for insert to anon with check (true);

create policy "app_prescriptions_update" on public.prescriptions
  for update to anon using (true) with check (true);

create policy "app_prescriptions_delete" on public.prescriptions
  for delete to anon using (true);

-- ── billing ───────────────────────────────────────────────────────────
create policy "app_billing_select" on public.billing
  for select to anon using (true);

create policy "app_billing_insert" on public.billing
  for insert to anon with check (true);

create policy "app_billing_update" on public.billing
  for update to anon using (true) with check (true);

create policy "app_billing_delete" on public.billing
  for delete to anon using (true);

-- ── notifications ─────────────────────────────────────────────────────
create policy "app_notifications_select" on public.notifications
  for select to anon using (true);

create policy "app_notifications_insert" on public.notifications
  for insert to anon with check (true);

create policy "app_notifications_update" on public.notifications
  for update to anon using (true) with check (true);

create policy "app_notifications_delete" on public.notifications
  for delete to anon using (true);

-- ── audit_logs ────────────────────────────────────────────────────────
create policy "app_audit_logs_select" on public.audit_logs
  for select to anon using (true);

create policy "app_audit_logs_insert" on public.audit_logs
  for insert to anon with check (true);

create policy "app_audit_logs_update" on public.audit_logs
  for update to anon using (true) with check (true);

create policy "app_audit_logs_delete" on public.audit_logs
  for delete to anon using (true);

-- ── Verify ────────────────────────────────────────────────────────────
-- Run this select after applying above to confirm all policies exist:
-- select tablename, policyname, cmd, roles
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, cmd;
