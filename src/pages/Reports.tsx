import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Counts = {
  patients: number;
  appointments: number;
  medical_records: number;
  lab_tests: number;
  prescriptions: number;
  billing_pending: number;
};

export default function Reports() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const results = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true }),
          supabase.from('medical_records').select('*', { count: 'exact', head: true }),
          supabase.from('lab_tests').select('*', { count: 'exact', head: true }),
          supabase.from('prescriptions').select('*', { count: 'exact', head: true }),
          supabase
            .from('billing')
            .select('*', { count: 'exact', head: true })
            .eq('payment_status', 'Pending'),
        ]);
        const err = results.find((r) => r.error)?.error;
        if (err) throw err;
        setCounts({
          patients: results[0].count ?? 0,
          appointments: results[1].count ?? 0,
          medical_records: results[2].count ?? 0,
          lab_tests: results[3].count ?? 0,
          prescriptions: results[4].count ?? 0,
          billing_pending: results[5].count ?? 0,
        });
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Metric label="Patients" value={counts?.patients} />
        <Metric label="Appointments" value={counts?.appointments} />
        <Metric label="Medical records" value={counts?.medical_records} />
        <Metric label="Lab tests" value={counts?.lab_tests} />
        <Metric label="Prescriptions" value={counts?.prescriptions} />
        <Metric label="Invoices pending" value={counts?.billing_pending} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900">
        {value ?? '—'}
      </div>
    </div>
  );
}
