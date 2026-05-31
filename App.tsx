import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import Contact from './components/Contact';
import Footer from './components/Footer';
import IndustriesServed from './components/IndustriesServed';
import SplitGateway from './components/SplitGateway';
import SEO from './components/SEO';
import Analytics from './components/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import { View, Section } from './types';

// Heavy components (Firebase SDK, motion, react-markdown) are code-split so the
// gateway and above-the-fold landing load without them.
const LinkedInFeed = lazy(() => import('./components/LinkedInFeed'));
const FeaturedJobsHero = lazy(() => import('./components/FeaturedJobsHero'));
const JobBoardPage = lazy(() => import('./components/JobBoardPage'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));
const EmployersPage = lazy(() => import('./components/EmployersPage'));

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/jobs')) return 'jobs';
    if (path === '/employers') return 'employers';
    if (path === '/admin') return 'admin';
    return 'gateway';
  });

  const [initialJobId, setInitialJobId] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/jobs/')) {
      return path.split('/jobs/')[1];
    }
    return null;
  });

  // Ensure window scrolls to top on navigation/state change
  useEffect(() => {
    if (view !== 'gateway') {
      window.scrollTo(0, 0);
    }
    
    // Update URL to match view
    const path = window.location.pathname;
    let newPath = '/';
    if (view === 'jobs') newPath = '/jobs';
    else if (view === 'admin') newPath = '/admin';
    else if (view === 'employers') newPath = '/employers';
    else if (view === 'landing') newPath = '/';

    if (path !== newPath && !path.startsWith('/jobs/')) {
      window.history.pushState({}, '', newPath);
    }
  }, [view]);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === Section.ADMIN) {
        setView('admin');
        return;
    }

    if (view === 'jobs' || view === 'admin' || view === 'gateway') {
      setView('landing');
      setTimeout(() => {
         document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Navigating to the board via a control should show the list, not re-open a
  // previously deep-linked job. (A genuine /jobs/:id load still auto-opens,
  // since that sets initialJobId at mount without going through here.)
  const handleViewJobs = () => {
    setInitialJobId(null);
    setView('jobs');
  };

  const handleGatewaySelect = (target: 'landing' | 'sectors') => {
    setView('landing');
    if (target === 'sectors') {
      setTimeout(() => {
        document.getElementById(Section.INDUSTRIES)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const renderContent = () => {
    if (view === 'gateway') {
      return (
        <>
          <SEO isGateway={true} />
          <SplitGateway 
            onSelect={handleGatewaySelect} 
            onViewJobs={handleViewJobs}
            onNavigate={handleNavigate}
          />
        </>
      );
    }

    if (view === 'jobs') {
      return <JobBoardPage onBack={() => setView('landing')} initialJobId={initialJobId} />;
    }

    if (view === 'admin') {
        return <AdminPortal onExit={() => setView('landing')} />;
    }

    if (view === 'employers') {
      return (
        <EmployersPage
          onViewJobs={handleViewJobs}
          onNavigate={handleNavigate}
        />
      );
    }

    return (
      <div className="min-h-screen font-sans opacity-0 animate-[fadeIn_1.2s_ease-out_forwards] transition-colors duration-1000 bg-brand-dark text-white selection:bg-brand-silver selection:text-black">
        <SEO title="Certus Technical Search" />
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
        
        {/* Global Background (Solid) - Video is now handled within components like Hero for cleaner flow */}
        <div className="fixed inset-0 z-[-1] bg-brand-dark"></div>
        
        <Header 
          onViewJobs={handleViewJobs}
          onNavigate={handleNavigate} 
        />
        
        <main className="relative">
          <Hero />
          <IndustriesServed />
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <FeaturedJobsHero onViewJobs={handleViewJobs} />
          </Suspense>
          {/* LinkedIn is lazy; give the fallback the section id so the
              "Social" anchor still resolves before the chunk loads. */}
          <Suspense fallback={<div id={Section.INSIGHTS} className="min-h-[400px]" />}>
            <LinkedInFeed />
          </Suspense>
          <Contact />
        </main>
        
        <Footer onNavigate={(id) => handleNavigate(id)} />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Analytics />
        <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
          {renderContent()}
        </Suspense>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
