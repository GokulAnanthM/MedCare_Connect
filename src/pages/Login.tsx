import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Employee } from '../lib/database.types';
import { BrandMark } from '../components/Brand';
import { ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';

// Demo login: pick an employee that SailPoint has provisioned.
// A production build would replace this with Supabase Auth / SSO.
export default function Login() {
  const { signInAsDemo, employee } = useAuth();
  const nav = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (employee) nav('/', { replace: true });
  }, [employee, nav]);

  useEffect(() => {
    void supabase
      .from('employees')
      .select('*')
      .eq('account_status', 'Active')
      .order('last_name')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEmployees(data ?? []);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const emp = employees.find((x) => x.employee_id === selected);
    if (!emp) return;
    setBusy(true);
    await signInAsDemo({ employee_id: emp.employee_id, email: emp.email });
    setBusy(false);
    nav('/', { replace: true });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 text-white overflow-hidden">
      {/* Left hero panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10">
        <div className="absolute inset-0 bg-app-mesh opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/30 via-indigo-700/30 to-fuchsia-700/30" />
        <div className="relative z-10">
          <BrandMark size="lg" className="[&_.text-slate-800]:text-white [&_.text-slate-500]:text-slate-300" />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Welcome to <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">MedCare Connect</span>
          </h1>
          <p className="text-slate-300">
            The unified operations portal for MedCare Hospital. Access, entitlements, and
            birthright roles are governed by SailPoint ISC.
          </p>

          <ul className="space-y-3">
            <Feature icon={<Stethoscope className="h-4 w-4" />} label="Clinical workflows for doctors, nurses & lab staff" />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Least-privilege access enforced per entitlement" />
            <Feature icon={<Sparkles className="h-4 w-4" />} label="Birthright access driven from HR attributes" />
          </ul>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © MedCare Hospital · Operated on Supabase · Governed by SailPoint ISC
        </div>
      </div>

      {/* Right sign-in form */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 bg-white text-slate-900">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden">
            <BrandMark size="md" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select an employee provisioned by SailPoint to enter the portal.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Employee</span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              required
            >
              <option value="">Select an employee…</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.first_name} {e.last_name} — {e.job_name} ({e.department})
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={busy}>
            {busy ? 'Signing in…' : 'Enter MedCare Connect'}
          </button>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
            Demo sign-in resolves the selected employee, loads their profile, and retrieves
            the entitlements SailPoint has assigned.
          </div>
        </form>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: JSX.Element; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20 text-white">
        {icon}
      </span>
      <span className="text-sm text-slate-200">{label}</span>
    </li>
  );
}
