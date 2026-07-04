import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Prescription } from '../lib/database.types';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

export default function Prescriptions() {
  const [rows, setRows] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('prescriptions')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Prescriptions</h1>
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
                <Td>{p.patient_id}</Td>
                <Td>{p.doctor_employee_id}</Td>
                <Td>{p.medicine}</Td>
                <Td>{p.dosage}</Td>
                <Td>{p.instructions ?? '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
