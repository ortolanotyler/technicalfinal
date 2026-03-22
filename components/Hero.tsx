import React from 'react';
import { ArrowRight, Wrench, Settings, Truck, ShieldCheck } from 'lucide-react';
import { Section, Domain } from '../types';

interface HeroProps {
  domain: Domain;
}

const Hero: React.FC<HeroProps> = ({ domain }) => {
  const isTrades = domain === 'skilled-trades';
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Unified video asset for landing page per user request
  const videoSrc = "https://res.cloudinary.com/dvbubqhpp/video/upload/v1774044125/15978611-uhd_3840_2160_30fps_p9gako.mp4";

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.defaultPlaybackRate = 1.0;
    }
  }, []);

  const brandSilver = 'text-brand-silver'; 
  const sectorTint = isTrades ? 'bg-brand-logistics/10' : 'bg-brand-navy/10';

  const content = isTrades ? {
    label: "Certainty Delivered.",
    titleLine1: "Skilled Trades",
    titleLine2: "& Operations",
    p1: "Founded by Managing Director, Steven Franzese, The Certus Group was created in response to “Big Box” style recruitment. With over 15 years of industry and recruitment knowledge, we utilize subject matter experts to implement precise hiring based on specific cultural and motivational requirements.",
    p2: "We strive to eliminate false start hiring while driving revenue growth. At the forefront of our delivery is longevity and quantifiable success through providing candidates with measurable achievement."
  } : {
    label: "Certainty Delivered.",
    titleLine1: "Industrial",
    titleLine2: "Excellence.",
    p1: "Founded by Managing Director, Steven Franzese, The Certus Group was created in response to “Big Box” style recruitment. With over 15 years of industry and recruitment knowledge, we utilize subject matter experts to implement precise hiring based on specific cultural and motivational requirements.",
    p2: "We strive to eliminate false start hiring while driving revenue growth. At the forefront of our delivery is longevity and quantifiable success through providing candidates with measurable achievement."
  };

  return (
    <section id={Section.HERO} className="relative h-[100svh] w-full flex items-center overflow-hidden bg-brand-dark">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video 
          ref={videoRef}
          key={videoSrc}
          autoPlay 
          muted 
          loop 
          playsInline
          preload="auto"
          className="w-full h-full object-cover transition-opacity duration-1000 opacity-40 grayscale-[40%] brightness-[0.8]"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        
        {/* Dynamic Overlay Gradients */}
        <div className={`absolute inset-0 z-10 ${sectorTint} mix-blend-multiply opacity-50`}></div>
        <div className="absolute inset-0 z-20 bg-gradient-to-l from-brand-dark via-brand-dark/20 to-transparent"></div>
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark/40"></div>
        
        {/* Technical Grid Pattern */}
        <div 
            className="absolute inset-0 z-30 pointer-events-none opacity-20"
            style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}
        ></div>
      </div>

      {/* 2. LAYER: LOGO WATERMARK - Bottom Left (Moved to left since content is right) */}
      <img 
        src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png" 
        className="absolute bottom-[-4%] left-[-4%] w-[35vw] max-w-[550px] opacity-[0.06] z-[3] pointer-events-none grayscale select-none"
        style={{ 
          maskImage: 'radial-gradient(circle at bottom left, black 30%, transparent 80%)', 
          WebkitMaskImage: 'radial-gradient(circle at bottom left, black 30%, transparent 80%)' 
        }}
        alt=""
      />

      {/* 3. LAYER: Primary Content Grid */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-8 relative z-20">
        
        <div className="flex flex-col items-start pt-24 md:pt-32 max-w-4xl">
          
          {/* Headline - Now Top Left Aligned */}
          <h1 className="text-[10vw] sm:text-[8vw] md:text-[7vw] lg:text-[8.5rem] font-medium text-white leading-[0.85] md:leading-[0.82] tracking-tighter mb-12 md:mb-16 select-none relative flex flex-col items-start">
              <span className="block animate-[slideUp_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0">
                  {content.titleLine1}
              </span>
              <span className={`block font-serif italic font-light ${brandSilver} animate-[slideUp_1.2s_cubic-bezier(0.16,1,0.3,1)_0.2s_forwards] opacity-0 drop-shadow-lg`}>
                  {content.titleLine2}
              </span>
          </h1>

          {/* About Content - Now Below Headline */}
          <div className="space-y-8 animate-[fadeIn_1.2s_ease-out_0.6s_forwards] opacity-0 max-w-2xl">
             <div className="flex items-center gap-4">
                <div className="w-12 h-[1px] bg-brand-silver"></div>
                <span className="text-brand-silver font-bold tracking-[0.3em] text-[10px] uppercase">{content.label}</span>
             </div>
             <div className="space-y-6">
                <p className="text-gray-300 font-light text-sm md:text-base leading-relaxed text-justify">
                    {content.p1}
                </p>
                <p className="text-gray-400 font-light text-xs md:text-sm leading-relaxed text-justify italic">
                    {content.p2}
                </p>
             </div>
          </div>

        </div>

      </div>

      {/* SECTION DIVIDER */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark to-transparent z-10 pointer-events-none"></div>

      <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(100px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Hero;