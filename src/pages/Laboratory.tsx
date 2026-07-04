import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LabTest } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

export default function Laboratory() {
  const { entitlementIds } = useAuth();
  const canManage = entitlementIds.has(ENTITLEMENTS.LABORATORY);

  const [rows, setRows] = useState<LabTest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('lab_tests')
      .select('*')
      .order('completed_at', { ascending: false, nullsFirst: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Laboratory</h1>
        <span className={canManage ? 'badge bg-emerald-100 text-emerald-700' : 'badge bg-amber-100 text-amber-800'}>
          {canManage ? 'Full access' : 'Results (read-only)'}
        </span>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Test</Th><Th>Status</Th><Th>Result</Th>
              <Th>Requested by</Th><Th>Technician</Th><Th>Completed</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <Td>{t.patient_id}</Td>
                <Td>{t.test_name}</Td>
                <Td><span className="badge bg-brand-100 text-brand-800">{t.status}</span></Td>
                <Td>{t.result ?? '—'}</Td>
                <Td>{t.requested_by_employee_id}</Td>
                <Td>{t.assigned_to_employee_id ?? '—'}</Td>
                <Td>{t.completed_at ? new Date(t.completed_at).toLocaleString() : '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={7} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
