import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/shared/MainLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ApplicationsList } from '@/components/dashboard/ApplicationsList';
import { ApplicationForm } from '@/components/forms/ApplicationForm';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { PaymentGateway } from '@/components/payment/PaymentGateway';
import { StaffReview } from '@/components/dashboard/StaffReview';
import { TreasurerVerification } from '@/components/dashboard/TreasurerDashboard';
import { UserManagement } from '@/components/dashboard/AdminDashboard';
import { Notifications } from '@/components/notifications/Notifications';
import { DigitalPermits } from '@/components/permits/DigitalPermit';
import { Settings } from '@/components/shared/Settings';
import { useAuthStore } from '@/store';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterForm />}
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Applicant Routes */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <MainLayout>
                <ApplicationsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <MainLayout>
                <ApplicationForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <MainLayout>
                <DocumentUpload />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <MainLayout>
                <PaymentGateway />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/permits"
          element={
            <ProtectedRoute allowedRoles={['applicant']}>
              <MainLayout>
                <DigitalPermits />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/review"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <MainLayout>
                <StaffReview />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Treasurer Routes */}
        <Route
          path="/verify-payments"
          element={
            <ProtectedRoute allowedRoles={['treasurer']}>
              <MainLayout>
                <TreasurerVerification />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Common Routes */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
