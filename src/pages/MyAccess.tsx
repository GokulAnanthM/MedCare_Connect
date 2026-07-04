import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function MyAccess() {
  const { employee, entitlements } = useAuth();
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">My Access</h1>
      <div className="card">
        <p className="text-sm text-slate-500">
          The following entitlements are currently assigned to{' '}
          <span className="font-medium text-slate-800">
            {employee?.first_name} {employee?.last_name}
          </span>
          . To request changes, contact HR or IT support.
        </p>
        <ul className="mt-4 divide-y divide-slate-100">
          {entitlements.map((e) => (
            <li key={e.entitlement_id} className="py-3 flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-brand-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">
                  {e.entitlement_name}
                  {e.privileged && (
                    <span className="ml-2 badge bg-amber-100 text-amber-800">Privileged</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  ID: <code>{e.entitlement_id}</code>
                </div>
                {e.description && (
                  <div className="text-sm text-slate-600 mt-1">{e.description}</div>
                )}
              </div>
            </li>
          ))}
          {entitlements.length === 0 && (
            <li className="py-6 text-center text-slate-500 text-sm">
              No entitlements assigned.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
