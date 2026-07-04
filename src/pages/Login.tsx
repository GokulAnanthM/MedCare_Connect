import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Employee } from '../lib/database.types';
import { BrandMarkOnDark } from '../components/Brand';
import { Activity, Heart, Shield, Clock } from 'lucide-react';

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
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* ── Left panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-slate-950">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/60 via-indigo-900/60 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Top: brand */}
        <div className="relative z-10">
          <BrandMarkOnDark size="md" />
        </div>

        {/* Centre: headline */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/20 text-xs text-sky-300 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
            <h1 className="text-4xl font-semibold leading-snug text-white">
              Delivering care,<br />
              <span className="bg-gradient-to-r from-sky-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-transparent">
                one record at a time.
              </span>
            </h1>
            <p className="mt-3 text-slate-300 max-w-sm">
              <span className="text-white font-medium">MedCare Connect</span> is a centralized digital platform that streamlines hospital operations, employee collaboration, and patient care.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={<Heart className="h-4 w-4 text-rose-400" />} value="12,400+" label="Patients served" />
            <StatTile icon={<Activity className="h-4 w-4 text-sky-400" />} value="340+" label="Daily appointments" />
            <StatTile icon={<Shield className="h-4 w-4 text-emerald-400" />} value="100%" label="Secure & compliant" />
            <StatTile icon={<Clock className="h-4 w-4 text-amber-400" />} value="24 / 7" label="Portal availability" />
          </div>
        </div>

        {/* Bottom: footer */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} MedCare Hospital. All rights reserved.
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand */}
          <div className="lg:hidden">
            <BrandMarkOnDark size="md" />
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to access your MedCare workspace.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select your account
              </label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                required
              >
                <option value="">Choose an account…</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} — {emp.job_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={busy || !selected}
              className="w-full justify-center btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-center text-slate-400">
            Having trouble signing in? Contact{' '}
            <a href="mailto:support@medcare.example" className="text-brand-600 hover:underline">
              IT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: JSX.Element; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

