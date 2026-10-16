import { Navigate, Route, Routes } from 'react-router-dom';
import { DataProvider, useAppData } from './context/AppData.jsx';
import AttendancePage from './pages/Attendance.jsx';
import { DashboardHome, SubjectsPage, SchedulePage, StudentsPage } from './pages/Dashboard.jsx';
import LoginPage, { ForgotPasswordPage } from './pages/Login.jsx';
import RegistrationPage from './pages/Registration.jsx';
import AppShell from './components/AppShell.jsx';

function ProtectedApp() {
  const { data, signedIn } = useAppData();
  if (!data.teacher || !signedIn) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register/:step" element={<RegistrationPage />} />
        <Route path="/register" element={<Navigate to="/register/teacher" replace />} />
        <Route path="/registration-success" element={<RegistrationPage success />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedApp />}>
          <Route index element={<DashboardHome />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  );
}