import React from 'react';
import { Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { Section, Domain } from '../types';

interface FooterProps {
    domain?: Domain;
    onNavigate?: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ domain, onNavigate }) => {
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

  return (
    <footer className={`relative ${theme.bg} text-white pt-32 pb-12 overflow-hidden border-t border-white/5 transition-colors duration-700`}>
        
        {/* 1. WATERMARK LAYER - Massive visual anchor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <h1 className="text-[25vw] font-bold text-brand-silver/[0.02] leading-none absolute -top-10 -left-10 select-none font-sans tracking-tighter uppercase">
                CERTUS
            </h1>
        </div>

        {/* Ambient Glow */}
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial ${theme.bgGradient} to-transparent opacity-20 blur-[120px] pointer-events-none z-0`}></div>

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
                            Skilled Trades & Operations
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-light">
                        Specialized recruitment for Heavy Duty Mechanics, Industrial Maintenance, and Shop Leadership across North America.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center border rounded-sm transition-all duration-300 ${theme.button}`}>
                            <Linkedin size={20} strokeWidth={1.5} />
                        </a>
                         <a href="mailto:info@certusgroup.com" className={`w-12 h-12 flex items-center justify-center border rounded-sm transition-all duration-300 ${theme.button}`}>
                            <Mail size={20} strokeWidth={1.5} />
                        </a>
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
                             { label: 'Social', id: Section.INSIGHTS },
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
                    &copy; {new Date().getFullYear()} Certus Group. All rights reserved.
                </p>
                <div className="flex items-center gap-8">
                    <a href="#" className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">Privacy</a>
                    <button 
                        onClick={() => handleNav(Section.ADMIN)}
                        className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
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