import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasAny, type EntitlementId } from '../lib/entitlements';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, employee } = useAuth();
  const loc = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!employee) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <>{children}</>;
}

export function RequireEntitlement({
  requires,
  children,
}: {
  requires: EntitlementId[];
  children: ReactNode;
}) {
  const { entitlementIds } = useAuth();
  if (!hasAny(entitlementIds, requires)) return <AccessDenied requires={requires} />;
  return <>{children}</>;
}

function FullPageSpinner() {
  return (
    <div className="h-screen w-screen grid place-items-center text-slate-500">
      Loading…
    </div>
  );
}

function AccessDenied({ requires }: { requires: EntitlementId[] }) {
  return (
    <div className="max-w-xl mx-auto mt-16 card">
      <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 text-slate-600">
        You don’t have the required entitlement to view this module. Access is governed by
        SailPoint ISC. Request one of the following via your Access catalog:
      </p>
      <ul className="mt-3 list-disc list-inside text-slate-700">
        {requires.map((r) => (
          <li key={r}><code>{r}</code></li>
        ))}
      </ul>
    </div>
  );
}
