import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Check, Linkedin, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import SEO from './SEO';

interface SubmitResumePageProps {
  onBack: () => void;
}

// Mirrors the sector language used on this site's own gateway panels
// (Fleet & Transport / Technical Leadership / Heavy Duty Mechanics /
// Industrial Maintenance) so the options here are the same vocabulary a
// candidate has already seen, not a generic borrowed list.
const INTEREST_OPTIONS = [
  'Fleet & Transport',
  'Technical Leadership',
  'Heavy Duty Mechanics',
  'Industrial Maintenance',
] as const;

// Same cap as the per-job ApplicationModal's upload token route (api/upload.ts).
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILE_LABEL = '8MB';
const REQUEST_TIMEOUT_MS = 30_000;

const SubmitResumePage: React.FC<SubmitResumePageProps> = ({ onBack }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: '',
    note: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage(`Resume must be ${MAX_FILE_LABEL} or smaller.`);
      setResumeFile(null);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setErrorMessage('');
    setResumeFile(file);
    setFileName(file.name);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStep('submitting');

    let resumeUrl: string | undefined;
    if (resumeFile) {
      try {
        const blob = await upload(resumeFile.name, resumeFile, {
          access: 'private',
          handleUploadUrl: '/api/upload',
          contentType: resumeFile.type || undefined,
        });
        resumeUrl = blob.url;
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? `Resume upload failed: ${err.message}`
            : 'Resume upload failed. Please try again.'
        );
        setStep('error');
        return;
      }
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // No jobTitle/jobRef — api/apply.ts treats that as a general pipeline
      // submission (not tied to a specific posting) and adjusts the email
      // accordingly.
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          linkedin: formData.linkedin,
          interests,
          note: formData.note,
          resumeUrl,
          resumeName: fileName,
        }),
      });

      if (response.ok) {
        setStep('success');
        return;
      }

      let detail = `Server returned ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error) detail = data.error;
      } catch {
        // ignore non-JSON body
      }
      setErrorMessage(detail);
      setStep('error');
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      setErrorMessage(
        isAbort
          ? 'Request timed out. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Network error. Please try again.'
      );
      setStep('error');
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F151E] text-slate-100 flex flex-col font-sans">
      <SEO
        title="Submit your resume"
        description="Join the Certus Technical Search pipeline for skilled trades, industrial maintenance, fleet and technical roles across Canada."
        keywords="submit resume, technical recruitment pipeline, skilled trades jobs, industrial maintenance jobs, fleet technician jobs"
      />
      <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
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

          <button
            onClick={onBack}
            className="flex items-center gap-3 select-none group"
          >
            <img
              src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png"
              className="w-6 h-6 opacity-90"
              alt="Certus Logo"
              referrerPolicy="no-referrer"
            />
            <span className="font-sans font-bold text-xl tracking-tight leading-none text-white">
              CERTUSGROUP
            </span>
          </button>
        </div>
      </header>

      <main className="flex-grow py-16 md:py-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05]">
              Submit your resume
            </h1>
          </div>

          {step === 'success' ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-10 md:p-16 text-center space-y-8">
              <div className="w-20 h-20 rounded-full bg-brand-silver/10 flex items-center justify-center mx-auto text-brand-silver">
                <Check size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-medium text-white">Received.</h2>
                <p className="text-gray-400 font-light text-sm max-w-md mx-auto leading-relaxed">
                  Someone will be in touch if a matching mandate opens.
                </p>
              </div>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-3 px-8 py-4 border border-white/15 hover:border-white text-white text-[10px] font-bold uppercase tracking-[0.25em] rounded-sm hover:bg-white/5 transition-all"
              >
                Return to site
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {(step === 'error' || errorMessage) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3">
                  <p className="text-red-300 text-xs font-medium">{errorMessage || 'Something went wrong.'}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="First name" required>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={inputClasses}
                    placeholder="Jane"
                  />
                </Field>
                <Field label="Last name" required>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={inputClasses}
                    placeholder="Doe"
                  />
                </Field>
              </div>

              <Field label="Email" required>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                  placeholder="jane.doe@example.com"
                />
              </Field>

              <Field label="LinkedIn URL">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Linkedin size={16} className="text-gray-600" />
                  </div>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className={`${inputClasses} pl-12`}
                    placeholder="linkedin.com/in/..."
                  />
                </div>
              </Field>

              <Field label="Areas of interest" hint="Select all that apply">
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => {
                    const selected = interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleInterest(opt)}
                        className={`px-4 py-3 min-h-[44px] rounded-sm text-xs font-bold uppercase tracking-[0.15em] border transition-all duration-200 ${
                          selected
                            ? 'bg-brand-silver text-brand-dark border-brand-silver'
                            : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Brief note" hint="Optional">
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  placeholder="Currently a 310T technician at a dealership group, open to a shop closer to home..."
                />
              </Field>

              <Field label="Resume">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed border-white/20 rounded-sm p-8 text-center cursor-pointer hover:bg-white/[0.02] hover:border-white/40 transition-all duration-300 ${fileName ? 'border-green-500/30 bg-green-500/5' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {fileName ? (
                    <div className="flex flex-col items-center gap-2 text-green-400">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Check size={20} />
                      </div>
                      <span className="text-sm font-medium">{fileName}</span>
                      <span className="text-[10px] uppercase text-green-500/50">Ready to upload</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-500">
                        <Upload size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 font-medium">Click to upload resume</p>
                        <p className="text-[10px] text-gray-600 uppercase mt-1">PDF or Word (Max {MAX_FILE_LABEL})</p>
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              <button
                type="submit"
                disabled={step === 'submitting'}
                className="w-full bg-white text-brand-dark hover:bg-brand-silver disabled:opacity-50 disabled:cursor-not-allowed py-4 font-bold uppercase tracking-[0.2em] text-xs rounded-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
              >
                {step === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit to pipeline
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-white/50 font-light tracking-[0.2em] uppercase">
                Confidentiality guaranteed
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

// text-base (16px) on inputs prevents iOS Safari from auto-zooming when a
// field is focused.
const inputClasses =
  'w-full bg-brand-dark border border-white/10 rounded-sm px-4 py-3 text-white text-base md:text-sm placeholder-gray-700 focus:outline-none focus:border-brand-silver/60 transition-colors';

const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between gap-3">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.25em]">
        {label}
        {required && <span className="text-brand-silver ml-1">*</span>}
      </label>
      {hint && <span className="text-[10px] text-white/50 font-light">{hint}</span>}
    </div>
    {children}
  </div>
);

export default SubmitResumePage;
