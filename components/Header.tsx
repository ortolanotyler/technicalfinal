import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, RefreshCw } from 'lucide-react';
import { Section, Domain } from '../types';

interface HeaderProps {
  onReset: () => void;
  domain: Domain;
  onSwitch: (domain: Domain) => void;
  onViewJobs: () => void;
  onNavigate?: (sectionId: string, domainHint?: Domain) => void;
  hoveredDomain?: Domain;
}

const Header: React.FC<HeaderProps> = ({ onReset, domain, onSwitch, onViewJobs, onNavigate, hoveredDomain }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id, hoveredDomain || undefined);
      return;
    }
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLogoSubtitle = () => {
    const activeDomain = hoveredDomain || domain;
    if (activeDomain === 'skilled-trades') return 'TECHNICAL SEARCH';
    if (activeDomain === 'finance-it') return 'EXECUTIVE SEARCH';
    return 'TECHNICAL SEARCH';
  };

  const logoSubtitleText = getLogoSubtitle();

  return (
    <>
      <nav 
          className={`fixed w-full z-[60] py-4 transition-all duration-500 ease-in-out ${
            scrolled ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/5 py-3' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center cursor-pointer group select-none relative z-[70]" onClick={onReset}>
              <img 
                src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png" 
                className="w-10 h-10 mr-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300 grayscale brightness-[2]"
                alt="Certus Logo"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col justify-center">
                <span className="font-sans font-bold text-2xl tracking-tight leading-none text-white transition-all duration-300">
                  CERTUS<span className="text-brand-accent">GROUP</span>
                </span>
                <span className="font-nourd text-[9px] font-bold uppercase tracking-[0.4em] ml-[2px] mt-1.5 text-white/40 transition-all duration-300 group-hover:text-brand-silver">
                  {logoSubtitleText}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-10">
              {[
                  { id: Section.INDUSTRIES, label: 'Sectors' },
                  { id: Section.INSIGHTS, label: 'Social' }
              ].map((item) => (
                  <button 
                      key={item.id}
                      onClick={() => scrollTo(item.id)} 
                      className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 hover:text-white relative group/nav transition-all duration-300 py-2"
                  >
                      {item.label}
                      {/* Premium Underline Animation */}
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-silver/30 scale-x-0 group-hover/nav:scale-x-100 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></span>
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-silver scale-x-0 group-hover/nav:scale-x-100 origin-center transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] blur-[1px] opacity-0 group-hover/nav:opacity-50"></span>
                  </button>
              ))}

              <button 
                  onClick={onViewJobs} 
                  className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 hover:text-white relative group/nav transition-all duration-300 py-2"
              >
                  Job Openings
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-silver/30 scale-x-0 group-hover/nav:scale-x-100 origin-center transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"></span>
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-silver scale-x-0 group-hover/nav:scale-x-100 origin-center transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] blur-[1px] opacity-0 group-hover/nav:opacity-50"></span>
              </button>
              
              {/* Domain Switcher Removed as Executive & IT is redundant */}

              <button 
                onClick={() => scrollTo(Section.CONTACT)} 
                className="bg-white text-brand-dark hover:bg-brand-silver px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
              >
                Contact
              </button>
            </div>

            {/* Mobile/Small Tablet Trigger (Below 1024px) */}
            <div className="lg:hidden flex items-center gap-4 relative z-[70]">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className={`p-2 rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'text-white' : 'text-white/80'}`}
              >
                {mobileMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[55] lg:hidden transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Dark Backdrop */}
        <div 
          className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Navigation Content */}
        <div 
          className={`absolute inset-y-0 right-0 w-full md:w-[400px] bg-brand-dark border-l border-white/5 flex flex-col p-8 pt-32 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Menu Items */}
          <div className="space-y-1">
             {[
                 { id: Section.INDUSTRIES, label: 'Practice Sectors', sub: 'Industry Expertise' },
                 { id: Section.INSIGHTS, label: 'Social', sub: 'LinkedIn Feed' },
                 { id: 'JOBS', label: 'Job Openings', sub: 'Career Opportunities', action: onViewJobs },
                 { id: Section.CONTACT, label: 'Contact Us', sub: 'Global Reach' },
             ].map((link, idx) => (
                 <button 
                    key={link.id}
                    onClick={() => {
                      if ('action' in link && link.action) {
                        setMobileMenuOpen(false);
                        link.action();
                      } else {
                        scrollTo(link.id);
                      }
                    }}
                    className="w-full text-left py-6 group flex flex-col transition-all duration-300"
                    style={{ transitionDelay: `${idx * 50}ms` }}
                 >
                     <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-silver/40 group-hover:text-brand-silver mb-2 transition-colors">
                        {link.sub}
                     </span>
                     <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-white group-hover:translate-x-2 transition-transform duration-500">
                            {link.label}
                        </span>
                        <ArrowRight size={24} className="text-white/10 group-hover:text-white/60 group-hover:translate-x-2 transition-all opacity-0 group-hover:opacity-100" />
                     </div>
                     <div className="h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-brand-silver/20 to-transparent mt-4 transition-all duration-700"></div>
                 </button>
             ))}
          </div>

          {/* Footer of Menu */}
          <div className="mt-auto pt-10 border-t border-white/5 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Current Sector</span>
                      <span className="text-sm font-bold text-brand-silver uppercase tracking-widest">
                          {domain === 'skilled-trades' ? 'Skilled Trades & Operations' : 'Technical Search'}
                      </span>
                  </div>
              </div>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] text-center">
                  © {new Date().getFullYear()} Certus Group Executive Search
              </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;