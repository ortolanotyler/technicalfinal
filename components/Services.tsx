
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Section, Domain } from '../types';

interface ServicesProps {
    domain?: Domain;
}

const Services: React.FC<ServicesProps> = ({ domain }) => {
  const isTrades = domain === 'skilled-trades';

  // Dynamic Theme Configuration
  const theme = {
    // Top is solid to blend with About, bottom is transparent to reveal video
    bg: isTrades 
        ? 'bg-gradient-to-b from-[#0F151E] via-[#0F151E] to-transparent' 
        : 'bg-gradient-to-b from-[#0F151E] via-[#0F151E] to-transparent',
    subheading: 'text-brand-silver',
    bar: 'bg-brand-steel',
    accent: 'text-brand-silver',
    borderHover: 'group-hover:border-brand-steel/50',
    bgAccent: isTrades ? 'bg-brand-logistics' : 'bg-brand-navy',
    buttonHover: 'group-hover:bg-brand-steel group-hover:border-brand-steel',
  };

  // Content Data...
  const tradesExpertise = [
    {
      title: "Heavy Duty Mechanics",
      description: "Elite specialists for off-road, mining, and heavy construction equipment maintenance.",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Industrial Electricians",
      description: "Certified experts for plant-wide electrical systems, instrumentation, and control wiring.",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Millwrights",
      description: "Precision mechanical specialists for industrial machinery installation and maintenance.",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Fleet Management",
      description: "Leadership for large-scale transport fleets, focusing on maintenance and ops efficiency.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600"
    }
  ];

  const operationsITExpertise = [
    {
      title: "Operations Leadership",
      description: "Strategic directors and managers for manufacturing, logistics, and industrial facilities.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Industrial Technology",
      description: "Bridging the gap between OT and IT with specialists in SCADA, MES, and industrial networks.",
      image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Supply Chain & Logistics",
      description: "Optimizing the flow of materials and goods with data-driven leadership and systems.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600"
    },
    {
      title: "Enterprise IT",
      description: "Full-stack technology leadership for modern industrial enterprises and digital transformation.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600"
    }
  ];

  const expertise = isTrades ? tradesExpertise : operationsITExpertise;
  const subHeading = isTrades 
    ? "Elite talent for the industrial shop floor." 
    : "Strategic leadership for the modern industrial enterprise.";

  return (
    <section id={Section.SERVICES} className={`relative py-32 text-slate-100 overflow-hidden transition-colors duration-1000`}>
      
      {/* 1. SECTOR COLOR LAYER - Transitioning from solid top to transparent bottom */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${theme.bg}`}></div>

      {/* 2. SOFT GLASS EFFECT - Only active where color is present */}
      <div className="absolute inset-x-0 top-0 h-full z-0 backdrop-blur-sm pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
          <div className="max-w-4xl">
             <div className="inline-flex items-center gap-4 mb-6">
               <span className={`h-px w-12 ${theme.bar}`}></span>
               <span className={`font-sans font-bold tracking-[0.2em] text-xs uppercase ${theme.subheading}`}>Our Expertise</span>
             </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-[0.95] tracking-tight text-balance">
               {subHeading}
            </h2>
          </div>
        </div>

        {/* Cinematic Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {expertise.map((item, index) => (
            <div 
              key={index} 
              className={`
                group relative h-[500px] border border-white/10 rounded-sm overflow-hidden 
                transition-all duration-500 ease-out hover:-translate-y-2
                ${theme.borderHover}
              `}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  {/* Heavy Overlay for Text Readability */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500`}></div>
                  {/* Color Tint on Hover */}
                  <div className={`absolute inset-0 mix-blend-overlay ${theme.bgAccent} opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
              </div>

              {/* Content Layer */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                  
                  {/* Main Text */}
                  <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                      <div className={`w-12 h-1 mb-6 transition-all duration-500 ${theme.bar} w-0 group-hover:w-12 opacity-0 group-hover:opacity-100`}></div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4 leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm leading-relaxed font-light opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        {item.description}
                      </p>
                  </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
