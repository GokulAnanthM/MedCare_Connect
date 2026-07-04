import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Prescription, Patient } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Plus } from 'lucide-react';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

type RxForm = { patient_id: string; medicine: string; dosage: string; instructions: string };
const BLANK: RxForm = { patient_id: '', medicine: '', dosage: '', instructions: '' };

export default function Prescriptions() {
  const { employee, entitlementIds } = useAuth();
  const canAdd = entitlementIds.has(ENTITLEMENTS.PRESCRIPTION_MGMT);
  const [rows, setRows] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, 'patient_id' | 'first_name' | 'last_name'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RxForm>(BLANK);
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('prescriptions').select('*')
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(() => {
    load();
    void supabase.from('patients').select('patient_id,first_name,last_name').order('last_name')
      .then(({ data }) => setPatients(data ?? []));
  }, []);

  function set(key: keyof RxForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('prescriptions').insert({
      patient_id: form.patient_id,
      doctor_employee_id: employee?.employee_id,
      medicine: form.medicine,
      dosage: form.dosage,
      instructions: form.instructions || null,
    });
    if (error) setError(error.message);
    else { setOpen(false); setForm(BLANK); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Prescriptions</h1>
        {canAdd && (
          <button onClick={() => { setForm(BLANK); setOpen(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> New Prescription
          </button>
        )}
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Doctor</Th><Th>Medicine</Th><Th>Dosage</Th><Th>Instructions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <Td>{p.patient_id}</Td><Td>{p.doctor_employee_id}</Td>
                <Td>{p.medicine}</Td><Td>{p.dosage}</Td><Td>{p.instructions ?? '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="New Prescription" onClose={() => setOpen(false)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Patient" required>
              <select className={inputCls} value={form.patient_id} onChange={set('patient_id')} required>
                <option value="">Select a patient…</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Medicine" required><input className={inputCls} value={form.medicine} onChange={set('medicine')} required /></Field>
              <Field label="Dosage" required><input className={inputCls} value={form.dosage} placeholder="e.g. 5 mg" onChange={set('dosage')} required /></Field>
            </div>
            <Field label="Instructions"><textarea className={inputCls} rows={2} value={form.instructions} onChange={set('instructions')} /></Field>
            <ModalActions onCancel={() => setOpen(false)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
