import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import SEO from './SEO';

interface ReferralsPageProps {
  onBack: () => void;
}

// Shop-owner referral intake. Zero friction: nothing is required, the form
// submits even if every field is blank (api/referral.ts emails whatever came in).
const EMPTY = {
  candidateName: '',
  candidatePhone: '',
  candidateTrade: '',
  referrerName: '',
  shopName: '',
  referrerContact: '',
  note: '',
};

const REQUEST_TIMEOUT_MS = 20_000;

const ReferralsPage: React.FC<ReferralsPageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState(EMPTY);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStep('submitting');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStep('success');
        return;
      }
      setErrorMessage('That did not go through. Please try again, or call us at (1 855) 323 7887.');
      setStep('form');
    } catch {
      setErrorMessage('That did not go through. Please try again, or call us at (1 855) 323 7887.');
      setStep('form');
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const sendAnother = () => {
    setFormData((prev) => ({ ...EMPTY, referrerName: prev.referrerName, shopName: prev.shopName, referrerContact: prev.referrerContact }));
    setStep('form');
  };

  return (
    <div className="min-h-screen bg-[#0F151E] text-slate-100 flex flex-col font-sans">
      <SEO
        title="Refer a Candidate"
        description="Shop owners: when a technician or mechanic calls looking for work and you have nothing open, refer them to Certus Technical Search and we will help place them."
        keywords="refer a mechanic, refer a technician, shop owner referral, skilled trades referral, heavy duty mechanic jobs, 310T jobs"
      />
      <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full border border-white/10 group-hover:border-white/30 bg-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">
              Back to site
            </span>
          </button>

        </div>
      </header>

      <main className="flex-grow pt-8 pb-12 md:py-20 px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8 md:mb-10 select-none">
            <img
              src="/CertusLOGO_grey_circle.png"
              className="w-11 h-11 md:w-12 md:h-12 mr-3 opacity-90"
              alt="Certus Technical Search"
            />
            <div className="flex flex-col justify-center">
              <span className="font-sans font-bold text-2xl tracking-tight leading-none text-white">
                CERTUS<span className="text-brand-accent">GROUP</span>
              </span>
              <span className="font-nourd text-[9px] font-bold uppercase tracking-[0.4em] ml-[2px] mt-1.5 text-white/50">
                Technical Search
              </span>
            </div>
          </div>

          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05]">
              Refer a candidate
            </h1>
          </div>

          {step === 'success' ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-10 md:p-14 text-center space-y-8">
              <div className="w-20 h-20 rounded-full bg-brand-silver/10 flex items-center justify-center mx-auto text-brand-silver">
                <Check size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-medium text-white">Thank you.</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={sendAnother}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-brand-dark hover:bg-brand-silver text-[10px] font-bold uppercase tracking-[0.25em] rounded-sm transition-all"
                >
                  Refer someone else
                </button>
                <button
                  onClick={onBack}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/15 hover:border-white text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-sm hover:bg-white/5 transition-all"
                >
                  Return to site
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-8 md:space-y-10">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
                  <p className="text-red-300 text-xs font-medium">{errorMessage}</p>
                </div>
              )}

              <fieldset className="space-y-5">
                <legend className="text-base font-medium text-white mb-4">Who are you referring?</legend>
                <Field label="Their name" htmlFor="candidateName">
                  <input
                    id="candidateName"
                    type="text"
                    name="candidateName"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    autoComplete="off"
                    value={formData.candidateName}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Their phone number" htmlFor="candidatePhone">
                  <input
                    id="candidatePhone"
                    type="tel"
                    inputMode="tel"
                    name="candidatePhone"
                    enterKeyHint="next"
                    autoComplete="off"
                    value={formData.candidatePhone}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </Field>
                <Field label="What they do" htmlFor="candidateTrade" optional>
                  <input
                    id="candidateTrade"
                    type="text"
                    name="candidateTrade"
                    enterKeyHint="next"
                    value={formData.candidateTrade}
                    onChange={handleInputChange}
                    className={inputClasses}
                    placeholder="e.g. 310T mechanic, welder"
                  />
                </Field>
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="text-base font-medium text-white mb-4">About you</legend>
                <Field label="Your name" htmlFor="referrerName" optional>
                  <input
                    id="referrerName"
                    type="text"
                    name="referrerName"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    autoComplete="name"
                    value={formData.referrerName}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Shop name" htmlFor="shopName" optional>
                  <input
                    id="shopName"
                    type="text"
                    name="shopName"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    autoComplete="organization"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </Field>
                <Field label="Your phone or email" htmlFor="referrerContact" optional>
                  <input
                    id="referrerContact"
                    type="text"
                    name="referrerContact"
                    enterKeyHint="next"
                    autoComplete="tel"
                    value={formData.referrerContact}
                    onChange={handleInputChange}
                    className={inputClasses}
                  />
                </Field>
              </fieldset>

              <Field label="Anything else" htmlFor="note" optional>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className={`${inputClasses} resize-none`}
                />
              </Field>

              <button
                type="submit"
                disabled={step === 'submitting'}
                className="w-full bg-white text-brand-dark hover:bg-brand-silver disabled:opacity-50 disabled:cursor-not-allowed py-5 font-bold uppercase tracking-[0.2em] text-xs rounded-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
              >
                {step === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send referral
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

// text-base (16px) on inputs prevents iOS Safari from auto-zooming on focus.
const inputClasses =
  'w-full bg-brand-dark border border-white/10 rounded-sm px-4 py-4 text-white text-base placeholder-gray-600 focus:outline-none focus:border-brand-silver/60 transition-colors';

const Field: React.FC<{
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}> = ({ label, htmlFor, optional, children }) => (
  <div className="space-y-2">
    <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      {optional && <span className="text-[11px] text-white/40 font-light">Optional</span>}
    </label>
    {children}
  </div>
);

export default ReferralsPage;
