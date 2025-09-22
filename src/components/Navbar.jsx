import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Camera, Users, Phone, MapPin } from 'lucide-react';
import logo from "/assets/images/logo.svg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef(null);
  const firstMobileLinkRef = useRef(null);
  const lastMobileLinkRef = useRef(null);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Rooms', path: '/rooms', icon: MapPin },
    { name: 'Gallery', path: '/gallery', icon: Camera },
    { name: 'About', path: '/about', icon: Users },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close on Escape and handle window resize to close menu on larger screens
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };

    const onResize = () => {
      // Tailwind md breakpoint ~ 768px
      if (window.innerWidth >= 768 && isOpen) setIsOpen(false);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  // Move focus to first link when opening mobile menu
  useEffect(() => {
    if (isOpen) {
      // small timeout to allow menu to render
      setTimeout(() => firstMobileLinkRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lightweight focus trap: keep focus inside mobile menu when open
  useEffect(() => {
    if (!isOpen || !mobileMenuRef.current) return;

    const container = mobileMenuRef.current;
  const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = container.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
  const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
  last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
  first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="bg-[#7B3F00]/90 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logo} alt="Smile-T Continental Hotel logo" className="w-fit h-fit" />
              </div>
              <span className="text-xl font-bold text-[#fff]">Smile-T</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 border-b-2 ${
                    isActive(item.path)
                      ? 'text-[#FFD700] bg-[#7B3F00]/80 border-[#FFD700]' // gold underline
                      : 'text-white hover:text-[#7B3F00] hover:bg-[#FFD700] border-transparent focus-visible:ring-2 focus-visible:ring-[#FFD700]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/social"
              className="bg-[#FFD700] text-[#7B3F00] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#7B3F00] hover:text-[#FFD700] transition-colors duration-300"
            >
              Follow Us
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="text-[#fff] hover:text-[#FFD700] focus:outline-none focus:text-[#FFD700]"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
  <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden bg-[#7B3F00] border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  ref={(el) => {
                    if (idx === 0) firstMobileLinkRef.current = el;
                    if (idx === navItems.length - 1) lastMobileLinkRef.current = el;
                  }}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive(item.path)
                      ? 'text-[#FFD700] bg-[#7B3F00]/80'
                      : 'text-white hover:text-[#7B3F00] hover:bg-[#FFD700]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/social"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center bg-[#FFD700] text-[#7B3F00] px-3 py-2 rounded-md text-base font-medium mx-3 mt-2 hover:bg-[#7B3F00] hover:text-[#FFD700] transition-colors duration-300"
            >
              Follow Us
            </Link>
          </div>
  </div>
      )}
    </nav>
  );
};

export default Navbar;