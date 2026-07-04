import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Billing as BillingRow } from '../lib/database.types';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

export default function Billing() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('billing')
      .select('*')
      .order('invoice_number', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Invoice</Th><Th>Patient</Th><Th>Amount</Th><Th>Status</Th><Th>Paid on</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-slate-100">
                <Td>{b.invoice_number}</Td>
                <Td>{b.patient_id}</Td>
                <Td>${Number(b.amount).toFixed(2)}</Td>
                <Td>
                  <span
                    className={
                      b.payment_status === 'Paid'
                        ? 'badge bg-emerald-100 text-emerald-700'
                        : 'badge bg-amber-100 text-amber-800'
                    }
                  >
                    {b.payment_status}
                  </span>
                </Td>
                <Td>{b.payment_date ?? '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
