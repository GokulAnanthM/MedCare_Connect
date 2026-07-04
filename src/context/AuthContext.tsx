import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Employee, Entitlement } from '../lib/database.types';

// ---------------------------------------------------------------------------
// Authentication + entitlement context.
//
// The Hospital Operations Portal authenticates the employee, loads their
// profile (provisioned by SailPoint), and loads the set of entitlements
// SailPoint has assigned. The UI uses this set to decide which modules
// to render.
// ---------------------------------------------------------------------------

type DemoIdentity = { employee_id: string; email: string };

type AuthState = {
  loading: boolean;
  employee: Employee | null;
  entitlements: Entitlement[];
  entitlementIds: Set<string>;
  signInAsDemo: (identity: DemoIdentity) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const DEMO_STORAGE_KEY = 'hop.demoEmployeeId';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  // On mount, try to restore the demo session (an employee_id chosen at login).
  useEffect(() => {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    void loadEmployee(stored).finally(() => setLoading(false));
  }, []);

  async function loadEmployee(employeeId: string) {
    // 1. Load the employee profile (provisioned by SailPoint).
    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (empErr || !emp) {
      // eslint-disable-next-line no-console
      console.error('[auth] failed to load employee', empErr);
      setEmployee(null);
      setEntitlements([]);
      return;
    }

    // 2. Load the entitlements SailPoint assigned to this employee.
    const { data: assignments, error: assignErr } = await supabase
      .from('employee_entitlements')
      .select('entitlement_id')
      .eq('employee_id', employeeId);

    if (assignErr) {
      // eslint-disable-next-line no-console
      console.error('[auth] failed to load entitlement assignments', assignErr);
    }

    const assignedIds = (assignments ?? []).map((r) => r.entitlement_id);

    let ents: Entitlement[] = [];
    if (assignedIds.length > 0) {
      const { data: catalog, error: catErr } = await supabase
        .from('entitlements')
        .select('*')
        .in('entitlement_id', assignedIds);
      if (catErr) {
        // eslint-disable-next-line no-console
        console.error('[auth] failed to load entitlement catalog', catErr);
      }
      ents = catalog ?? [];
    }

    setEmployee(emp);
    setEntitlements(ents);
  }

  async function signInAsDemo(identity: DemoIdentity) {
    setLoading(true);
    localStorage.setItem(DEMO_STORAGE_KEY, identity.employee_id);
    await loadEmployee(identity.employee_id);
    setLoading(false);
  }

  async function signOut() {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setEmployee(null);
    setEntitlements([]);
  }

  const value = useMemo<AuthState>(
    () => ({
      loading,
      employee,
      entitlements,
      entitlementIds: new Set(entitlements.map((e) => e.entitlement_id)),
      signInAsDemo,
      signOut,
    }),
    [loading, employee, entitlements],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
