import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Billing as BillingRow } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Pencil } from 'lucide-react';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

type PayForm = { payment_status: string; payment_date: string };

export default function Billing() {
  const { entitlementIds } = useAuth();
  const canEdit = entitlementIds.has(ENTITLEMENTS.BILLING);
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BillingRow | null>(null);
  const [form, setForm] = useState<PayForm>({ payment_status: 'Pending', payment_date: '' });
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('billing').select('*').order('invoice_number', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(load, []);

  function openEdit(b: BillingRow) {
    setForm({ payment_status: b.payment_status, payment_date: b.payment_date ?? '' });
    setEditing(b);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('billing').update({
      payment_status: form.payment_status,
      payment_date: form.payment_date || null,
    }).eq('id', editing!.id);
    if (error) setError(error.message);
    else { setEditing(null); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Invoice</Th><Th>Patient</Th><Th>Amount</Th><Th>Status</Th><Th>Paid on</Th>
              {canEdit && <Th></Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} className="border-b border-slate-100">
                <Td>{b.invoice_number}</Td><Td>{b.patient_id}</Td>
                <Td>${Number(b.amount).toFixed(2)}</Td>
                <Td>
                  <span className={b.payment_status === 'Paid' ? 'badge bg-emerald-100 text-emerald-700' : 'badge bg-amber-100 text-amber-800'}>
                    {b.payment_status}
                  </span>
                </Td>
                <Td>{b.payment_date ?? '—'}</Td>
                {canEdit && (
                  <Td><button onClick={() => openEdit(b)} className="btn-ghost py-1 px-2 text-xs"><Pencil className="h-3 w-3" /> Update</button></Td>
                )}
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={canEdit ? 6 : 5} />}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`Update Payment — ${editing.invoice_number}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            <div className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              Patient: <span className="font-medium text-slate-800">{editing.patient_id}</span>
              {' · '}Amount: <span className="font-medium text-slate-800">${Number(editing.amount).toFixed(2)}</span>
            </div>
            <Field label="Payment status" required>
              <select className={inputCls} value={form.payment_status}
                onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}>
                <option>Pending</option><option>Paid</option><option>Cancelled</option>
              </select>
            </Field>
            <Field label="Payment date">
              <input type="date" className={inputCls} value={form.payment_date}
                onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))} />
            </Field>
            <ModalActions onCancel={() => setEditing(null)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
