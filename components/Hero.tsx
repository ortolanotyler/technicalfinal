import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Section } from '../types';

// Same 15-minute booking the group gateway and the logistics site use, so a
// visitor meets one consistent way in. hide_gdpr_banner drops Calendly's
// cookie bar; the colour params stop the hand-off from jarring.
const BOOKING_URL =
  'https://calendly.com/tyler-certusgroup/the-certus-group' +
  '?hide_gdpr_banner=1&background_color=0E141E&text_color=ffffff&primary_color=9fa8b5';

// Landing-page intro hero. Sits below the map hero and above the rest of the
// landing flow. Quieter than the gateway: typography and a faint backdrop,
// plus the one booking CTA under the intro copy.
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

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex h-14 items-center justify-center gap-3 bg-white px-8 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-dark transition-transform duration-200 active:scale-[0.98] md:mt-10 md:text-[12px] md:tracking-[0.3em]"
        >
          Book a call
          <ArrowRight
            strokeWidth={2}
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>
    </section>
  );
};

export default Hero;
