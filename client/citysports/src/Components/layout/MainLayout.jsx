import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';   // Create this if you don't have it yet

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />           {/* ← This is very important */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;