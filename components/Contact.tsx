import React, { useEffect, useRef, useState } from 'react';
import { Section } from '../types';
import { Building2, Phone, Mail, ArrowRight, Loader2, type LucideIcon } from 'lucide-react';

type InquiryType = 'hiring' | 'candidate' | 'other';

const INQUIRY_OPTIONS: Array<{ key: InquiryType; label: string; sub: string }> = [
  { key: 'hiring', label: 'I am hiring', sub: 'Start a search' },
  { key: 'candidate', label: 'I am exploring roles', sub: 'Reach the team' },
  { key: 'other', label: 'Something else', sub: 'Press, partnerships, etc.' },
];

// Background photo for the contact section. Heavily dimmed via overlay.
const BG_IMAGE =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1781293969/IMG_5018-edit-1024x683_gwedcu.jpg';

const Contact: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType>('hiring');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setStatus('loading');
    setErrorMessage('');

    const inquiryLabel = INQUIRY_OPTIONS.find((o) => o.key === inquiryType)?.label || inquiryType;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          inquiryType: inquiryLabel,
          message: message || '(no message)',
        }),
      });

      if (response.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setCompany('');
        setMessage('');
        setInquiryType('hiring');
      } else {
        let detail = `Server returned ${response.status}`;
        try {
          const data = await response.json();
          if (data?.error) detail = data.error;
        } catch {
          // ignore
        }
        setErrorMessage(detail);
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Network error');
      setStatus('error');
    }
  };

  return (
    <section
      id={Section.CONTACT}
      ref={sectionRef}
      className="relative bg-brand-dark overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={BG_IMAGE}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-top opacity-25 grayscale-[40%]"
        />
        <div className="absolute inset-0 bg-brand-dark/70"></div>
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT - Glass card */}
          <aside
            className={`lg:col-span-5 lg:order-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-sm p-8 md:p-10 lg:p-12 flex flex-col gap-10 shadow-2xl">
              {/* Brand block */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png"
                    className="w-9 h-9 opacity-90"
                    alt="Certus Logo"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-white">
                    CERTUS<span className="text-white/60">GROUP</span>
                  </span>
                </div>
                <span className="text-white/40 text-[10px] uppercase tracking-[0.4em] font-bold ml-[48px]">
                  Technical Search
                </span>
              </div>

              {/* Contact rows */}
              <div className="space-y-6">
                <ContactRow icon={Building2} label="Headquarters">
                  74 Jutland Road, Unit 38
                  <br />
                  Toronto, ON · M8Z 0G7
                </ContactRow>

                <ContactRow icon={Phone} label="Direct line">
                  <a href="tel:+18553237887" className="hover:text-white transition-colors">
                    (1 855) 323 7887
                  </a>
                </ContactRow>

                <ContactRow icon={Mail} label="Inquiries">
                  <a
                    href="mailto:info@certusgroup.com"
                    className="hover:text-white transition-colors"
                  >
                    info@certusgroup.com
                  </a>
                </ContactRow>
              </div>

            </div>
          </aside>

          {/* RIGHT - Headline + form */}
          <div
            className={`lg:col-span-7 lg:order-1 transition-all duration-1000 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.05] mb-10">
              Get in touch
            </h2>

            <form onSubmit={handleSubmit} className="space-y-7">
              <Field label="I am…" required>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {INQUIRY_OPTIONS.map((opt) => {
                    const selected = inquiryType === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setInquiryType(opt.key)}
                        className={`text-left p-4 rounded-sm border backdrop-blur-md transition-all duration-200 ${
                          selected
                            ? 'border-brand-silver bg-brand-silver/15'
                            : 'border-white/15 hover:border-white/40 bg-white/[0.03]'
                        }`}
                      >
                        <div className={`text-sm font-medium transition-colors ${selected ? 'text-white' : 'text-white/80'}`}>
                          {opt.label}
                        </div>
                        <div className={`text-[10px] uppercase tracking-[0.2em] mt-1 transition-colors ${selected ? 'text-brand-silver' : 'text-white/50'}`}>
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UnderlineField label="Name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={underlineInputClasses}
                    placeholder="Jane Doe"
                  />
                </UnderlineField>
                <UnderlineField label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={underlineInputClasses}
                    placeholder="jane.doe@example.com"
                  />
                </UnderlineField>
              </div>

              <UnderlineField label="Company" hint="Optional">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={underlineInputClasses}
                  placeholder="Acme Industries"
                />
              </UnderlineField>

              <UnderlineField
                label="Message"
                hint={inquiryType === 'hiring' ? 'Role, location, timing' : 'Optional'}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className={`${underlineInputClasses} resize-none`}
                  placeholder={
                    inquiryType === 'hiring'
                      ? "We're hiring a licensed 310T technician in Brampton, ideally starting next month..."
                      : inquiryType === 'candidate'
                        ? "I'm a licensed 310S technician looking for a road service role in the GTA..."
                        : 'How can we help?'
                  }
                />
              </UnderlineField>

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
                  <p className="text-red-300 text-xs font-medium">
                    {errorMessage || 'Something went wrong. Please try again.'}
                  </p>
                </div>
              )}
              {status === 'success' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-sm px-4 py-3">
                  <p className="text-emerald-300 text-xs font-medium">
                    Thanks. We&rsquo;ll respond within one business day.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand-steel hover:bg-white text-white hover:text-brand-dark disabled:opacity-50 disabled:cursor-not-allowed py-4 font-bold uppercase tracking-[0.25em] text-xs rounded-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3 mt-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Request callback
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-white/50 font-light tracking-[0.2em] uppercase">
                Confidentiality guaranteed
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// 16px on mobile to prevent iOS auto-zoom on focus.
const underlineInputClasses =
  'w-full bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-white text-base md:text-base placeholder-white/30 focus:outline-none focus:border-brand-silver transition-colors';

const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div className="space-y-3">
    <div className="flex items-baseline justify-between gap-3">
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em]">
        {label}
        {required && <span className="text-brand-silver ml-1">*</span>}
      </label>
      {hint && <span className="text-[10px] text-white/40 font-light">{hint}</span>}
    </div>
    {children}
  </div>
);

const UnderlineField: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div className="space-y-1">
    <div className="flex items-baseline justify-between gap-3">
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-[0.25em]">
        {label}
        {required && <span className="text-brand-silver ml-1">*</span>}
      </label>
      {hint && <span className="text-[10px] text-white/40 font-light">{hint}</span>}
    </div>
    {children}
  </div>
);

const ContactRow: React.FC<{
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}> = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-4">
    <div className="w-11 h-11 rounded-sm bg-brand-steel/40 border border-white/10 flex items-center justify-center text-brand-silver flex-shrink-0">
      <Icon size={16} strokeWidth={1.5} />
    </div>
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 mb-1.5">
        {label}
      </div>
      <div className="text-sm text-white/70 font-light leading-relaxed">{children}</div>
    </div>
  </div>
);

export default Contact;
