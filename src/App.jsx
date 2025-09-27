import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
function FadeTransition({ children }) {
  const { pathname } = useLocation();
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    setShow(false);
    const timeout = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timeout);
  }, [pathname]);
  return (
    <div className={`transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</div>
  );
}
import LandingPage from './pages/LandingPage';
import RoomsPage from './pages/RoomsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BookingPage from './pages/BookingPage';
import SocialPage from './pages/SocialPage';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import SupervisorDashboard from './dashboards/SupervisorDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';
import BarmenDashboard from './dashboards/BarmenDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === '/staff' || 
                          location.pathname === '/login' || 
                          location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-1">
          <FadeTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/social" element={<SocialPage/>}/>
              <Route path="/staff" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/superadmin" element={
                <ErrorBoundary>
                  <ProtectedRoute requiredRole="superadmin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/dashboard/supervisor" element={
                <ProtectedRoute requiredRole="supervisor">
                  <SupervisorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/receptionist" element={
                <ProtectedRoute requiredRole="receptionist">
                  <ReceptionistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/barmen" element={
                <ProtectedRoute requiredRole="barmen">
                  <BarmenDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </FadeTransition>
        </main>
        {!hideNavAndFooter && <Footer />}
      </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
