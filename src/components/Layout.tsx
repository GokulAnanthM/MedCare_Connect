import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MODULES, hasAny } from '../lib/entitlements';
import { BrandMarkOnDark } from './Brand';
import clsx from 'clsx';
import {
  LayoutDashboard, Users, CalendarDays, FileText, FlaskConical, Pill,
  Receipt, BarChart3, Bell, UserCircle2, ShieldCheck, LogOut,
} from 'lucide-react';

const ICONS: Record<string, { icon: JSX.Element; ring: string }> = {
  dashboard:       { icon: <LayoutDashboard className="h-4 w-4" />, ring: 'from-sky-500 to-indigo-500' },
  patients:        { icon: <Users className="h-4 w-4" />,           ring: 'from-emerald-500 to-teal-500' },
  appointments:    { icon: <CalendarDays className="h-4 w-4" />,    ring: 'from-blue-500 to-cyan-500' },
  medical_records: { icon: <FileText className="h-4 w-4" />,        ring: 'from-fuchsia-500 to-pink-500' },
  laboratory:      { icon: <FlaskConical className="h-4 w-4" />,    ring: 'from-lime-500 to-emerald-500' },
  prescriptions:   { icon: <Pill className="h-4 w-4" />,            ring: 'from-rose-500 to-red-500' },
  billing:         { icon: <Receipt className="h-4 w-4" />,         ring: 'from-amber-500 to-orange-500' },
  reports:         { icon: <BarChart3 className="h-4 w-4" />,       ring: 'from-violet-500 to-purple-500' },
  notifications:   { icon: <Bell className="h-4 w-4" />,            ring: 'from-yellow-500 to-amber-500' },
  profile:         { icon: <UserCircle2 className="h-4 w-4" />,     ring: 'from-slate-400 to-slate-600' },
  my_access:       { icon: <ShieldCheck className="h-4 w-4" />,     ring: 'from-teal-500 to-sky-500' },
};

export default function Layout() {
  const { employee, entitlementIds, signOut } = useAuth();
  const nav = useNavigate();

  const visibleModules = MODULES.filter((m) => hasAny(entitlementIds, m.requires));
  const initials = `${employee?.first_name?.[0] ?? ''}${employee?.last_name?.[0] ?? ''}`.toUpperCase();

  async function handleSignOut() {
    await signOut();
    nav('/login', { replace: true });
  }

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <aside className="relative flex flex-col text-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-app-mesh opacity-70" />
        <div className="relative flex flex-col h-full">
          <div className="px-5 py-5 border-b border-white/10">
            <BrandMarkOnDark size="md" />
          </div>

          <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
            {visibleModules.map((m) => {
              const meta = ICONS[m.key];
              return (
                <NavLink
                  key={m.key}
                  to={m.path}
                  end={m.path === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                      isActive
                        ? 'bg-white/10 text-white shadow-inner ring-1 ring-white/10'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={clsx(
                          'grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br text-white shadow',
                          meta?.ring ?? 'from-slate-500 to-slate-700',
                          isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                        )}
                      >
                        {meta?.icon}
                      </span>
                      <span className="font-medium">{m.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 text-white text-sm font-semibold ring-1 ring-white/20">
                {initials || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  {employee?.first_name} {employee?.last_name}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {employee?.job_name} · {employee?.department}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 w-full btn bg-white/5 hover:bg-white/10 text-slate-100 ring-1 ring-white/10"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
