import React, { useState } from 'react';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';

interface EmployersPageProps {
  onViewJobs: () => void;
  onNavigate?: (sectionId: string) => void;
}

const SECTORS = [
  'Skilled Trades & Apprentices',
  'Industrial & Plant Maintenance',
  'Heavy-Duty / 310T Mechanics',
  'Fleet & Transportation',
  'Engineering & Operations',
  'Technical Leadership',
];

const STEPS = [
  'We learn the role and how your team works.',
  'We work our technical network to find qualified candidates.',
  'You get a short, vetted shortlist with our honest read on each person.',
  'We help with the offer and follow up after they start.',
];

const EmployersPage: React.FC<EmployersPageProps> = ({ onViewJobs, onNavigate }) => {
  const [form, setForm] = useState({
    company: '', name: '', email: '', phone: '', role: '', location: '', hires: '', timeline: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const scrollToForm = () => document.getElementById('employer-form')?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.name || !form.email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/employer-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        (window as any).gtag?.('event', 'employer_inquiry', { company: form.company, role: form.role });
        setForm({ company: '', name: '', email: '', phone: '', role: '', location: '', hires: '', timeline: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const label = 'text-[10px] font-bold uppercase tracking-[0.3em] text-brand-silver';
  const inputCls =
    'w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-silver transition-colors text-sm font-light';

  return (
    <div className="min-h-screen font-sans bg-brand-dark text-white selection:bg-brand-silver selection:text-black">
      <SEO
        title="Hire Technical Talent"
        description="Certus Technical Search places vetted skilled trades, industrial maintenance and technical professionals with employers across Canada. Request talent today."
        canonical="https://thecertusgroup.tech/employers"
      />

      <Header onViewJobs={onViewJobs} onNavigate={onNavigate} />

      {/* Hero */}
      <section className="pt-36 md:pt-44 pb-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-px w-12 bg-brand-silver mb-8"></div>
          <p className={`${label} mb-5`}>For Employers</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.05] tracking-tight mb-6">
            Hire skilled technical talent.
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed max-w-xl mb-8">
            We place vetted trades, maintenance and technical professionals with employers across Canada.
            Tell us the role and we bring you a focused shortlist.
          </p>
          <button
            onClick={scrollToForm}
            className="group inline-flex items-center gap-3 bg-brand-silver hover:bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            Request Talent
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Sectors + how it works */}
      <section className="py-14 md:py-16 px-6 lg:px-8 border-t border-white/5 bg-brand-navy/10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <p className={`${label} mb-6`}>Sectors we recruit</p>
            <ul className="space-y-2.5">
              {SECTORS.map((s) => (
                <li key={s} className="text-sm text-gray-200 font-light">{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={`${label} mb-6`}>How it works</p>
            <ol className="space-y-4">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-4 text-sm text-gray-300 font-light leading-relaxed">
                  <span className="text-brand-silver/50 font-bold">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Intake form */}
      <section id="employer-form" className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <p className={`${label} mb-4`}>Request Talent</p>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white mb-3">Tell us about the role.</h2>
          <p className="text-gray-400 font-light text-sm mb-10">We usually reply within one business day.</p>

          {status === 'success' ? (
            <div className="border border-brand-silver/30 bg-brand-silver/5 rounded-sm p-10 text-center">
              <h3 className="text-xl font-light text-white mb-2">Thanks, we have your request.</h3>
              <p className="text-gray-400 font-light text-sm">A Certus specialist will reach out shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <input name="company" value={form.company} onChange={update} required placeholder="Company *" className={inputCls} />
              <input name="name" value={form.name} onChange={update} required placeholder="Your name *" className={inputCls} />
              <input type="email" name="email" value={form.email} onChange={update} required placeholder="Work email *" className={inputCls} />
              <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="Phone" className={inputCls} />
              <input name="role" value={form.role} onChange={update} placeholder="Role to fill" className={inputCls} />
              <input name="location" value={form.location} onChange={update} placeholder="Location" className={inputCls} />
              <input name="hires" value={form.hires} onChange={update} placeholder="Number of hires" className={inputCls} />
              <input name="timeline" value={form.timeline} onChange={update} placeholder="Timeline" className={inputCls} />
              <textarea name="message" value={form.message} onChange={update} placeholder="Anything else we should know?" rows={3} className={`${inputCls} sm:col-span-2 resize-none`} />

              {status === 'error' && (
                <p className="sm:col-span-2 text-red-400 text-sm font-medium">Something went wrong. Please try again or call us.</p>
              )}

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`group inline-flex items-center gap-3 bg-brand-silver hover:bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {status === 'loading' ? 'Sending' : 'Submit Request'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm">
            <a href="tel:+14372951799" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <Phone size={16} className="text-brand-silver" /> (437) 295-1799
            </a>
            <a href="mailto:info@certusgroup.com" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <Mail size={16} className="text-brand-silver" /> info@certusgroup.com
            </a>
          </div>
        </div>
      </section>

      <Footer onNavigate={(id) => onNavigate?.(id)} />
    </div>
  );
};

export default EmployersPage;
