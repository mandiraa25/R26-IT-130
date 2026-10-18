import { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { stopAllAudio } from "./utils/phonologicalAwareness/audio";
import { MemoryMusicRouteListener } from "./features/workingMemory/logic/audio";
import "./styles/pageTransitions.css";

// Every page a child uses is bundled so it opens instantly on tap. Pages children
// never visit (admin, password reset) load as separate chunks, fetched in the
// background once the browser is idle (see PagePrefetcher).
const lazyPages = [];
const lazyPage = (load) => {
  const Page = lazy(load);
  lazyPages.push(load);
  return Page;
};

import Login from "./pages/common/Login";
import Register from "./pages/common/Register";
const ForgotPassword = lazyPage(() => import("./pages/common/PasswordReset").then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazyPage(() => import("./pages/common/PasswordReset").then(m => ({ default: m.ResetPassword })));
import Dashboard from "./pages/common/Dashboard";
import Profile from "./pages/common/Profile";
import PhonologicalAwareness from "./pages/phonologicalAwareness/sample";
import ReadingProcessing from "./pages/readingProcessing/sample";
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
const AdminLogin = lazyPage(() => import("./pages/admin/AdminLogin"));
const AdminRegister = lazyPage(() => import("./pages/admin/AdminRegister"));
const AdminDashboard = lazyPage(() => import("./pages/admin/Dashboard"));

// Downloads every page chunk once, after the first screen has settled.
const PagePrefetcher = () => {
  useEffect(() => {
    const idle = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 1200));
    const cancel = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(() => { lazyPages.forEach((load) => { load().catch(() => {}); }); });
    return () => cancel(handle);
  }, []);
  return null;
};

// Each page fades in softly instead of appearing all at once. The wrapper stays
// mounted (no remount of the page tree); only an opacity animation replays.
const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  const wrapper = useRef(null);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    wrapper.current?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  }, [pathname]);
  return <div ref={wrapper} className="lx-page-transition">{children}</div>;
};

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
      <PagePrefetcher />
      <PageTransition>
      <Suspense fallback={<div className="lx-page-loading" aria-hidden="true" />}>
      <Routes>
        {/* Public Routes - Only accessible if NOT logged in */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

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
      </Suspense>
      </PageTransition>
    </BrowserRouter>
  );
}

export default App;
