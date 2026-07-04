# MedCare Connect

The operations portal for **MedCare Hospital**, governed by **SailPoint Identity Security Cloud (ISC)** and backed by **Supabase**. Employees interact only with this portal; SailPoint provisions accounts and entitlements based on HR data flowing in from Airtable.

```
Airtable (HR Source)
        │
        ▼
SailPoint ISC   ← the only IAM system that governs this app
        │
        ▼
Hospital Operations Portal   ← this repo
        │
        ▼
Supabase (backend, transparent to end users)
```

## What SailPoint owns

- Employee accounts (rows in `employees`)
- Application entitlements (catalog in `entitlements`)
- Access profiles (Doctor Access, Nurse Access, Billing Access, HR Access, Hospital Administrator)
- Birthright access based on HR attributes (e.g. `department = Cardiology` + `job_name = Cardiologist` → **Doctor Access**)
- Provisioning, deprovisioning, and access changes

The portal never grants access on its own — it only **reads** what SailPoint has written into `employee_entitlements` and renders modules accordingly.

## Modules & required entitlements

| Module          | Required entitlement (any of)                          |
| --------------- | ------------------------------------------------------ |
| Dashboard       | *(always visible)*                                     |
| Patients        | `PATIENT_MGMT`                                         |
| Appointments    | `APPOINTMENT_MGMT`                                     |
| Medical Records | `MEDICAL_RECORDS` or `MEDICAL_RECORDS_READ`            |
| Laboratory      | `LABORATORY` or `LAB_RESULTS_READ`                     |
| Prescriptions   | `PRESCRIPTION_MGMT`                                    |
| Billing         | `BILLING`                                              |
| Reports         | `REPORTS`                                              |
| Notifications   | *(always visible — personal to the user)*              |
| Profile         | *(always visible)*                                     |
| My Access       | *(always visible)*                                     |

Enforcement is layered:

1. `Layout.tsx` hides sidebar entries the user cannot access.
2. `RequireEntitlement` in `App.tsx` blocks direct URL access.
3. Supabase Row-Level Security policies (add in your project) should enforce the same rules server-side.

## Setup

```bash
npm install
cp .env.example .env.local     # then fill in your Supabase URL + anon key
```

Connect the app to your existing Supabase project and confirm these tables already exist:

- `employees`
- `entitlements`
- `employee_entitlements`
- `patients`
- `appointments`
- `medical_records`
- `lab_tests`
- `prescriptions`
- `billing`
- `notifications`

[supabase/schema.sql](supabase/schema.sql) is a reference schema only. Do not run [supabase/seed.sql](supabase/seed.sql) against an existing environment unless you intentionally want the demo records.

Run the app:

```bash
npm run dev
```

## Demo sign-in

Because SSO is not part of this scaffold, the login screen lists the employees provisioned in Supabase. Pick one to see the portal from that person's entitlement set:

| Employee     | Access profile          | Modules seen                                             |
| ------------ | ----------------------- | -------------------------------------------------------- |
| John Smith   | Doctor Access           | Patients, Appointments, Medical Records, Laboratory, Prescriptions |
| Anita Rao    | Nurse Access            | Patients, Appointments, Medical Records (read-only), Laboratory (results only) |
| Marcus Lee   | Billing Access          | Billing, Reports                                         |
| Priya Nair   | HR Access               | Reports (Employee Management module reserved for portal admin UI) |
| Admin Ops    | Hospital Administrator  | All modules                                              |

To wire real authentication, swap `AuthContext.signInAsDemo` for Supabase Auth (OIDC/SAML federated to your IdP) and match `auth.uid()` / `auth.jwt() ->> 'email'` to `employees.email`.

## Project layout

```
supabase/
  schema.sql         # tables (from Hospital_Supabase_Schema.xlsx)
  seed.sql           # optional demo data only; not used by deployment
src/
  lib/
    supabase.ts        # Supabase client
    entitlements.ts    # entitlement IDs + module → entitlement mapping
    database.types.ts  # typed row shapes
  context/
    AuthContext.tsx    # loads employee + entitlements after sign-in
  components/
    Layout.tsx           # sidebar filtered by entitlements
    ProtectedRoute.tsx   # route guards
  pages/
    Login, Dashboard, Patients, Appointments, MedicalRecords,
    Laboratory, Prescriptions, Billing, Reports,
    Notifications, Profile, MyAccess
  App.tsx              # router + entitlement gates
  main.tsx
```
