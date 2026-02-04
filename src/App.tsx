import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './components/Toast';

// Pages what
import Home from './pages/Home';
import CyberSecurityPortfolio from './pages/CyberSecurityPortfolio';
import SoftwarePortfolio from './pages/SoftwarePortfolio';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import AdminPanel from './pages/AdminPanel';
import UnsubscribePage from './pages/UnsubscribePage';
import SitemapRoute from './pages/SitemapRoute';

// Components
import Layout from './components/Layout';
import CursorGlow from './components/CursorGlow';

// Router wrapper to enable location-based animations
const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle redirects from API route
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      navigate(redirect, { replace: true });
    }
  }, [location, navigate]);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/cybersecurity" element={<CyberSecurityPortfolio />} />
        <Route path="/software" element={<SoftwarePortfolio />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/sitemap.xml" element={<SitemapRoute />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const updateCursorPosition = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    if (!isMobile) {
      window.addEventListener('mousemove', updateCursorPosition);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      if (!isMobile) {
        window.removeEventListener('mousemove', updateCursorPosition);
      }
    };
  }, [isMobile]);

  return (
    <HelmetProvider>
      <ToastProvider>
        <Router>
          <Layout>
            {!isMobile && <CursorGlow position={cursorPosition} />}
            <AnimatedRoutes />
          </Layout>
        </Router>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;