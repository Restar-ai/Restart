import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, Component } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentResultPage from "./pages/AssessmentResultPage";
import ProfilePage from "./pages/ProfilePage";

// Lazy load dashboards dan pages untuk avoid issues
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const ParticipantProfile = lazy(() => import("./pages/ParticipantProfile"));

// Loading fallback
function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Error boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Trainer langsung bisa akses protected route (skip assessment)
  if (user.role === "trainer") {
    return children;
  }

  // Jika participant belum complete assessment, redirect ke assessment
  if (user.role === "participant" && !user.assessment_completed) {
    return <Navigate to="/assessment" replace />;
  }

  return children;
}

// Route untuk assessment - hanya bisa diakses participant yang belum complete assessment
function AssessmentRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Trainer tidak perlu assessment, redirect ke dashboard
  if (user.role === "trainer") {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika participant sudah complete assessment, redirect ke dashboard
  if (user.assessment_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Role-based dashboard component
function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "trainer") {
    return <TrainerDashboard />;
  } else {
    return <DashboardPage />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/assessment"
            element={
              <AssessmentRoute>
                <AssessmentPage />
              </AssessmentRoute>
            }
          />
          <Route
            path="/assessment-result"
            element={
              <ProtectedRoute>
                <AssessmentResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingPage />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participant/:id"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingPage />}>
                  <ParticipantProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
