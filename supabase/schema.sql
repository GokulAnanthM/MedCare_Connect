-- =====================================================================
-- Hospital Operations Portal — Supabase schema
-- Source: Hospital_Supabase_Schema.xlsx
-- =====================================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- employees  (provisioned by SailPoint ISC from Airtable HR source)
-- ------------------------------------------------------------------
create table if not exists public.employees (
  id                    uuid primary key default gen_random_uuid(),
  employee_id           text not null unique,
  first_name            text not null,
  last_name             text not null,
  email                 text not null unique,
  phone                 text,
  person_type           text not null,
  employee_type         text not null,
  job_level             text not null,
  job_name              text not null,
  department            text not null,
  manager_employee_id   text,
  employment_status     text not null default 'Active',
  account_status        text not null default 'Active',
  hire_date             date not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- entitlements  (managed by SailPoint ISC)
-- ------------------------------------------------------------------
create table if not exists public.entitlements (
  id                uuid primary key default gen_random_uuid(),
  entitlement_id    text not null unique,
  entitlement_name  text not null unique,
  description       text,
  privileged        boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- employee_entitlements  (assigned via SailPoint access profiles /
-- birthright rules; the portal only reads this table)
-- ------------------------------------------------------------------
create table if not exists public.employee_entitlements (
  id              uuid primary key default gen_random_uuid(),
  employee_id     text not null references public.employees(employee_id) on delete cascade,
  entitlement_id  text not null references public.entitlements(entitlement_id) on delete cascade,
  assigned_at     timestamptz not null default now(),
  unique (employee_id, entitlement_id)
);

-- ------------------------------------------------------------------
-- patients
-- ------------------------------------------------------------------
create table if not exists public.patients (
  id                uuid primary key default gen_random_uuid(),
  patient_id        text not null unique,
  first_name        text not null,
  last_name         text not null,
  gender            text not null,
  date_of_birth     date not null,
  blood_group       text,
  phone             text,
  address           text,
  emergency_contact text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- appointments
-- ------------------------------------------------------------------
create table if not exists public.appointments (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          text not null references public.patients(patient_id) on delete cascade,
  doctor_employee_id  text not null references public.employees(employee_id) on delete restrict,
  appointment_date    timestamptz not null,
  status              text not null default 'Scheduled',
  notes               text
);

-- ------------------------------------------------------------------
-- medical_records
-- ------------------------------------------------------------------
create table if not exists public.medical_records (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          text not null references public.patients(patient_id) on delete cascade,
  doctor_employee_id  text not null references public.employees(employee_id) on delete restrict,
  diagnosis           text not null,
  treatment           text,
  created_at          timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- lab_tests
-- ------------------------------------------------------------------
create table if not exists public.lab_tests (
  id                          uuid primary key default gen_random_uuid(),
  patient_id                  text not null references public.patients(patient_id) on delete cascade,
  requested_by_employee_id    text not null references public.employees(employee_id) on delete restrict,
  assigned_to_employee_id     text references public.employees(employee_id) on delete set null,
  test_name                   text not null,
  status                      text not null default 'Pending',
  result                      text,
  completed_at                timestamptz
);

-- ------------------------------------------------------------------
-- prescriptions
-- ------------------------------------------------------------------
create table if not exists public.prescriptions (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          text not null references public.patients(patient_id) on delete cascade,
  doctor_employee_id  text not null references public.employees(employee_id) on delete restrict,
  medicine            text not null,
  dosage              text not null,
  instructions        text
);

-- ------------------------------------------------------------------
-- billing
-- ------------------------------------------------------------------
create table if not exists public.billing (
  id              uuid primary key default gen_random_uuid(),
  patient_id      text not null references public.patients(patient_id) on delete cascade,
  invoice_number  text not null unique,
  amount          numeric not null default 0,
  payment_status  text not null default 'Pending',
  payment_date    date
);

-- ------------------------------------------------------------------
-- notifications
-- ------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  employee_id  text not null references public.employees(employee_id) on delete cascade,
  title        text not null,
  message      text not null,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- audit_logs
-- ------------------------------------------------------------------
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  employee_id  text not null references public.employees(employee_id) on delete cascade,
  action       text not null,
  module       text not null,
  ip_address   text,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Helpful indexes
-- ------------------------------------------------------------------
create index if not exists idx_emp_ent_employee on public.employee_entitlements(employee_id);
create index if not exists idx_emp_ent_entitlement on public.employee_entitlements(entitlement_id);
create index if not exists idx_appt_doctor on public.appointments(doctor_employee_id);
create index if not exists idx_appt_patient on public.appointments(patient_id);
create index if not exists idx_notif_employee on public.notifications(employee_id, is_read);
