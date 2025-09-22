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
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
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
            </Routes>
          </FadeTransition>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
