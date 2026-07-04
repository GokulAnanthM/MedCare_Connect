// Minimal typed row shapes for the tables the portal reads/writes.
// Kept hand-authored (rather than generated) so the file has no external
// tooling dependency for this scaffold.

export type Employee = {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  person_type: string;
  employee_type: string;
  job_level: string;
  job_name: string;
  department: string;
  manager_employee_id: string | null;
  employment_status: string;
  account_status: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
};

export type Entitlement = {
  id: string;
  entitlement_id: string;
  entitlement_name: string;
  description: string | null;
  privileged: boolean;
  created_at: string;
};

export type EmployeeEntitlement = {
  id: string;
  employee_id: string;
  entitlement_id: string;
  assigned_at: string;
};

export type Patient = {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  blood_group: string | null;
  phone: string | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_employee_id: string;
  appointment_date: string;
  status: string;
  notes: string | null;
};

export type MedicalRecord = {
  id: string;
  patient_id: string;
  doctor_employee_id: string;
  diagnosis: string;
  treatment: string | null;
  created_at: string;
};

export type LabTest = {
  id: string;
  patient_id: string;
  requested_by_employee_id: string;
  assigned_to_employee_id: string | null;
  test_name: string;
  status: string;
  result: string | null;
  completed_at: string | null;
};

export type Prescription = {
  id: string;
  patient_id: string;
  doctor_employee_id: string;
  medicine: string;
  dosage: string;
  instructions: string | null;
};

export type Billing = {
  id: string;
  patient_id: string;
  invoice_number: string;
  amount: number;
  payment_status: string;
  payment_date: string | null;
};

export type NotificationRow = {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

// Loose Database type so `createClient<Database>` doesn't need a full generated schema.
export type Database = {
  public: {
    Tables: {
      employees: { Row: Employee; Insert: Partial<Employee>; Update: Partial<Employee>; Relationships: [] };
      entitlements: { Row: Entitlement; Insert: Partial<Entitlement>; Update: Partial<Entitlement>; Relationships: [] };
      employee_entitlements: {
        Row: EmployeeEntitlement;
        Insert: Partial<EmployeeEntitlement>;
        Update: Partial<EmployeeEntitlement>;
        Relationships: [];
      };
      patients: { Row: Patient; Insert: Partial<Patient>; Update: Partial<Patient>; Relationships: [] };
      appointments: { Row: Appointment; Insert: Partial<Appointment>; Update: Partial<Appointment>; Relationships: [] };
      medical_records: { Row: MedicalRecord; Insert: Partial<MedicalRecord>; Update: Partial<MedicalRecord>; Relationships: [] };
      lab_tests: { Row: LabTest; Insert: Partial<LabTest>; Update: Partial<LabTest>; Relationships: [] };
      prescriptions: { Row: Prescription; Insert: Partial<Prescription>; Update: Partial<Prescription>; Relationships: [] };
      billing: { Row: Billing; Insert: Partial<Billing>; Update: Partial<Billing>; Relationships: [] };
      notifications: { Row: NotificationRow; Insert: Partial<NotificationRow>; Update: Partial<NotificationRow>; Relationships: [] };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
