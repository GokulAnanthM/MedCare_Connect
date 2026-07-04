import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Appointment, Patient } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Plus, Pencil } from 'lucide-react';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

type AptForm = { patient_id: string; appointment_date: string; status: string; notes: string };
const BLANK: AptForm = { patient_id: '', appointment_date: '', status: 'Scheduled', notes: '' };

export default function Appointments() {
  const { employee, entitlementIds } = useAuth();
  const canEdit = entitlementIds.has(ENTITLEMENTS.APPOINTMENT_MGMT);
  const [rows, setRows] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, 'patient_id' | 'first_name' | 'last_name'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [form, setForm] = useState<AptForm>(BLANK);
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('appointments').select('*').order('appointment_date', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(() => {
    load();
    void supabase.from('patients').select('patient_id,first_name,last_name').order('last_name')
      .then(({ data }) => setPatients(data ?? []));
  }, []);

  function set(key: keyof AptForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function openAdd() { setForm(BLANK); setEditing(null); setOpen('add'); }
  function openEdit(a: Appointment) {
    setForm({
      patient_id: a.patient_id,
      appointment_date: new Date(a.appointment_date).toISOString().slice(0, 16),
      status: a.status, notes: a.notes ?? '',
    });
    setEditing(a); setOpen('edit');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { patient_id: form.patient_id, appointment_date: form.appointment_date, status: form.status, notes: form.notes || null };
    const err = open === 'add'
      ? (await supabase.from('appointments').insert({ ...payload, doctor_employee_id: employee?.employee_id })).error
      : (await supabase.from('appointments').update(payload).eq('id', editing!.id)).error;
    if (err) setError(err.message); else { setOpen(null); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Appointment
          </button>
        )}
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Doctor</Th><Th>Date</Th><Th>Status</Th><Th>Notes</Th>{canEdit && <Th></Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <Td>{a.patient_id}</Td><Td>{a.doctor_employee_id}</Td>
                <Td>{new Date(a.appointment_date).toLocaleString()}</Td>
                <Td><span className="badge bg-brand-100 text-brand-800">{a.status}</span></Td>
                <Td>{a.notes ?? '—'}</Td>
                {canEdit && (
                  <Td><button onClick={() => openEdit(a)} className="btn-ghost py-1 px-2 text-xs"><Pencil className="h-3 w-3" /> Edit</button></Td>
                )}
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={canEdit ? 6 : 5} />}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={open === 'add' ? 'New Appointment' : 'Edit Appointment'} onClose={() => setOpen(null)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Patient" required>
              <select className={inputCls} value={form.patient_id} onChange={set('patient_id')} required>
                <option value="">Select a patient…</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                ))}
              </select>
            </Field>
            <Field label="Date & time" required>
              <input type="datetime-local" className={inputCls} value={form.appointment_date} onChange={set('appointment_date')} required />
            </Field>
            <Field label="Status" required>
              <select className={inputCls} value={form.status} onChange={set('status')}>
                <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
              </select>
            </Field>
            <Field label="Notes">
              <textarea className={inputCls} rows={2} value={form.notes} onChange={set('notes')} />
            </Field>
            <ModalActions onCancel={() => setOpen(null)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
