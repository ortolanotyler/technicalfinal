import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import LinkedInFeed from './components/LinkedInFeed';
import FeaturedJobsHero from './components/FeaturedJobsHero';
import Services from './components/Services';
import Contact from './components/Contact';
import Footer from './components/Footer';
import SplitGateway from './components/SplitGateway';
import JobBoard from './components/JobBoard';
import JobBoardPage from './components/JobBoardPage';
import AdminPortal from './components/AdminPortal';
import IndustriesServed from './components/IndustriesServed';
import { Domain, View, Section } from './types';

const App: React.FC = () => {
  const [domain, setDomain] = useState<Domain>(null);
  const [view, setView] = useState<View>('landing');

  // Ensure window scrolls to top on navigation/state change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [domain, view]);

  const handleNavigate = (sectionId: string, domainHint?: Domain) => {
    if (sectionId === Section.ADMIN) {
        setView('admin');
        return;
    }

    if (view === 'jobs' || view === 'admin') {
      setView('landing');
      setTimeout(() => {
         document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (!domain) {
      setDomain(domainHint || 'skilled-trades');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!domain && view !== 'admin' && view !== 'jobs') {
    return <SplitGateway onSelect={setDomain} onViewJobs={() => setView('jobs')} onNavigate={handleNavigate} />;
  }

  if (view === 'jobs') {
    return <JobBoardPage domain={domain} onBack={() => setView('landing')} />;
  }

  if (view === 'admin') {
      return <AdminPortal onExit={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen font-sans opacity-0 animate-[fadeIn_1.2s_ease-out_forwards] transition-colors duration-1000 bg-brand-dark text-white selection:bg-brand-silver selection:text-black">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* Global Background (Solid) - Video is now handled within components like Hero for cleaner flow */}
      <div className="fixed inset-0 z-[-1] bg-brand-dark"></div>

      <Header 
        onReset={() => setDomain(null)} 
        domain={domain} 
        onSwitch={setDomain} 
        onViewJobs={() => setView('jobs')}
        onNavigate={handleNavigate} 
      />
      
      <main className="relative z-10">
        <Hero domain={domain} />
        <IndustriesServed domain={domain} />
        <LinkedInFeed domain={domain} />
        <FeaturedJobsHero domain={domain} onViewJobs={() => setView('jobs')} />
        <Contact domain={domain} />
      </main>
      
      <Footer domain={domain} onNavigate={(id) => handleNavigate(id, domain)} />
    </div>
  );
};

export default App;