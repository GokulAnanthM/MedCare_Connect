import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LabTest, Patient } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Modal, Field, inputCls, ModalActions } from '../components/Modal';
import { Plus, Pencil } from 'lucide-react';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

type AddForm = { patient_id: string; test_name: string };
type EditForm = { status: string; result: string; completed_at: string };
const BLANK_ADD: AddForm = { patient_id: '', test_name: '' };
const BLANK_EDIT: EditForm = { status: 'Pending', result: '', completed_at: '' };

export default function Laboratory() {
  const { employee, entitlementIds } = useAuth();
  const canManage = entitlementIds.has(ENTITLEMENTS.LABORATORY);
  const [rows, setRows] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Pick<Patient, 'patient_id' | 'first_name' | 'last_name'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LabTest | null>(null);
  const [addForm, setAddForm] = useState<AddForm>(BLANK_ADD);
  const [editForm, setEditForm] = useState<EditForm>(BLANK_EDIT);
  const [saving, setSaving] = useState(false);

  function load() {
    void supabase.from('lab_tests').select('*').order('completed_at', { ascending: false, nullsFirst: true })
      .then(({ data, error }) => { if (error) setError(error.message); else setRows(data ?? []); });
  }
  useEffect(() => {
    load();
    if (canManage) {
      void supabase.from('patients').select('patient_id,first_name,last_name').order('last_name')
        .then(({ data }) => setPatients(data ?? []));
    }
  }, [canManage]);

  function setA(key: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setAddForm((f) => ({ ...f, [key]: e.target.value }));
  }
  function setE(key: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setEditForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function openEdit(t: LabTest) {
    setEditForm({
      status: t.status, result: t.result ?? '',
      completed_at: t.completed_at ? new Date(t.completed_at).toISOString().slice(0, 16) : '',
    });
    setEditTarget(t);
  }

  async function saveAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('lab_tests').insert({
      patient_id: addForm.patient_id,
      requested_by_employee_id: employee?.employee_id,
      test_name: addForm.test_name,
      status: 'Pending',
    });
    if (error) setError(error.message);
    else { setAddOpen(false); setAddForm(BLANK_ADD); load(); }
    setSaving(false);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('lab_tests').update({
      status: editForm.status,
      result: editForm.result || null,
      completed_at: editForm.completed_at || null,
    }).eq('id', editTarget!.id);
    if (error) setError(error.message);
    else { setEditTarget(null); load(); }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Laboratory</h1>
          <span className={canManage ? 'badge bg-emerald-100 text-emerald-700' : 'badge bg-amber-100 text-amber-800'}>
            {canManage ? 'Full access' : 'Results only'}
          </span>
        </div>
        {canManage && (
          <button onClick={() => { setAddForm(BLANK_ADD); setAddOpen(true); }} className="btn-primary">
            <Plus className="h-4 w-4" /> New Test
          </button>
        )}
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Test</Th><Th>Status</Th><Th>Result</Th><Th>Requested by</Th><Th>Completed</Th>
              {canManage && <Th></Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-slate-100">
                <Td>{t.patient_id}</Td><Td>{t.test_name}</Td>
                <Td><span className="badge bg-brand-100 text-brand-800">{t.status}</span></Td>
                <Td>{t.result ?? '—'}</Td><Td>{t.requested_by_employee_id}</Td>
                <Td>{t.completed_at ? new Date(t.completed_at).toLocaleString() : '—'}</Td>
                {canManage && (
                  <Td><button onClick={() => openEdit(t)} className="btn-ghost py-1 px-2 text-xs"><Pencil className="h-3 w-3" /> Update</button></Td>
                )}
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={canManage ? 7 : 6} />}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <Modal title="New Lab Test" onClose={() => setAddOpen(false)}>
          <form onSubmit={saveAdd} className="space-y-3">
            <Field label="Patient" required>
              <select className={inputCls} value={addForm.patient_id} onChange={setA('patient_id')} required>
                <option value="">Select a patient…</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.first_name} {p.last_name} ({p.patient_id})</option>
                ))}
              </select>
            </Field>
            <Field label="Test name" required>
              <input className={inputCls} value={addForm.test_name} onChange={setA('test_name')} placeholder="e.g. CBC, Lipid Panel" required />
            </Field>
            <ModalActions onCancel={() => setAddOpen(false)} saving={saving} />
          </form>
        </Modal>
      )}

      {editTarget && (
        <Modal title="Update Lab Result" onClose={() => setEditTarget(null)}>
          <form onSubmit={saveEdit} className="space-y-3">
            <div className="text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              Patient: <span className="font-medium text-slate-800">{editTarget.patient_id}</span>
              {' · '}Test: <span className="font-medium text-slate-800">{editTarget.test_name}</span>
            </div>
            <Field label="Status" required>
              <select className={inputCls} value={editForm.status} onChange={setE('status')}>
                <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
              </select>
            </Field>
            <Field label="Result">
              <textarea className={inputCls} rows={2} value={editForm.result} onChange={setE('result')} placeholder="Enter result details…" />
            </Field>
            <Field label="Completed at">
              <input type="datetime-local" className={inputCls} value={editForm.completed_at} onChange={setE('completed_at')} />
            </Field>
            <ModalActions onCancel={() => setEditTarget(null)} saving={saving} />
          </form>
        </Modal>
      )}
    </div>
  );
}
