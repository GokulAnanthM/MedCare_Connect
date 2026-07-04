import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MODULES, hasAny } from '../lib/entitlements';
import {
  CheckCircle2, XCircle, LayoutDashboard, Users, CalendarDays, FileText,
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

export default function Dashboard() {
  const { employee, entitlements, entitlementIds } = useAuth();
  const visible = MODULES.filter((m) => hasAny(entitlementIds, m.requires));
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
              <Sparkles className="h-4 w-4" /> {greeting}, {employee?.first_name}
            </div>
            <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
              Welcome to MedCare Connect
            </h1>
            <p className="mt-1 text-white/80 text-sm">
              {employee?.job_name} · {employee?.department} · {employee?.employment_status}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <HeroStat label="Modules" value={visible.length} />
            <HeroStat label="Entitlements" value={entitlements.length} />
            <HeroStat label="Status" value={employee?.account_status ?? '—'} />
          </div>
        </div>
      </section>

      {/* Available modules — colored tiles */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Your workspaces</h2>
          <span className="text-xs text-slate-500">Filtered by your entitlements</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible
            .filter((m) => m.key !== 'dashboard')
            .map((m) => {
              const meta = MODULE_ICON[m.key];
              return (
                <Link key={m.key} to={m.path} className="card-hover group">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl grid place-items-center text-white shadow-md bg-gradient-to-br ${meta?.grad}`}
                    >
                      {meta?.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                        {m.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.requires.length === 0 ? 'Available to everyone' : m.requires.join(' · ')}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Access matrix */}
      <section className="card">
        <h2 className="text-lg font-semibold text-slate-900">Module access matrix</h2>
        <p className="text-sm text-slate-500 mb-3">
          Computed from your SailPoint-assigned entitlements.
        </p>
        <ul className="divide-y divide-slate-100">
          {MODULES.map((m) => {
            const ok = hasAny(entitlementIds, m.requires);
            const meta = MODULE_ICON[m.key];
            return (
              <li key={m.key} className="py-2.5 flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg grid place-items-center text-white bg-gradient-to-br ${meta?.grad} opacity-90`}
                >
                  {meta?.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{m.label}</div>
                  <div className="text-xs text-slate-500">
                    {m.requires.length === 0
                      ? 'No entitlement required'
                      : `Requires any of: ${m.requires.join(', ')}`}
                  </div>
                </div>
                {ok ? (
                  <span className="badge bg-emerald-100 text-emerald-700 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Granted
                  </span>
                ) : (
                  <span className="badge bg-slate-100 text-slate-500 gap-1">
                    <XCircle className="h-3 w-3" /> Not granted
                  </span>
                )}
              </li>
            );
          })}
        </ul>
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
