import React from 'react';
import { Section } from '../types';

// Landing-page intro hero. Sits below the map hero and above the rest of the
// landing flow. Bigger and quieter than the gateway — no CTAs, no video, just
// typography and a faint backdrop.
const Hero: React.FC = () => {
  return (
    <section
      id={Section.HERO}
      className="relative bg-brand-dark border-b border-white/5 py-24 md:py-36 overflow-hidden"
    >
      {/* Subtle dot grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Faint top-left silver glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-silver/[0.04] rounded-full blur-[140px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white tracking-tight leading-[1.05] max-w-4xl">
          Technical and skilled trades search
        </h1>
        <p className="mt-6 md:mt-8 text-[15px] md:text-lg text-white/60 font-light leading-relaxed max-w-3xl">
          Certus Technical Search is part of The Certus Group of Companies Inc. Founded in 2008,
          The Certus Group has been operating in the technical space for over 15 years. Our Technical
          division specializes in connecting licensed and certified professionals with leading
          employers across material handling, manufacturing, transportation, heavy equipment, and
          industrial services. We understand the urgency, compliance requirements, and operational
          demands of technical hiring, and we deliver talent that keeps projects moving and
          businesses running.
        </p>
      </div>
    </section>
  );
};

export default Hero;
