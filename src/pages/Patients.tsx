import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Patient } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Plus, Pencil } from 'lucide-react';

type PatForm = {
  first_name: string; last_name: string; gender: string;
  date_of_birth: string; blood_group: string; phone: string;
  address: string; emergency_contact: string;
};
const BLANK: PatForm = {
  first_name: '', last_name: '', gender: 'Male',
  date_of_birth: '', blood_group: '', phone: '', address: '', emergency_contact: '',
};

export default function Patients() {
  const { entitlementIds } = useAuth();
  const canEdit = entitlementIds.has(ENTITLEMENTS.PATIENT_MGMT);
  const [rows, setRows] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatForm>(BLANK);
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('patients').select('*').order('last_name')
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(load, []);

  function set(key: keyof PatForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function openAdd() { setForm(BLANK); setEditing(null); setOpen('add'); }
  function openEdit(p: Patient) {
    setForm({
      first_name: p.first_name, last_name: p.last_name, gender: p.gender,
      date_of_birth: p.date_of_birth, blood_group: p.blood_group ?? '',
      phone: p.phone ?? '', address: p.address ?? '', emergency_contact: p.emergency_contact ?? '',
    });
    setEditing(p); setOpen('edit');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      ...form,
      blood_group: form.blood_group || null,
      phone: form.phone || null,
      address: form.address || null,
      emergency_contact: form.emergency_contact || null,
    };
    const err = open === 'add'
      ? (await supabase.from('patients').insert({ ...payload, patient_id: `PAT${Date.now().toString().slice(-6)}` })).error
      : (await supabase.from('patients').update(payload).eq('id', editing!.id)).error;
    if (err) setError(err.message); else { setOpen(null); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Patient
          </button>
        )}
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient ID</Th><Th>Name</Th><Th>Gender</Th><Th>DOB</Th>
              <Th>Blood</Th><Th>Phone</Th>{canEdit && <Th></Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <Td>{p.patient_id}</Td>
                <Td>{p.first_name} {p.last_name}</Td>
                <Td>{p.gender}</Td><Td>{p.date_of_birth}</Td>
                <Td>{p.blood_group ?? '—'}</Td><Td>{p.phone ?? '—'}</Td>
                {canEdit && (
                  <Td>
                    <button onClick={() => openEdit(p)} className="btn-ghost py-1 px-2 text-xs">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </Td>
                )}
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={canEdit ? 7 : 6} />}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={open === 'add' ? 'Add Patient' : 'Edit Patient'} onClose={() => setOpen(null)}>
          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" required><input className={inputCls} value={form.first_name} onChange={set('first_name')} required /></Field>
              <Field label="Last name" required><input className={inputCls} value={form.last_name} onChange={set('last_name')} required /></Field>
              <Field label="Gender" required>
                <select className={inputCls} value={form.gender} onChange={set('gender')}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </Field>
              <Field label="Date of birth" required><input type="date" className={inputCls} value={form.date_of_birth} onChange={set('date_of_birth')} required /></Field>
              <Field label="Blood group"><input className={inputCls} value={form.blood_group} placeholder="e.g. O+" onChange={set('blood_group')} /></Field>
              <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set('phone')} /></Field>
            </div>
            <Field label="Address"><input className={inputCls} value={form.address} onChange={set('address')} /></Field>
            <Field label="Emergency contact"><input className={inputCls} value={form.emergency_contact} onChange={set('emergency_contact')} /></Field>
            <ModalActions onCancel={() => setOpen(null)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}

export function Th({ children }: { children?: React.ReactNode }) {
  return <th className="py-2 pr-4 font-medium">{children}</th>;
}
export function Td({ children }: { children?: React.ReactNode }) {
  return <td className="py-2 pr-4 text-slate-800">{children}</td>;
}
export function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="py-6 text-center text-slate-500">
        No records to display.
      </td>
    </tr>
  );
}
export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
      {children}
    </div>
  );
}
