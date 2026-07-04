import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { MedicalRecord } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import { ENTITLEMENTS } from '../lib/entitlements';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

export default function MedicalRecords() {
  const { entitlementIds } = useAuth();
  const readOnly =
    !entitlementIds.has(ENTITLEMENTS.MEDICAL_RECORDS) &&
    entitlementIds.has(ENTITLEMENTS.MEDICAL_RECORDS_READ);

  const [rows, setRows] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('medical_records')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Medical Records</h1>
        {readOnly && (
          <span className="badge bg-amber-100 text-amber-800">Read-only view</span>
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
                <Td>{r.patient_id}</Td>
                <Td>{r.doctor_employee_id}</Td>
                <Td>{r.diagnosis}</Td>
                <Td>{r.treatment ?? '—'}</Td>
                <Td>{new Date(r.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
