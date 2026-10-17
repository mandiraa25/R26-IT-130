import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { stopAllAudio } from "./utils/phonologicalAwareness/audio";
import { MemoryMusicRouteListener } from "./features/workingMemory/logic/audio";

import Login from "./pages/common/Login";
import Register from "./pages/common/Register";
import Dashboard from "./pages/common/Dashboard";
import Profile from "./pages/common/Profile";
import PhonologicalAwareness  from "./pages/phonologicalAwareness/sample";
import ReadingProcessing  from "./pages/readingProcessing/sample";
import LeoIdentificationGame from "./pages/speechProcessing/LeoIdentificationGame";
import LeoTrainingSafari from "./pages/speechProcessing/LeoTrainingSafari";
import IdentificationActivitiesPA from "./pages/phonologicalAwareness/identificationActivities";
import ImprovementLevelsPA from "./pages/phonologicalAwareness/ImprovementLevels";
import ImprovementActivityPA from "./pages/phonologicalAwareness/ImprovementActivityPA";
import ReportsDashboard from "./pages/common/reports/ReportsDashboard";
import ComponentReportSelect from "./pages/common/reports/ComponentReportSelect";
import PhonologicalAwarenessReport from "./pages/common/reports/PhonologicalAwarenessReport";
import PhonologicalImprovementReport from "./pages/common/reports/PhonologicalImprovementReport";
import IdentifyWorkingMemoryReport from "./pages/common/reports/IdentifyWorkingMemoryReport";
import ImproveWorkingMemoryReport from "./pages/common/reports/ImproveWorkingMemoryReport";
import SpeechIdentificationReport from "./pages/common/reports/SpeechIdentificationReport";
import SpeechImprovementReport from "./pages/common/reports/SpeechImprovementReport";

// Working Memory
import Identify from "./features/workingMemory/identification/ScreeningPage";
import ImprovementLevelsWM from "./features/workingMemory/improvement/LevelSelection";
import ImprovementActivityWM from "./features/workingMemory/improvement/ImprovementPage";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminDashboard from "./pages/admin/Dashboard";

// Route-level listener to ensure audio/speech is cancelled when changing pages
const GlobalAudioListener = () => {
  const location = useLocation();

  useEffect(() => {
    stopAllAudio();
  }, [location.pathname]);

  return null;
};

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Component to prevent authenticated users from accessing login/register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminPublicRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <GlobalAudioListener />
      <MemoryMusicRouteListener />
      <Routes>
        {/* Public Routes - Only accessible if NOT logged in */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected Routes - Only accessible if logged in */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/phonological-awareness" element={<ProtectedRoute><PhonologicalAwareness /></ProtectedRoute>} />
        <Route path="/reading-processing" element={<ProtectedRoute><ReadingProcessing /></ProtectedRoute>} />
        <Route path="/speech-processing" element={<Navigate to="/dashboard" replace />} />
        <Route path="/speech-processing/leo-identification" element={<ProtectedRoute><LeoIdentificationGame /></ProtectedRoute>} />
        <Route path="/speech-processing/leo-training" element={<ProtectedRoute><LeoTrainingSafari /></ProtectedRoute>} />
        <Route path="/speech-processing/leo-training/:activityId" element={<ProtectedRoute><LeoTrainingSafari /></ProtectedRoute>} />

        <Route path="/identificationActivities-pa/:grade" element={<ProtectedRoute><IdentificationActivitiesPA /></ProtectedRoute>} />
        <Route path="/improvement-pa/:grade" element={<ProtectedRoute><ImprovementLevelsPA /></ProtectedRoute>} />
        <Route path="/improvement-activity-pa/:grade/:levelNumber/:subCategoryKey" element={<ProtectedRoute><ImprovementActivityPA /></ProtectedRoute>} />
        <Route path="/working-memory/:grade" element={<ProtectedRoute><Identify /></ProtectedRoute>} />
        <Route path="/improvement-wm/:grade" element={<ProtectedRoute><ImprovementLevelsWM /></ProtectedRoute>} />
        <Route path="/improvement-activity-wm/:grade/:levelNumber/:subCategoryKey" element={<ProtectedRoute><ImprovementActivityWM /></ProtectedRoute>} />

        {/* Reports Routes */}
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/reports/:componentId" element={<ComponentReportSelect />} />
        <Route path="/reports/pa/identification" element={<PhonologicalAwarenessReport />} />
        <Route path="/reports/pa/improvement" element={<PhonologicalImprovementReport />} />
        <Route path="/reports/wm/identification" element={<IdentifyWorkingMemoryReport />} />
        <Route path="/reports/wm/improvement" element={<ImproveWorkingMemoryReport />} />
        <Route path="/reports/sp/identification" element={<SpeechIdentificationReport />} />
        <Route path="/reports/sp/improvement" element={<SpeechImprovementReport />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
        <Route path="/admin/register" element={<AdminPublicRoute><AdminRegister /></AdminPublicRoute>} />
        <Route path="/admin/*" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
