import React, { useState } from 'react';
import { Section } from '../types';
import { ArrowRight, Phone, Mail, Target, ShieldCheck, Clock, Users } from 'lucide-react';
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
  { icon: Target, title: 'Discovery', body: 'We learn your operation, the role, and what "the right fit" actually means for your team.' },
  { icon: Users, title: 'Targeted Search', body: 'We tap our specialized technical network — not job-board spray — to surface qualified, vetted candidates.' },
  { icon: ShieldCheck, title: 'Vetting & Shortlist', body: 'You receive a focused shortlist of pre-screened candidates, with our honest read on each.' },
  { icon: Clock, title: 'Placement & Follow-up', body: 'We support the offer, onboarding, and check in after placement to make sure it sticks.' },
];

const VALUE_PROPS = [
  { title: 'Technical specialization', body: 'We recruit skilled trades and industrial talent every day — we speak the language of the floor, not generic staffing.' },
  { title: 'Vetted, not just sourced', body: 'Every candidate is screened for credentials, experience, and fit before they reach your desk.' },
  { title: 'Built on relationships', body: 'A deep, active network across Canadian industry means faster access to people who are not on the open market.' },
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
        // GA4 conversion
        (window as any).gtag?.('event', 'employer_inquiry', { company: form.company, role: form.role });
        setForm({ company: '', name: '', email: '', phone: '', role: '', location: '', hires: '', timeline: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputCls =
    'w-full bg-transparent border-b border-white/20 px-0 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-silver transition-colors text-sm font-light';

  return (
    <div className="min-h-screen font-sans bg-brand-dark text-white selection:bg-brand-silver selection:text-black">
      <SEO
        title="Hire Technical Talent"
        description="Certus Technical Search helps employers hire vetted skilled trades, industrial maintenance, and technical professionals across Canada. Request talent today."
        canonical="https://thecertusgroup.tech/employers"
      />

      <Header onViewJobs={onViewJobs} onNavigate={onNavigate} />

      {/* Hero */}
      <section className="relative pt-36 md:pt-48 pb-20 md:pb-28 px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-silver/[0.03] -skew-x-12 translate-x-1/2 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="h-px w-12 bg-brand-silver mb-8"></div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-brand-silver mb-5">For Employers</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal leading-[0.95] tracking-tighter mb-8">
            Hire technical talent,<br />
            <span className="font-serif italic font-light text-brand-silver">without the guesswork.</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-10">
            Certus Technical Search places vetted skilled trades, industrial maintenance, and technical
            professionals with leading Canadian employers. Tell us what you need — we'll bring you a focused
            shortlist of people who can actually do the job.
          </p>
          <button
            onClick={scrollToForm}
            className="group inline-flex items-center gap-3 bg-brand-silver hover:bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            Request Talent
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5 bg-brand-navy/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 md:gap-12">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="space-y-3">
              <div className="h-px w-8 bg-brand-silver/60"></div>
              <h3 className="text-lg font-bold text-white">{v.title}</h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white mb-10">Where we specialize</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
            {SECTORS.map((s) => (
              <div key={s} className="bg-brand-dark p-6 hover:bg-brand-navy/30 transition-colors">
                <span className="text-sm font-medium text-gray-200">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5 bg-brand-navy/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white mb-12">How we work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm border border-white/10 flex items-center justify-center text-brand-silver">
                    <step.icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold text-white/30 tracking-widest">0{i + 1}</span>
                </div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intake form */}
      <section id="employer-form" className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="h-px w-12 bg-brand-silver mb-8"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">Request talent</h2>
          <p className="text-gray-400 font-light mb-10 max-w-xl">
            Tell us about the role(s). We typically respond within one business day.
          </p>

          {status === 'success' ? (
            <div className="border border-brand-silver/30 bg-brand-silver/5 rounded-sm p-10 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Thank you — we've received your request.</h3>
              <p className="text-gray-400 font-light">A Certus specialist will reach out shortly to discuss your hiring needs.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
              <input name="company" value={form.company} onChange={update} required placeholder="Company *" className={inputCls} />
              <input name="name" value={form.name} onChange={update} required placeholder="Your name *" className={inputCls} />
              <input type="email" name="email" value={form.email} onChange={update} required placeholder="Work email *" className={inputCls} />
              <input type="tel" name="phone" value={form.phone} onChange={update} placeholder="Phone" className={inputCls} />
              <input name="role" value={form.role} onChange={update} placeholder="Role(s) to fill" className={inputCls} />
              <input name="location" value={form.location} onChange={update} placeholder="Location" className={inputCls} />
              <input name="hires" value={form.hires} onChange={update} placeholder="Number of hires" className={inputCls} />
              <input name="timeline" value={form.timeline} onChange={update} placeholder="Timeline (e.g. ASAP, 30 days)" className={inputCls} />
              <textarea name="message" value={form.message} onChange={update} placeholder="Anything else we should know?" rows={3} className={`${inputCls} sm:col-span-2 resize-none`} />

              {status === 'error' && (
                <p className="sm:col-span-2 text-red-400 text-sm font-medium">Something went wrong. Please try again or call us directly.</p>
              )}

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`group inline-flex items-center gap-3 bg-brand-silver hover:bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                >
                  {status === 'loading' ? 'Sending…' : 'Submit Request'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* Direct contact */}
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
