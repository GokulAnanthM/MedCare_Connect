import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, RequireEntitlement } from './components/ProtectedRoute';
import { ENTITLEMENTS } from './lib/entitlements';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Laboratory from './pages/Laboratory';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import MyAccess from './pages/MyAccess';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="patients"
          element={
            <RequireEntitlement requires={[ENTITLEMENTS.PATIENT_MGMT]}>
              <Patients />
            </RequireEntitlement>
          }
        />
        <Route
          path="appointments"
          element={
            <RequireEntitlement requires={[ENTITLEMENTS.APPOINTMENT_MGMT]}>
              <Appointments />
            </RequireEntitlement>
          }
        />
        <Route
          path="medical-records"
          element={
            <RequireEntitlement
              requires={[ENTITLEMENTS.MEDICAL_RECORDS, ENTITLEMENTS.MEDICAL_RECORDS_READ]}
            >
              <MedicalRecords />
            </RequireEntitlement>
          }
        />
        <Route
          path="laboratory"
          element={
            <RequireEntitlement
              requires={[ENTITLEMENTS.LABORATORY, ENTITLEMENTS.LAB_RESULTS_READ]}
            >
              <Laboratory />
            </RequireEntitlement>
          }
        />
        <Route
          path="prescriptions"
          element={
            <RequireEntitlement requires={[ENTITLEMENTS.PRESCRIPTION_MGMT]}>
              <Prescriptions />
            </RequireEntitlement>
          }
        />
        <Route
          path="billing"
          element={
            <RequireEntitlement requires={[ENTITLEMENTS.BILLING]}>
              <Billing />
            </RequireEntitlement>
          }
        />
        <Route
          path="reports"
          element={
            <RequireEntitlement requires={[ENTITLEMENTS.REPORTS]}>
              <Reports />
            </RequireEntitlement>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-access" element={<MyAccess />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
