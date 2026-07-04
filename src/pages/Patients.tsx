import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Patient } from '../lib/database.types';

export default function Patients() {
  const [rows, setRows] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void supabase
      .from('patients')
      .select('*')
      .order('last_name')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <Th>Patient ID</Th><Th>Name</Th><Th>Gender</Th><Th>DOB</Th>
              <Th>Blood</Th><Th>Phone</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <Td>{p.patient_id}</Td>
                <Td>{p.first_name} {p.last_name}</Td>
                <Td>{p.gender}</Td>
                <Td>{p.date_of_birth}</Td>
                <Td>{p.blood_group ?? '—'}</Td>
                <Td>{p.phone ?? '—'}</Td>
              </tr>
            ))}
            {rows.length === 0 && <EmptyRow cols={6} />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="py-2 pr-4 font-medium">{children}</th>;
}
export function Td({ children }: { children: React.ReactNode }) {
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
