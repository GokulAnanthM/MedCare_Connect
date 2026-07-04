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
type Revenue = { total: number; paid: number; pending: number };

export default function Reports() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
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
          supabase.from('billing').select('*', { count: 'exact', head: true }).eq('payment_status', 'Pending'),
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

    void supabase.from('billing').select('amount,payment_status')
      .then(({ data }) => {
        if (!data) return;
        const total = data.reduce((s, b) => s + Number(b.amount), 0);
        const paid = data.filter((b) => b.payment_status === 'Paid').reduce((s, b) => s + Number(b.amount), 0);
        const pending = data.filter((b) => b.payment_status === 'Pending').reduce((s, b) => s + Number(b.amount), 0);
        setRevenue({ total, paid, pending });
      });
  }, []);

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      )}

      <section>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Operational summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Metric label="Total patients"    value={counts?.patients}        accent="text-emerald-600" />
          <Metric label="Appointments"      value={counts?.appointments}    accent="text-blue-600" />
          <Metric label="Medical records"   value={counts?.medical_records} accent="text-fuchsia-600" />
          <Metric label="Lab tests"         value={counts?.lab_tests}       accent="text-lime-600" />
          <Metric label="Prescriptions"     value={counts?.prescriptions}   accent="text-rose-600" />
          <Metric label="Unpaid invoices"   value={counts?.billing_pending} accent="text-amber-600" />
        </div>
      </section>

      {revenue && (
        <section>
          <h2 className="text-base font-semibold text-slate-700 mb-3">Revenue summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RevenueCard label="Total invoiced" value={fmt(revenue.total)}   sub="All billing records"  bg="bg-brand-50 border-brand-200"   fg="text-brand-700" />
            <RevenueCard label="Collected"       value={fmt(revenue.paid)}    sub="Paid invoices"        bg="bg-emerald-50 border-emerald-200" fg="text-emerald-700" />
            <RevenueCard label="Outstanding"     value={fmt(revenue.pending)} sub="Awaiting payment"    bg="bg-amber-50 border-amber-200"   fg="text-amber-700" />
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: number | undefined; accent: string }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent}`}>{value ?? '—'}</div>
    </div>
  );
}

function RevenueCard({ label, value, sub, bg, fg }: {
  label: string; value: string; sub: string; bg: string; fg: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${bg}`}>
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${fg}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
