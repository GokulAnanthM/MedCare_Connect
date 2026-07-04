import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MODULES, hasAny } from '../lib/entitlements';
import {
  LayoutDashboard, Users, CalendarDays, FileText,
  FlaskConical, Pill, Receipt, BarChart3, Bell, UserCircle2, ShieldCheck,
  Sparkles,
} from 'lucide-react';

const MODULE_ICON: Record<string, { icon: JSX.Element; grad: string }> = {
  dashboard:       { icon: <LayoutDashboard className="h-5 w-5" />, grad: 'from-sky-500 to-indigo-500' },
  patients:        { icon: <Users className="h-5 w-5" />,           grad: 'from-emerald-500 to-teal-500' },
  appointments:    { icon: <CalendarDays className="h-5 w-5" />,    grad: 'from-blue-500 to-cyan-500' },
  medical_records: { icon: <FileText className="h-5 w-5" />,        grad: 'from-fuchsia-500 to-pink-500' },
  laboratory:      { icon: <FlaskConical className="h-5 w-5" />,    grad: 'from-lime-500 to-emerald-500' },
  prescriptions:   { icon: <Pill className="h-5 w-5" />,            grad: 'from-rose-500 to-red-500' },
  billing:         { icon: <Receipt className="h-5 w-5" />,         grad: 'from-amber-500 to-orange-500' },
  reports:         { icon: <BarChart3 className="h-5 w-5" />,       grad: 'from-violet-500 to-purple-500' },
  notifications:   { icon: <Bell className="h-5 w-5" />,            grad: 'from-yellow-500 to-amber-500' },
  profile:         { icon: <UserCircle2 className="h-5 w-5" />,     grad: 'from-slate-400 to-slate-600' },
  my_access:       { icon: <ShieldCheck className="h-5 w-5" />,     grad: 'from-teal-500 to-sky-500' },
};

const MODULE_DESC: Record<string, string> = {
  patients:        'View and manage patient records',
  appointments:    'Schedule and track appointments',
  medical_records: 'Clinical diagnoses and treatment notes',
  laboratory:      'Lab tests and results',
  prescriptions:   'Issue and review prescriptions',
  billing:         'Invoices and payment status',
  reports:         'Operational summaries and analytics',
  notifications:   'Your alerts and messages',
  profile:         'Your account and contact details',
  my_access:       'View your assigned permissions',
};

export default function Dashboard() {
  const { employee, entitlementIds } = useAuth();
  const visible = MODULES.filter((m) => hasAny(entitlementIds, m.requires));
  const workspaces = visible.filter((m) => m.key !== 'dashboard');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white bg-gradient-to-br from-sky-600 via-indigo-600 to-fuchsia-600 shadow-brand-glow">
        <div className="absolute inset-0 bg-app-mesh opacity-60" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-white/80 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> {greeting}
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
              {employee?.first_name} {employee?.last_name}
            </h1>
            <p className="mt-1 text-white/80 text-sm">
              {employee?.job_name} · {employee?.department}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <HeroStat label="Workspaces" value={workspaces.length} />
            <HeroStat label="Role" value={employee?.job_level ?? '—'} />
            <HeroStat label="Status" value={employee?.account_status ?? '—'} />
          </div>
        </div>
      </section>

      {/* Workspace tiles */}
      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Your workspaces</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {workspaces.map((m) => {
            const meta = MODULE_ICON[m.key];
            return (
              <Link key={m.key} to={m.path} className="card-hover group">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl grid place-items-center text-white shadow-md bg-gradient-to-br flex-shrink-0 ${meta?.grad}`}
                  >
                    {meta?.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                      {m.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {MODULE_DESC[m.key] ?? ''}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-[92px] rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wide text-white/70">{label}</div>
      <div className="mt-0.5 text-lg font-semibold">{value}</div>
    </div>
  );
}
