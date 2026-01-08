import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg scroll-smooth">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;