import React from 'react';
import { Section } from '../types';

const IndustriesServed: React.FC = () => {
  const categories = [
    {
      category: "Fleet & Transport",
      description: "Keeping the logistics backbone moving with elite truck and transport mechanics.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
      roles: ["Truck Mechanic", "Fleet Manager", "Trailer Tech", "Service Advisor", "Parts Manager", "Diagnostic Specialist", "Reefer Technician", "Alignment Specialist", "Shop Lead", "Warranty Administrator", "Tire Technician", "Fuel Systems Tech"]
    },
    {
      category: "Shop Leadership",
      description: "Placing the management talent that drives operational efficiency in industrial shops.",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800",
      roles: ["Service Manager", "Operations Director", "Branch Manager", "Fixed Ops Director", "Regional Manager", "General Manager", "Service Director", "Production Manager", "Quality Control Lead", "Safety Manager", "Inventory Controller", "HR Business Partner"]
    },
    {
      category: "Heavy Duty Mechanics",
      description: "Specialized recruitment for off-road, mining, and heavy construction equipment specialists.",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
      roles: ["HD Mechanic", "Field Service Tech", "Shop Foreman", "Master Technician", "Hydraulic Specialist", "Engine Rebuilder", "Component Rebuilder", "Lube Technician", "Service Coordinator", "Diagnostic Lead", "Track Specialist", "Undercarriage Tech"]
    },
    {
      category: "Industrial Maintenance",
      description: "Certified experts for plant maintenance, shutdowns, and industrial commissioning.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
      roles: ["Millwright", "Industrial Electrician", "Maintenance Manager", "PLC Technician", "Reliability Tech", "Safety Coordinator", "Conveyor Specialist", "Machinist", "Welder/Fabricator", "Instrumentation Tech", "Pipefitter", "Rigging Specialist"]
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
              className="group relative aspect-[3/4] overflow-hidden bg-[#151619] border border-white/5 rounded-xl transition-all duration-500 hover:border-brand-silver/40 flex flex-col shadow-elegant"
            >
              {/* Background Image with subtle zoom */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={cat.image} 
                  alt={cat.category}
                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-30 group-hover:scale-110 transition-all duration-1000 ease-out"
                />
                {/* Gradient Overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-transparent transition-all duration-500 group-hover:via-brand-dark/80"></div>
              </div>

              {/* Technical Index Number */}
              <div className="absolute top-6 left-6 font-mono text-[10px] tracking-widest text-brand-silver/30 group-hover:text-brand-silver transition-colors z-20">
                SEC_0{idx + 1}
              </div>

              {/* Corner Accent */}
              <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/10 group-hover:border-brand-silver/40 transition-all z-20"></div>

              {/* Content Area */}
              <div className="relative z-20 mt-auto p-6 md:p-8 flex flex-col h-full justify-end overflow-hidden">
                
                {/* Title & Description */}
                <div className="space-y-3 transform transition-all duration-500 group-hover:-translate-y-4">
                   <h3 className="text-2xl font-bold text-white leading-tight tracking-tight drop-shadow-2xl">
                      {cat.category}
                   </h3>
                   <p className="text-[11px] text-white/70 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {cat.description}
                   </p>
                </div>

                {/* Role Tags - Revealed on hover with a slide-up effect */}
                <div className="mt-0 max-h-0 group-hover:max-h-[300px] opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out overflow-y-auto scrollbar-hide">
                   <div className="pt-4 border-t border-white/10 mt-4">
                      <div className="flex flex-wrap gap-1.5 pb-4">
                         {cat.roles.map((role, rIdx) => (
                           <span 
                             key={rIdx}
                             className="bg-white/5 border border-white/10 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-brand-silver/90 rounded-sm whitespace-nowrap hover:bg-brand-silver hover:text-brand-dark transition-colors duration-300"
                           >
                             {role}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>

              </div>

              {/* Subtle Glow Sweep */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-brand-silver/5 via-transparent to-white/5"></div>
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