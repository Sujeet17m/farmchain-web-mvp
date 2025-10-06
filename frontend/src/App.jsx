import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Farmer Pages
import FarmerDashboard from './pages/farmer/Dashboard';
import BatchList from './pages/farmer/BatchList';
import CreateBatch from './pages/farmer/CreateBatch';
import BatchDetails from './pages/farmer/BatchDetails';

// Verifier Pages
import VerifierDashboard from './pages/verifier/Dashboard';
import PendingBatches from './pages/verifier/PendingBatches';
import VerifyBatch from './pages/verifier/VerifyBatch';
import VerificationHistory from './pages/verifier/VerificationHistory';

// Consumer Pages
import ConsumerHome from './pages/consumer/Home';
import SearchProducts from './pages/consumer/Search';
import ScanQR from './pages/consumer/ScanQR';
import ProductJourney from './pages/consumer/ProductJourney';

// Profile Page (shared)
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Farmer Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Layout>
                  <FarmerDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/batches"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Layout>
                  <BatchList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/batches/create"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Layout>
                  <CreateBatch />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/batches/:id"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <Layout>
                  <BatchDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Verifier Routes */}
          <Route
            path="/verifier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['verifier']}>
                <Layout>
                  <VerifierDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/pending"
            element={
              <ProtectedRoute allowedRoles={['verifier']}>
                <Layout>
                  <PendingBatches />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/verify/:id"
            element={
              <ProtectedRoute allowedRoles={['verifier']}>
                <Layout>
                  <VerifyBatch />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/verifier/history"
            element={
              <ProtectedRoute allowedRoles={['verifier']}>
                <Layout>
                  <VerificationHistory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Consumer Routes */}
          <Route
            path="/consumer"
            element={
              <Layout>
                <ConsumerHome />
              </Layout>
            }
          />
          <Route
            path="/consumer/search"
            element={
              <Layout>
                <SearchProducts />
              </Layout>
            }
          />
          <Route
            path="/consumer/scan"
            element={
              <Layout>
                <ScanQR />
              </Layout>
            }
          />
          <Route
            path="/consumer/product/:id"
            element={
              <Layout>
                <ProductJourney />
              </Layout>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/consumer" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/consumer" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;