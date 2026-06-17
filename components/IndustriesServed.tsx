import React from 'react';
import { Section } from '../types';

const IndustriesServed: React.FC = () => {
  const categories = [
    {
      category: "Fleet & Transport",
      roles: ["Truck & Transport Mechanics", "Fleet Technicians", "Diesel Mechanics", "Shop Foremen"],
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
    },
    {
      category: "Technical Leadership",
      roles: ["Service Managers", "Shop Foremen", "Operations Directors", "Branch Managers"],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000"
    },
    {
      category: "Heavy Duty Mechanics",
      roles: ["Heavy-Duty Mechanics", "Equipment Technicians", "Hydraulics Specialists", "Field Service Technicians"],
      image: "/practice/heavy-duty-mechanics.jpg"
    },
    {
      category: "Industrial Maintenance",
      roles: ["Millwrights", "Maintenance Technicians", "Industrial Electricians", "Reliability Specialists"],
      image: "/practice/industrial-maintenance.jpg"
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

        <div className="mb-12 md:mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05]">
            Practice areas.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group relative h-24 sm:h-auto sm:aspect-[4/5] overflow-hidden bg-[#151619] border border-white/5 rounded-sm transition-all duration-500 hover:border-brand-silver/40 flex flex-col"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={`${cat.category} recruitment`}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/30"></div>
              </div>

              <div className="relative z-20 px-5 py-4 sm:p-6 flex flex-col h-full justify-end">
                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">
                  {cat.category}
                </h3>
                {/* Roles we recruit for — slide up under the title on hover */}
                <ul className="hidden sm:block mt-2 sm:mt-3 space-y-1 sm:space-y-1.5 max-h-0 opacity-0 overflow-hidden group-hover:max-h-60 group-hover:opacity-100 transition-all duration-500 ease-out">
                  {cat.roles.map((role) => (
                    <li
                      key={role}
                      className="flex items-center gap-2 text-[11px] sm:text-xs text-white/75 font-light tracking-wide"
                    >
                      <span className="w-1 h-1 rounded-full bg-brand-silver flex-shrink-0"></span>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-silver scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-30"></div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default IndustriesServed;
