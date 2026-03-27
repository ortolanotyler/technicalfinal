import React from 'react';
import { Section } from '../types';

const IndustriesServed: React.FC = () => {
  const categories = [
    {
      category: "Fleet & Transport",
      description: "Keeping the logistics backbone moving with elite truck and transport mechanics. We specialize in sourcing highly skilled technicians for heavy-duty fleet operations, ensuring maximum uptime and operational safety across North American transport networks.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=60&w=600"
    },
    {
      category: "Technical Leadership",
      description: "Placing the management talent that drives operational efficiency in industrial shops. From Service Managers to Operations Directors, we identify leaders with the technical depth and strategic vision to optimize shop performance and team productivity.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=60&w=600"
    },
    {
      category: "Heavy Duty Mechanics",
      description: "Specialized recruitment for off-road, mining, and heavy construction equipment specialists. We connect top-tier HD mechanics with industry-leading firms, focusing on expertise in hydraulics, engine diagnostics, and complex component rebuilding.",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=60&w=600"
    },
    {
      category: "Industrial Maintenance",
      description: "Certified experts for plant maintenance, shutdowns, and industrial commissioning. We deliver specialized talent that ensures the reliability and safety of critical industrial infrastructure through precise preventative maintenance.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=60&w=600"
    }
  ];

  return (
    <section id={Section.INDUSTRIES} className="relative py-36 bg-brand-dark overflow-hidden font-sans">
      
      {/* Cinematic Background Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), 
                            linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header - Minimal & Sharp */}
        <div className="mb-12 md:mb-20">
           <h2 className="text-4xl md:text-7xl font-medium text-white tracking-tighter">
             Practice <span className="text-brand-silver italic font-serif font-light">Sectors</span>
           </h2>
        </div>

        {/* Refined Grid Layout - 4 Columns on desktop for better density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="group relative aspect-[2/3] overflow-hidden bg-[#151619] border border-white/5 rounded-xl transition-all duration-500 hover:border-brand-silver/40 flex flex-col shadow-elegant"
            >
              {/* Background Image with vibrant color reveal */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={cat.image} 
                  alt={`${cat.category} Recruitment Services - Certus Technical Search`}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                />
                {/* Gradient Overlay - Dramatic reveal with legibility protection */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent transition-all duration-700 group-hover:from-brand-dark group-hover:via-brand-dark/80 group-hover:to-brand-dark/20"></div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/10 group-hover:border-brand-silver/40 transition-all z-20"></div>

              {/* Content Area */}
              <div className="relative z-20 mt-auto p-6 md:p-8 flex flex-col h-full justify-end">
                
                {/* Title & Description */}
                <div className="space-y-4 transform transition-all duration-500 group-hover:-translate-y-2">
                   <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
                      {cat.category}
                   </h3>
                   <p className="text-xs md:text-[13px] text-white/90 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 drop-shadow-lg font-light">
                      {cat.description}
                   </p>
                </div>

              </div>

              {/* Subtle Glow Sweep */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-brand-silver/10 via-transparent to-white/5"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Page Coord */}
      <div className="absolute bottom-6 right-8 opacity-10 font-mono text-[8px] tracking-[1em] text-white uppercase pointer-events-none">
        SECT_INDEX: TR_4.0
      </div>
    </section>
  );
};

export default IndustriesServed;