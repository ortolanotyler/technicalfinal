import React from 'react';
import { Domain, Section } from '../types';

interface IndustriesServedProps {
  domain: Domain;
}

const IndustriesServed: React.FC<IndustriesServedProps> = ({ domain }) => {
  const tradesCategories = [
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

  const financeITCategories = [
    {
      category: "Financial Leadership",
      description: "Strategic financial management for industrial enterprises and corporations.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
      roles: ["CFO", "VP of Finance", "Controller", "Director of FP&A", "Internal Auditor", "Tax Manager", "Treasury Lead", "Financial Analyst", "Accounting Manager", "Risk Manager", "Compliance Officer", "Strategic Planner"]
    },
    {
      category: "Enterprise Technology",
      description: "Full-stack technology leadership for modern industrial enterprises.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      roles: ["CTO", "VP of Technology", "IT Director", "Software Architect", "Full Stack Developer", "Cloud Architect", "Cybersecurity Lead", "ERP Specialist", "Product Manager", "DevOps Engineer", "Business Analyst", "Project Manager"]
    },
    {
      category: "Industrial Technology",
      description: "Bridging the gap between OT and IT with specialists in industrial automation and networks.",
      image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=800",
      roles: ["Industrial IT Manager", "Automation Engineer", "SCADA Specialist", "MES Engineer", "OT Security Analyst", "Systems Integrator", "Network Architect", "Data Engineer", "IoT Specialist", "Control Systems Lead", "Digital Transformation Lead", "Infrastructure Manager"]
    },
    {
      category: "Operations Leadership",
      description: "Strategic management for manufacturing, logistics, and industrial facilities.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
      roles: ["Director of Operations", "Plant Manager", "Production Manager", "General Manager", "Operations Manager", "Supply Chain Director", "Logistics Manager", "Quality Assurance Lead", "Lean Specialist", "Six Sigma Black Belt", "Facility Manager", "EHS Manager"]
    }
  ];

  const categories = domain === 'skilled-trades' ? tradesCategories : financeITCategories;

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

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="group/card relative min-h-[400px] md:min-h-[450px] overflow-hidden bg-black border border-white/10 rounded-sm transition-all duration-700 hover:border-white/30 flex flex-col"
            >
              {/* Image Layer with reversed transition */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.category}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover/card:scale-110 group-hover/card:opacity-40 group-hover/card:grayscale"
                />
                {/* Darkening overlay on hover */}
                <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/80 transition-all duration-700 z-10"></div>
              </div>

              {/* Corner Graphic Accent */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 border-t border-r border-white/20 group-hover/card:border-brand-silver transition-colors z-20"></div>

              {/* Content Area */}
              <div className="relative flex-grow p-6 md:p-12 flex flex-col justify-end z-20 mt-auto">
                
                {/* Category & Description */}
                <div className="mb-4 md:mb-6 space-y-3 md:space-y-4 transform transition-all duration-700 group-hover/card:-translate-y-2">
                   <h3 className="text-xl md:text-3xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                      {cat.category}
                   </h3>
                   <p className="text-white/0 group-hover/card:text-white/90 text-[10px] md:text-xs leading-relaxed max-w-md transition-all duration-500 opacity-0 group-hover/card:opacity-100 line-clamp-3 md:line-clamp-none">
                      {cat.description}
                   </p>
                </div>

                {/* Role Tags Grid */}
                <div className="pt-4 md:pt-6 border-t border-white/0 group-hover/card:border-white/20 transition-all duration-700 opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0">
                   <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {cat.roles.map((role, rIdx) => (
                        <div 
                          key={rIdx}
                          className="bg-white/10 border border-white/20 px-1.5 py-0.5 md:px-2 md:py-1 text-[7px] md:text-[9px] font-bold uppercase tracking-widest text-white rounded-sm whitespace-nowrap hover:bg-white hover:text-black transition-colors"
                        >
                          {role}
                        </div>
                      ))}
                   </div>
                </div>

              </div>

              {/* Light Sweep Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-brand-silver/5 via-transparent to-white/5"></div>
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