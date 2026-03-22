import React, { useEffect, useRef, useState } from 'react';
import { Section, Domain } from '../types';
import { Building2, Phone, Mail, Linkedin, ArrowRight, ArrowUpRight } from 'lucide-react';

interface ContactProps {
  domain?: Domain;
}

const Contact: React.FC<ContactProps> = ({ domain }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const sectionRef = useRef<HTMLElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) return;

        setStatus('loading');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });

            if (response.ok) {
                setStatus('success');
                setEmail('');
                setName('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
        }
    };

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Theme Config - Monochrome Brand
  const theme = {
    accent: 'text-brand-silver',
    bg: 'bg-brand-steel',
    borderHover: 'hover:border-brand-steel/50',
    iconBg: 'group-hover/item:bg-brand-steel',
    iconColor: 'group-hover/item:text-white',
    glow: 'bg-brand-steel/5 group-hover:bg-brand-steel/20',
    button: 'bg-brand-steel hover:bg-white text-white hover:text-brand-dark',
    gradientText: 'from-brand-silver to-white',
    sectionBg: 'bg-brand-dark/95'
  };

  return (
    <section 
      id={Section.CONTACT} 
      ref={sectionRef}
      className={`${theme.sectionBg} backdrop-blur-xl py-32 relative overflow-hidden transition-colors duration-700`}
    >
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dvbubqhpp/image/upload/v1770947667/IMG_5018-edit-1024x683_eiabfr.jpg')] bg-cover bg-center grayscale mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                
                {/* The "Business Card" */}
                <div 
                  className={`
                    bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 lg:p-14 rounded-sm shadow-2xl relative overflow-hidden group transition-all duration-1000 ease-out
                    ${theme.borderHover}
                    ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                  `}
                >
                    <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 ${theme.bg} ${isVisible ? 'h-full' : 'h-0'}`}></div>
                    <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] transition-all duration-700 ${theme.glow}`}></div>

                    <div className="mb-8 md:mb-12 relative">
                        <span className="font-sans font-bold text-2xl md:text-3xl text-white tracking-[0.2em] block mb-1">
                            CERTUS<span className="text-brand-accent">GROUP</span>
                        </span>
                        <span className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-[0.4em]">Executive Search</span>
                    </div>

                    <div className="space-y-8 md:space-y-10">
                        {/* Address */}
                        <div className="flex items-start gap-4 md:gap-6 group/item cursor-default">
                            <div className={`
                                w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-sm flex-shrink-0
                                ${theme.accent} transition-all duration-300
                                ${theme.iconBg} ${theme.iconColor}
                            `}>
                                <Building2 size={18} md:size={20} strokeWidth={1.5} className="drop-shadow-lg" />
                            </div>
                            <div>
                                <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 opacity-80">Headquarters</h4>
                                <p className="text-gray-400 font-light text-xs md:text-sm leading-relaxed tracking-wide">
                                    91 Skyway Avenue, Suite 206<br/>
                                    Toronto, ON., M9W 6R5
                                </p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-start gap-4 md:gap-6 group/item cursor-default">
                            <div className={`
                                w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-sm flex-shrink-0
                                ${theme.accent} transition-all duration-300
                                ${theme.iconBg} ${theme.iconColor}
                            `}>
                                <Phone size={18} md:size={20} strokeWidth={1.5} className="drop-shadow-lg" />
                            </div>
                            <div>
                                <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 opacity-80">Direct Line</h4>
                                <p className="text-gray-400 font-light text-xs md:text-sm tracking-wide">
                                    (1 855) 323 7887
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4 md:gap-6 group/item cursor-default">
                            <div className={`
                                w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-sm flex-shrink-0
                                ${theme.accent} transition-all duration-300
                                ${theme.iconBg} ${theme.iconColor}
                            `}>
                                <Mail size={18} md:size={20} strokeWidth={1.5} className="drop-shadow-lg" />
                            </div>
                            <div>
                                <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 opacity-80">Inquiries</h4>
                                <p className="text-gray-400 font-light text-xs md:text-sm tracking-wide">
                                    info@certusgroup.com
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Social - Upgraded */}
                    <div className="mt-10 md:mt-14 pt-6 md:pt-8 border-t border-white/5">
                        <a href="#" className="flex items-center justify-between group/link cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 group-hover/link:text-gray-400 transition-colors">Social</span>
                                <span className="text-xs md:text-sm font-medium text-white group-hover/link:text-brand-silver transition-colors flex items-center gap-2">
                                    Follow on LinkedIn <ArrowUpRight size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity translate-y-1 group-hover/link:translate-y-0" />
                                </span>
                            </div>
                            <div className={`
                                w-8 h-8 md:w-10 md:h-10 rounded-sm border border-white/10 flex items-center justify-center 
                                ${theme.accent} group-hover/link:bg-white group-hover/link:text-brand-dark transition-all duration-300
                            `}>
                                <Linkedin size={16} md:size={18} strokeWidth={1.5} />
                            </div>
                        </a>
                    </div>
                </div>

                {/* Call to Action */}
                <div 
                  className={`
                    text-center lg:text-left space-y-6 md:space-y-8 transition-all duration-1000 ease-out delay-200
                    ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
                  `}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight md:leading-[1.1]">
                        Start Your <br/>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradientText}`}>Search Today.</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-md mx-auto lg:mx-0 border-l border-brand-steel/20 pl-6">
                        Whether you are looking to build a team or seeking your next executive challenge, connect with our specialists.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto lg:mx-0 pt-2 md:pt-4">
                        <div className="relative group">
                             <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Your Name" 
                                className="w-full bg-transparent border-b border-white/30 px-0 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-brand-silver transition-colors text-base md:text-lg font-light" 
                             />
                             <div className={`absolute bottom-0 left-0 h-[1px] bg-brand-silver transition-all duration-500 w-0 group-hover:w-full group-focus-within:w-full`}></div>
                        </div>
                        <div className="relative group">
                             <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email" 
                                className="w-full bg-transparent border-b border-white/30 px-0 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-brand-silver transition-colors text-base md:text-lg font-light" 
                             />
                             <div className={`absolute bottom-0 left-0 h-[1px] bg-brand-silver transition-all duration-500 w-0 group-hover:w-full group-focus-within:w-full`}></div>
                        </div>
                        
                        {status === 'success' && (
                            <p className="text-emerald-400 text-xs md:text-sm font-medium animate-pulse">Thank you. We will be in touch shortly.</p>
                        )}
                        {status === 'error' && (
                            <p className="text-red-400 text-xs md:text-sm font-medium">Something went wrong. Please try again.</p>
                        )}

                        <button 
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full group font-bold uppercase tracking-widest py-4 md:py-5 transition-all duration-300 flex items-center justify-center gap-3 mt-4 ${theme.button} ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {status === 'loading' ? 'Sending...' : 'Request Callback'}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </section>
  );
};

export default Contact;