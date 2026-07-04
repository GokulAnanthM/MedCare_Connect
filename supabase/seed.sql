-- =====================================================================
-- Hospital Operations Portal — seed data
-- Mirrors SailPoint ISC entitlements, access profiles, and birthright.
-- =====================================================================

-- ------------------------------------------------------------------
-- Entitlements catalog (single source of truth for the portal)
-- These IDs must match the values SailPoint pushes for each employee.
-- ------------------------------------------------------------------
insert into public.entitlements (entitlement_id, entitlement_name, description, privileged) values
  ('PATIENT_MGMT',        'Patient Management',        'Create, view, and update patient records',            false),
  ('APPOINTMENT_MGMT',    'Appointment Management',    'Schedule and manage patient appointments',            false),
  ('MEDICAL_RECORDS',     'Medical Records',           'Full read/write on clinical medical records',         false),
  ('MEDICAL_RECORDS_READ','Medical Records (Read Only)','Read-only clinical medical records',                 false),
  ('PRESCRIPTION_MGMT',   'Prescription Management',   'Issue and manage prescriptions',                      false),
  ('LABORATORY',          'Laboratory',                'Order and process laboratory tests',                  false),
  ('LAB_RESULTS_READ',    'Laboratory Results',        'Read-only laboratory results',                        false),
  ('BILLING',             'Billing',                   'Manage patient invoices and payments',                false),
  ('RADIOLOGY',           'Radiology',                 'Access radiology workflows',                          false),
  ('PHARMACY',            'Pharmacy',                  'Access pharmacy workflows',                           false),
  ('REPORTS',             'Reports',                   'Operational and financial reports',                   false),
  ('EMPLOYEE_MGMT',       'Employee Management',       'Manage employee records within the portal',           true),
  ('ADMINISTRATION',      'Administration',            'Portal administration and configuration',             true)
on conflict (entitlement_id) do nothing;

-- ------------------------------------------------------------------
-- Demonstration employees
-- In production these rows are provisioned by SailPoint ISC.
-- ------------------------------------------------------------------
insert into public.employees
  (employee_id, first_name, last_name, email, phone, person_type, employee_type, job_level, job_name, department, manager_employee_id, employment_status, account_status, hire_date)
values
  ('EMP000123', 'John',    'Smith',    'john.smith@hospital.example',    '555-0101', 'Employee', 'Full-Time', 'Senior',   'Cardiologist',           'Cardiology',     'EMP000900', 'Active', 'Active', '2021-05-14'),
  ('EMP000200', 'Anita',   'Rao',      'anita.rao@hospital.example',     '555-0102', 'Employee', 'Full-Time', 'Mid',      'Registered Nurse',      'Cardiology',     'EMP000123', 'Active', 'Active', '2022-02-01'),
  ('EMP000310', 'Marcus',  'Lee',      'marcus.lee@hospital.example',    '555-0103', 'Employee', 'Full-Time', 'Mid',      'Billing Specialist',    'Finance',        'EMP000901', 'Active', 'Active', '2020-09-10'),
  ('EMP000410', 'Priya',   'Nair',     'priya.nair@hospital.example',    '555-0104', 'Employee', 'Full-Time', 'Senior',   'HR Business Partner',   'Human Resources','EMP000902', 'Active', 'Active', '2019-06-20'),
  ('EMP000900', 'Elena',   'Rossi',    'elena.rossi@hospital.example',   '555-0105', 'Employee', 'Full-Time', 'Executive','Chief Medical Officer', 'Executive',      null,         'Active', 'Active', '2015-01-05'),
  ('EMP000999', 'Admin',   'Ops',      'admin.ops@hospital.example',     '555-0999', 'Employee', 'Full-Time', 'Executive','Hospital Administrator','IT',             null,         'Active', 'Active', '2016-03-15')
on conflict (employee_id) do nothing;

-- ------------------------------------------------------------------
-- Birthright / access-profile assignments
-- (Real assignments come from SailPoint; seeded here for demo.)
-- ------------------------------------------------------------------

-- Doctor Access  → John Smith (Cardiologist, birthright)
insert into public.employee_entitlements (employee_id, entitlement_id) values
  ('EMP000123', 'PATIENT_MGMT'),
  ('EMP000123', 'MEDICAL_RECORDS'),
  ('EMP000123', 'PRESCRIPTION_MGMT'),
  ('EMP000123', 'LABORATORY'),
  ('EMP000123', 'APPOINTMENT_MGMT')
on conflict do nothing;

-- Nurse Access → Anita Rao
insert into public.employee_entitlements (employee_id, entitlement_id) values
  ('EMP000200', 'PATIENT_MGMT'),
  ('EMP000200', 'MEDICAL_RECORDS_READ'),
  ('EMP000200', 'LAB_RESULTS_READ'),
  ('EMP000200', 'APPOINTMENT_MGMT')
on conflict do nothing;

-- Billing Access → Marcus Lee
insert into public.employee_entitlements (employee_id, entitlement_id) values
  ('EMP000310', 'BILLING'),
  ('EMP000310', 'REPORTS')
on conflict do nothing;

-- HR Access → Priya Nair
insert into public.employee_entitlements (employee_id, entitlement_id) values
  ('EMP000410', 'EMPLOYEE_MGMT'),
  ('EMP000410', 'REPORTS')
on conflict do nothing;

-- Hospital Administrator → Admin Ops (all entitlements)
insert into public.employee_entitlements (employee_id, entitlement_id)
select 'EMP000999', entitlement_id from public.entitlements
on conflict do nothing;

-- CMO → Elena Rossi (broad clinical + reports)
insert into public.employee_entitlements (employee_id, entitlement_id) values
  ('EMP000900', 'PATIENT_MGMT'),
  ('EMP000900', 'MEDICAL_RECORDS'),
  ('EMP000900', 'APPOINTMENT_MGMT'),
  ('EMP000900', 'REPORTS')
on conflict do nothing;

-- ------------------------------------------------------------------
-- Sample patients + activity
-- ------------------------------------------------------------------
insert into public.patients (patient_id, first_name, last_name, gender, date_of_birth, blood_group, phone, address, emergency_contact) values
  ('PAT000001', 'Alice',   'Nguyen',  'Female', '1984-07-22', 'O+',  '555-2001', '12 Willow Ln',   '555-2002'),
  ('PAT000002', 'Robert',  'Chen',    'Male',   '1972-03-11', 'A-',  '555-2003', '88 Maple Ave',   '555-2004'),
  ('PAT000003', 'Sofia',   'Alvarez', 'Female', '1995-11-30', 'B+',  '555-2005', '4 Birch Ct',     '555-2006')
on conflict do nothing;

insert into public.appointments (patient_id, doctor_employee_id, appointment_date, status, notes) values
  ('PAT000001', 'EMP000123', now() + interval '1 day',  'Scheduled', 'Follow-up ECG'),
  ('PAT000002', 'EMP000123', now() + interval '3 days', 'Scheduled', 'Consultation'),
  ('PAT000003', 'EMP000123', now() - interval '2 days', 'Completed', 'Post-op check');

insert into public.medical_records (patient_id, doctor_employee_id, diagnosis, treatment) values
  ('PAT000001', 'EMP000123', 'Hypertension stage 1', 'Lifestyle + amlodipine 5mg'),
  ('PAT000002', 'EMP000123', 'Atrial fibrillation',  'Anticoagulation therapy');

insert into public.lab_tests (patient_id, requested_by_employee_id, assigned_to_employee_id, test_name, status, result, completed_at) values
  ('PAT000001', 'EMP000123', null,        'Lipid Panel', 'Pending',   null, null),
  ('PAT000002', 'EMP000123', 'EMP000200', 'CBC',         'Completed', 'WBC 6.2, Hgb 14.1', now() - interval '1 day');

insert into public.prescriptions (patient_id, doctor_employee_id, medicine, dosage, instructions) values
  ('PAT000001', 'EMP000123', 'Amlodipine', '5 mg', 'Once daily, morning'),
  ('PAT000002', 'EMP000123', 'Warfarin',   '2 mg', 'Once daily, monitor INR');

insert into public.billing (patient_id, invoice_number, amount, payment_status, payment_date) values
  ('PAT000001', 'INV-1001', 350.00, 'Paid',    current_date - 1),
  ('PAT000002', 'INV-1002', 1240.50,'Pending', null),
  ('PAT000003', 'INV-1003', 90.00,  'Paid',    current_date - 5);

insert into public.notifications (employee_id, title, message, is_read) values
  ('EMP000123', 'New appointment',   'Alice Nguyen booked for tomorrow.', false),
  ('EMP000200', 'Lab result ready',  'CBC results available for review.', false),
  ('EMP000310', 'Invoice overdue',   'INV-1002 is awaiting payment.',     false);
