// -------------------------------------------------------------------
// Entitlement catalog + module gating.
//
// Entitlement IDs mirror what SailPoint ISC provisions into the
// `employee_entitlements` table. The portal never grants access on
// its own — it only reads what SailPoint has assigned.
// -------------------------------------------------------------------

export const ENTITLEMENTS = {
  PATIENT_MGMT: 'PATIENT_MGMT',
  APPOINTMENT_MGMT: 'APPOINTMENT_MGMT',
  MEDICAL_RECORDS: 'MEDICAL_RECORDS',
  MEDICAL_RECORDS_READ: 'MEDICAL_RECORDS_READ',
  PRESCRIPTION_MGMT: 'PRESCRIPTION_MGMT',
  LABORATORY: 'LABORATORY',
  LAB_RESULTS_READ: 'LAB_RESULTS_READ',
  BILLING: 'BILLING',
  RADIOLOGY: 'RADIOLOGY',
  PHARMACY: 'PHARMACY',
  REPORTS: 'REPORTS',
  EMPLOYEE_MGMT: 'EMPLOYEE_MGMT',
  ADMINISTRATION: 'ADMINISTRATION',
} as const;

export type EntitlementId = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'medical_records'
  | 'laboratory'
  | 'prescriptions'
  | 'billing'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'my_access';

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  path: string;
  // Any-of semantics: the module is visible if the employee holds at
  // least one of these entitlements. Empty array = always visible.
  requires: EntitlementId[];
};

export const MODULES: ModuleDefinition[] = [
  { key: 'dashboard',       label: 'Dashboard',       path: '/',              requires: [] },
  { key: 'patients',        label: 'Patients',        path: '/patients',      requires: [ENTITLEMENTS.PATIENT_MGMT] },
  { key: 'appointments',    label: 'Appointments',    path: '/appointments',  requires: [ENTITLEMENTS.APPOINTMENT_MGMT] },
  { key: 'medical_records', label: 'Medical Records', path: '/medical-records', requires: [ENTITLEMENTS.MEDICAL_RECORDS, ENTITLEMENTS.MEDICAL_RECORDS_READ] },
  { key: 'laboratory',      label: 'Laboratory',      path: '/laboratory',    requires: [ENTITLEMENTS.LABORATORY, ENTITLEMENTS.LAB_RESULTS_READ] },
  { key: 'prescriptions',   label: 'Prescriptions',   path: '/prescriptions', requires: [ENTITLEMENTS.PRESCRIPTION_MGMT] },
  { key: 'billing',         label: 'Billing',         path: '/billing',       requires: [ENTITLEMENTS.BILLING] },
  { key: 'reports',         label: 'Reports',         path: '/reports',       requires: [ENTITLEMENTS.REPORTS] },
  { key: 'notifications',   label: 'Notifications',   path: '/notifications', requires: [] },
  { key: 'profile',         label: 'Profile',         path: '/profile',       requires: [] },
  { key: 'my_access',       label: 'My Access',       path: '/my-access',     requires: [] },
];

export function hasAny(userEntitlements: Set<string>, required: EntitlementId[]): boolean {
  if (required.length === 0) return true;
  return required.some((r) => userEntitlements.has(r));
}
