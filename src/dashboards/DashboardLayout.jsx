import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DashboardLayout({ children }) {
  return (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#7B3F00', opacity: 0.1 }}>
      <Navbar />
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
