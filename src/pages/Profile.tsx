import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { employee } = useAuth();
  if (!employee) return null;
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <div className="card">
        <p className="text-sm text-slate-500 mb-4">
          Your profile is managed by the HR department. To update any of these details,
          please contact HR.
        </p>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <Field label="Employee ID" value={employee.employee_id} />
          <Field label="Full name" value={`${employee.first_name} ${employee.last_name}`} />
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phone ?? '—'} />
          <Field label="Department" value={employee.department} />
          <Field label="Job" value={employee.job_name} />
          <Field label="Job level" value={employee.job_level} />
          <Field label="Employee type" value={employee.employee_type} />
          <Field label="Manager" value={employee.manager_employee_id ?? '—'} />
          <Field label="Employment status" value={employee.employment_status} />
          <Field label="Account status" value={employee.account_status} />
          <Field label="Hire date" value={employee.hire_date} />
        </dl>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-slate-900 font-medium">{value}</dd>
    </>
  );
}
