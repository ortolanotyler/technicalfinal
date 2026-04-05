import React, { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import LinkedInFeed from './components/LinkedInFeed';
import FeaturedJobsHero from './components/FeaturedJobsHero';
import Contact from './components/Contact';
import Footer from './components/Footer';
import JobBoardPage from './components/JobBoardPage';
import AdminPortal from './components/AdminPortal';
import IndustriesServed from './components/IndustriesServed';
import SplitGateway from './components/SplitGateway';
import SEO from './components/SEO';
import ErrorBoundary from './components/ErrorBoundary';
import { View, Section } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/jobs')) return 'jobs';
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
            onViewJobs={() => setView('jobs')}
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
          onViewJobs={() => setView('jobs')}
          onNavigate={handleNavigate} 
        />
        
        <main className="relative">
          <Hero />
          <IndustriesServed />
          <LinkedInFeed />
          <FeaturedJobsHero onViewJobs={() => setView('jobs')} />
          <Contact />
        </main>
        
        <Footer onNavigate={(id) => handleNavigate(id)} />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        {renderContent()}
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
