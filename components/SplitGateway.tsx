import React, { useState, useRef, useEffect } from 'react';
import { Domain, Section } from '../types';
import { ArrowRight } from 'lucide-react';
import Header from './Header';

interface SplitGatewayProps {
  onSelect: (domain: Domain) => void;
  onViewJobs: () => void;
  onNavigate?: (sectionId: string, domainHint?: Domain) => void;
}

const SplitGateway: React.FC<SplitGatewayProps> = ({ onSelect, onViewJobs, onNavigate }) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const tradesVideoRef = useRef<HTMLVideoElement>(null);
  const jobsVideoRef = useRef<HTMLVideoElement>(null);

  const navyBg = 'bg-brand-logistics'; // Skilled Trades Slate
  const steelBg = 'bg-brand-dark'; // Practice Sectors Dark
  const silverText = 'text-brand-silver'; 

  const videos = {
    'skilled-trades': "https://res.cloudinary.com/dvbubqhpp/video/upload/v1774055761/20654636-uhd_3840_2160_30fps_himwzn.mp4",
    'finance-it': "https://res.cloudinary.com/dvbubqhpp/video/upload/v1773668089/13653860_1080_1920_30fps_xvbelr.mp4"
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setScrollPos(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const tradesVideo = tradesVideoRef.current;
    const jobsVideo = jobsVideoRef.current;
    
    let tradesFrameId: number;
    let jobsFrameId: number;

    const reverseLoop = (video: HTMLVideoElement, side: 'trades' | 'jobs') => {
      if (video.currentTime <= 0.1) {
        video.currentTime = video.duration || 5;
      } else {
        video.currentTime -= 0.033;
      }
      
      if (side === 'trades') {
        tradesFrameId = requestAnimationFrame(() => reverseLoop(video, 'trades'));
      } else {
        jobsFrameId = requestAnimationFrame(() => reverseLoop(video, 'jobs'));
      }
    };

    const shouldPlayTrades = isMobile || hovered === 'skilled-trades';
    const shouldPlayJobs = isMobile || hovered === 'finance-it';

    if (shouldPlayTrades && tradesVideo) {
      if (tradesVideo.readyState >= 1) {
        tradesFrameId = requestAnimationFrame(() => reverseLoop(tradesVideo, 'trades'));
      } else {
        tradesVideo.addEventListener('loadedmetadata', () => {
          tradesFrameId = requestAnimationFrame(() => reverseLoop(tradesVideo, 'trades'));
        }, { once: true });
      }
    }

    if (shouldPlayJobs && jobsVideo) {
      if (jobsVideo.readyState >= 1) {
        jobsFrameId = requestAnimationFrame(() => reverseLoop(jobsVideo, 'jobs'));
      } else {
        jobsVideo.addEventListener('loadedmetadata', () => {
          jobsFrameId = requestAnimationFrame(() => reverseLoop(jobsVideo, 'jobs'));
        }, { once: true });
      }
    }

    return () => {
      cancelAnimationFrame(tradesFrameId);
      cancelAnimationFrame(jobsFrameId);
    };
  }, [hovered, isMobile]);

  const getClipPath = (side: 'left' | 'right') => {
    if (isMobile) {
      if (side === 'left') {
        // Skilled Trades (Top on mobile)
        const shift = Math.min(scrollPos * 0.02, 5);
        return `polygon(0 0, 100% 0, 100% ${50 + shift}%, 0 ${60 + shift}%)`;
      }
      return 'none'; // Finance & IT is the base layer
    }
    
    if (side === 'left') {
      if (hovered === 'finance-it') return 'polygon(0 0, 45% 0, 25% 100%, 0 100%)'; 
      if (hovered === 'skilled-trades') return 'polygon(0 0, 95% 0, 75% 100%, 0 100%)';   
      return 'polygon(0 0, 75% 0, 55% 100%, 0 100%)'; 
    }
    return 'none';
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-dark font-sans selection:bg-brand-silver selection:text-black">
      
      <Header 
        onReset={() => {}} 
        domain={null} 
        onSwitch={(d) => onSelect(d)} 
        onViewJobs={onViewJobs}
        onNavigate={onNavigate} 
        hoveredDomain={hovered as Domain}
      />

      {/* CORE INDUSTRIES (Bottom on Mobile, Right on Desktop) */}
      <div 
        className={`${isMobile ? 'absolute inset-0 h-full' : 'absolute inset-0 h-full'} w-full cursor-pointer ${steelBg} transition-all duration-700 overflow-hidden active:scale-[0.98] md:active:scale-100`}
        style={{ clipPath: isMobile ? getClipPath('right') : 'none' }}
        onClick={() => onNavigate?.(Section.INDUSTRIES, 'skilled-trades')}
        onMouseEnter={() => !isMobile && setHovered('finance-it')}
        onMouseLeave={() => !isMobile && setHovered(null)}
      >
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={jobsVideoRef}
            src={videos['finance-it']}
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-out ${hovered === 'finance-it' ? 'scale-105 opacity-60 grayscale-0' : 'opacity-20 grayscale scale-100'}`}
          />
          
          <div className="absolute inset-0 bg-brand-dark/40"></div>
          <div 
            className="absolute inset-0 z-10 opacity-20 pointer-events-none transition-opacity duration-700"
            style={{
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: isMobile ? 'none' : 'radial-gradient(circle at 70% 50%, black, transparent 80%)'
            }}
          ></div>
        </div>

        <div className={`${isMobile ? 'absolute bottom-0 left-0 h-[45%] w-full items-center px-8 text-center pb-10 md:pb-16' : 'absolute top-0 right-0 h-full w-[40%] items-end pr-10 lg:pr-24 text-right'} flex flex-col justify-center z-20 pointer-events-none transition-all duration-700 ${hovered === 'skilled-trades' ? 'opacity-30 translate-x-12 blur-sm' : 'opacity-100 translate-x-0'}`}>
          <div className="space-y-4 md:space-y-12 max-w-xl pointer-events-auto transform transition-transform duration-500 active:scale-95">
            {isMobile && (
              <h2 className="text-3xl sm:text-4xl font-normal text-white leading-[0.9] tracking-tighter mb-4">
                Practice <span className={`font-serif italic font-light ${silverText}`}>Sectors</span>
              </h2>
            )}
            {!isMobile && (
              <div className="flex flex-col items-end gap-4">
                 <div className={`h-px bg-white/50 transition-all duration-500 ${hovered === 'finance-it' ? 'w-24' : 'w-12'}`}></div>
              </div>
            )}
            <div className={`flex flex-col ${isMobile ? 'items-center' : 'items-end'} gap-2 md:gap-5`}>
              {['Operations Leadership', 'Industrial Technology', 'Supply Chain & Logistics', 'Enterprise IT'].map((role, i) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  {isMobile ? null : (
                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${hovered === 'finance-it' || isMobile ? 'bg-brand-silver' : 'bg-white/20'}`}></div>
                  )}
                  <span className={`text-[9px] md:text-xs font-bold uppercase tracking-[0.3em] transition-all duration-300 ${hovered === 'finance-it' || isMobile ? 'text-white' : 'text-white/40'}`}>
                    {role}
                  </span>
                  {isMobile ? null : null}
                </div>
              ))}
            </div>
            
            <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'} pt-2 md:pt-8`}>
               <div className={`group flex items-center gap-4 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${hovered === 'finance-it' || isMobile ? 'text-white' : 'text-white/40'}`}>
                 <span>Explore Sectors</span>
                 <ArrowRight size={20} md:size={24} strokeWidth={1.5} className={`transition-transform duration-300 ${hovered === 'finance-it' ? 'translate-x-2' : ''}`} />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* SKILLED TRADES (Top on Mobile, Left on Desktop) */}
      <div 
        className={`${isMobile ? 'absolute inset-0 h-full z-30' : 'absolute inset-0 h-full z-30 drop-shadow-[20px_0_50px_rgba(0,0,0,0.5)]'} w-full cursor-pointer overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-[0.98] md:active:scale-100`}
        style={{ clipPath: getClipPath('left') }}
        onClick={() => onSelect('skilled-trades')}
        onMouseEnter={() => !isMobile && setHovered('skilled-trades')}
        onMouseLeave={() => !isMobile && setHovered(null)}
      >
        <div className={`absolute inset-0 ${navyBg}`}>
           <video
            ref={tradesVideoRef}
            src={videos['skilled-trades']}
            muted
            loop
            playsInline
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1500ms] ease-out ${hovered === 'skilled-trades' ? 'scale-105 opacity-60 grayscale-0' : 'opacity-20 grayscale scale-100'}`}
           />

           <div className="absolute inset-0 bg-black/30"></div>
           <div 
            className="absolute inset-0 z-10 opacity-20 pointer-events-none transition-opacity duration-700"
            style={{
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                maskImage: isMobile ? 'none' : 'radial-gradient(circle at 30% 50%, black, transparent 80%)'
            }}
           ></div>
        </div>
        
        <div className={`${isMobile ? 'absolute top-0 left-0 h-[55%] w-full items-center px-8 text-center pt-16 md:pt-20' : 'absolute top-0 left-0 h-full w-[50%] md:w-[60%] lg:w-[55%] items-start pl-10 lg:pl-24 text-left'} flex flex-col justify-center z-40 transition-all duration-700 ${hovered === 'finance-it' ? 'opacity-30 -translate-x-12 blur-sm' : 'opacity-100 translate-x-0'}`}>
          <div className="space-y-4 md:space-y-12 max-w-xl transform transition-transform duration-500 active:scale-95">
             {!isMobile && (
               <div className="space-y-6">
                 <div className="flex flex-col items-start gap-4">
                   <div className={`h-px bg-white/50 transition-all duration-500 ${hovered === 'skilled-trades' ? 'w-24' : 'w-12'}`}></div>
                 </div>
               </div>
             )}
             <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[10rem] font-normal text-white leading-[0.9] md:leading-[0.8] tracking-tighter">
              Skilled Trades <span className="whitespace-nowrap"><span className={`font-cursive ${silverText} mx-2 md:mx-4`}>&</span> <span className={`font-serif italic font-light ${silverText} drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]`}>Operations</span></span>
             </h2>
             <div className={`flex ${isMobile ? 'justify-center' : 'justify-end md:justify-start'} pt-2 md:pt-8`}>
               <div className={`group flex items-center gap-4 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${hovered === 'skilled-trades' || isMobile ? 'text-white' : 'text-white/40'}`}>
                 <ArrowRight size={20} md:size={24} strokeWidth={1.5} className={`transition-transform duration-300 ${hovered === 'skilled-trades' ? 'translate-x-2' : ''}`} />
                 <span>Trades Search</span>
               </div>
            </div>
          </div>
        </div>
        {!isMobile && <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/10 h-full"></div>}
      </div>

      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 pointer-events-none ${hovered ? 'opacity-0 translate-y-4' : 'opacity-40 translate-y-0'}`}>
          <div className="flex flex-col items-center gap-4">
             <div className="w-px h-12 bg-white/20"></div>
          </div>
      </div>
    </div>
  );
};

export default SplitGateway;
