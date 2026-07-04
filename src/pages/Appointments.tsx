import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../lib/database.types';
import { Td, Th, EmptyRow, ErrorBox } from './Patients';

export default function Appointments() {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient</Th><Th>Doctor</Th><Th>Date</Th><Th>Status</Th><Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-slate-100">
                <Td>{a.patient_id}</Td>
                <Td>{a.doctor_employee_id}</Td>
                <Td>{new Date(a.appointment_date).toLocaleString()}</Td>
                <Td><span className="badge bg-brand-100 text-brand-800">{a.status}</span></Td>
                <Td>{a.notes ?? '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={5} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}
