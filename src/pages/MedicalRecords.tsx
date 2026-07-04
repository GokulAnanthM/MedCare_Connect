import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MedicalRecord, Patient } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Plus } from 'lucide-react';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

type RecForm = { patient_id: string; diagnosis: string; treatment: string };
const BLANK: RecForm = { patient_id: '', diagnosis: '', treatment: '' };

export default function MedicalRecords() {
  const { employee, entitlementIds } = useAuth();
  const readOnly = !entitlementIds.has(ENTITLEMENTS.MEDICAL_RECORDS) && entitlementIds.has(ENTITLEMENTS.MEDICAL_RECORDS_READ);
  const canAdd = entitlementIds.has(ENTITLEMENTS.MEDICAL_RECORDS);
  const [rows, setRows] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, 'patient_id' | 'first_name' | 'last_name'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RecForm>(BLANK);
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('medical_records').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(() => {
    load();
    void supabase.from('patients').select('patient_id,first_name,last_name').order('last_name')
      .then(({ data }) => setPatients(data ?? []));
  }, []);

  function set(key: keyof RecForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('medical_records').insert({
      patient_id: form.patient_id,
      doctor_employee_id: employee?.employee_id,
      diagnosis: form.diagnosis,
      treatment: form.treatment || null,
    });
    if (error) setError(error.message);
    else { setOpen(false); setForm(BLANK); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Medical Records</h1>
          {readOnly && <span className="badge bg-amber-100 text-amber-800">Read-only</span>}
        </div>
        {canAdd && (
          <button onClick={() => { setForm(BLANK); setOpen(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> New Record
          </button>
        )}
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Doctor</Th><Th>Diagnosis</Th><Th>Treatment</Th><Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <Td>{r.patient_id}</Td><Td>{r.doctor_employee_id}</Td>
                <Td>{r.diagnosis}</Td><Td>{r.treatment ?? '—'}</Td>
                <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="New Medical Record" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Patient" required>
              <select className={inputCls} value={form.patient_id} onChange={set('patient_id')} required>
                <option value="">Select a patient…</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                ))}
              </select>
            </Field>
            <Field label="Diagnosis" required>
              <input className={inputCls} value={form.diagnosis} onChange={set('diagnosis')} required />
            </Field>
            <Field label="Treatment plan">
              <textarea className={inputCls} rows={2} value={form.treatment} onChange={set('treatment')} />
            </Field>
            <ModalActions onCancel={() => setOpen(false)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
