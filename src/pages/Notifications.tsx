import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationRow } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { employee } = useAuth();
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    void supabase
      .from('notifications')
      .select('*')
      .eq('employee_id', employee.employee_id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, [employee]);

  async function markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) setError(error.message);
    else setRows((r) => r.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  }

  async function markAllRead() {
    if (!employee) return;
    const { error } = await supabase.from('notifications')
      .update({ is_read: true })
      .eq('employee_id', employee.employee_id)
      .eq('is_read', false);
    if (error) setError(error.message);
    else setRows((r) => r.map((n) => ({ ...n, is_read: true })));
  }

  const unread = rows.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          {unread > 0 && (
            <span className="badge bg-brand-100 text-brand-800">{unread} unread</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm">Mark all as read</button>
        )}
      </div>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {rows.map((n) => (
          <div key={n.id} className="card flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">{n.title}</div>
              <div className="text-sm text-slate-600">{n.message}</div>
              <div className="text-xs text-slate-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            {n.is_read ? (
              <span className="badge bg-slate-100 text-slate-500">Read</span>
            ) : (
              <button className="btn-ghost" onClick={() => markRead(n.id)}>
                Mark as read
              </button>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div className="card text-center text-slate-500 text-sm">No notifications.</div>
        )}
      </div>
    </div>
  );
}
