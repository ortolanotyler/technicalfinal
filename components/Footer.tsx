import React from 'react';
import { Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { Section } from '../types';

interface FooterProps {
    onNavigate?: (id: string) => void;
    onViewInsights?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onViewInsights }) => {
  // Dynamic Theme Configuration - Monochrome Brand
  const theme = {
    accent: 'text-brand-silver',
    border: 'border-brand-steel/30',
    hover: 'hover:text-brand-silver',
    bgGradient: 'from-brand-steel/10',
    button: 'hover:bg-brand-silver hover:text-brand-dark border-brand-steel/30 text-brand-silver',
    titleHover: 'group-hover:text-brand-silver',
    bg: 'bg-brand-dark' 
  };

  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The Certus Group of Companies — each practice links to its own site.
  // Each division ships its own coloured mark: burgundy for Corporate, grey for Technical.
  const FAMILY_LOGO = 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';
  const CORPORATE_LOGO = 'https://corp.certusgroup.com/CertusLOGO_burgundy_circle.png';
  const TECHNICAL_LOGO = 'https://technical.certusgroup.com/CertusLOGO_grey_circle.png';
  const familyCompanies: Array<{ name: string; href: string; logo: string; gray?: boolean }> = [
    { name: 'Certus Supply Chain Search', href: 'https://logistics.certusgroup.com', logo: FAMILY_LOGO },
    { name: 'Certus Corporate Search', href: 'https://corp.certusgroup.com', logo: CORPORATE_LOGO },
    { name: 'Certus Technical Search', href: 'https://technical.certusgroup.com', logo: TECHNICAL_LOGO },
  ];

  return (
    <footer className={`relative ${theme.bg} text-white pt-32 pb-12 overflow-hidden border-t border-white/5 transition-colors duration-700`}>
        
        {/* 1. WATERMARK LAYER - Massive visual anchor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div 
                aria-hidden="true"
                className="text-[25vw] font-bold text-brand-silver/[0.02] leading-none absolute -top-10 -left-10 select-none font-sans tracking-tighter uppercase"
            >
                CERTUS
            </div>
        </div>


        {/* 2. CONTENT LAYER */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
                
                {/* Brand Column */}
                <div className="md:col-span-5 lg:col-span-4 space-y-8">
                    <div className="flex flex-col">
                        <span className="font-sans font-bold text-3xl tracking-tight text-white">
                            CERTUS<span className="text-brand-accent">GROUP</span>
                        </span>
                        <span className="text-brand-silver/60 text-[10px] uppercase tracking-[0.4em] mt-1 font-bold">
                            Technical Search
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                        Specialized recruitment for Heavy Duty Mechanics, Industrial Maintenance, and Technical Leadership across North America.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://www.linkedin.com/showcase/certus-technical-search/" target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center border rounded-sm transition-all duration-300 ${theme.button}`}>
                            <Linkedin size={20} strokeWidth={1.5} />
                        </a>
                         <button 
                            onClick={() => handleNav(Section.CONTACT)}
                            className={`w-12 h-12 flex items-center justify-center border rounded-sm transition-all duration-300 ${theme.button}`}
                            aria-label="Contact us"
                         >
                            <Mail size={20} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Navigation Column */}
                <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                        Menu
                    </h4>
                    <ul className="space-y-4">
                         {[
                             { label: 'Home', id: Section.HERO },
                             { label: 'Contact', id: Section.CONTACT },
                         ].map((link) => (
                             <li key={link.id}>
                                 <button
                                    onClick={() => handleNav(link.id)}
                                    className={`text-gray-400 text-sm hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group ${theme.hover}`}
                                 >
                                     <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-current transition-colors"></span>
                                     {link.label}
                                 </button>
                             </li>
                         ))}
                         {/* Un-hidden 2026-09-15. Held behind `false &&`, so /insights
                             had NO internal link pointing at it from anywhere on the
                             site - an orphan page. Search engines weight internal links
                             heavily when deciding what to crawl, so the article was
                             effectively invisible even with a correct sitemap. Same fix
                             the logistics site took on 2026-08-31. */}
                         {onViewInsights && (
                             <li>
                                 <button
                                    onClick={onViewInsights}
                                    className={`text-gray-400 text-sm hover:translate-x-2 transition-all duration-300 flex items-center gap-2 group ${theme.hover}`}
                                 >
                                     <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-current transition-colors"></span>
                                     Insights
                                 </button>
                             </li>
                         )}
                    </ul>
                </div>

                {/* Offices Column */}
                <div className="md:col-span-4 lg:col-span-3">
                     <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-8">Headquarters</h4>
                     <div className="space-y-8">
                         <div className="group cursor-default">
                             <div className="flex items-center gap-2 mb-2">
                                <h5 className={`text-sm font-bold text-white transition-colors ${theme.titleHover}`}>Toronto, Canada</h5>
                                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                             </div>
                             <p className="text-gray-500 text-sm font-light leading-relaxed">
                                 91 Skyway Avenue, Suite 206<br/>
                                 Toronto, ON., M9W 6R5
                             </p>
                         </div>
                     </div>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-gray-600 text-xs tracking-wide">
                    &copy; 2008&ndash;{new Date().getFullYear()} Certus Group. All rights reserved.
                </p>
                <div className="flex flex-col items-center md:items-end gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                        The Certus Group of Companies
                    </span>
                    <div className="flex items-center gap-3">
                        {familyCompanies.map((c) => (
                            <a
                                key={c.href}
                                href={c.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={c.name}
                                title={c.name}
                                className="opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <img
                                    src={c.logo}
                                    alt={c.name}
                                    referrerPolicy="no-referrer"
                                    className="w-8 h-8"
                                />
                            </a>
                        ))}
                    </div>
                    <button
                        onClick={() => handleNav(Section.ADMIN)}
                        className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors mt-1"
                    >
                        Admin
                    </button>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;