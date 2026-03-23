
import React, { useState, useRef, useEffect } from 'react';
import { JobPosting } from '../types';
import { X, Upload, Check, Loader2, Linkedin } from 'lucide-react';

interface ApplicationModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({ job, isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success' | 'error'>('form');
  const [fileName, setFileName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    linkedin: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setStep('form');
        setFileName(null);
        setFormData({ firstName: '', lastName: '', email: '', linkedin: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Theme Config - Monochrome Brand
  const theme = {
    accent: 'text-brand-silver',
    borderFocus: 'focus:border-brand-silver',
    button: 'bg-brand-silver hover:bg-white text-black',
    icon: 'text-brand-silver',
    ring: 'focus:ring-brand-silver/20',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          jobTitle: job.title,
          jobRef: job.ref
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        setStep('error');
      }
    } catch (error) {
      console.error('Application error:', error);
      setStep('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-brand-dark border border-white/10 rounded-sm shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/10 bg-white/[0.02]">
           <div>
             <h3 className="text-xl font-bold text-white tracking-tight">Application</h3>
             <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 font-mono">REF: {job.ref}</p>
           </div>
           <button 
             onClick={onClose} 
             className="text-gray-500 hover:text-white transition-colors p-2 -mr-2 rounded-sm hover:bg-white/5"
           >
             <X size={20} />
           </button>
        </div>

        <div className="p-8 bg-brand-navy/30">
           {(step === 'form' || step === 'error') && (
             <form onSubmit={handleSubmit} className="space-y-6">
                {step === 'error' && (
                  <p className="text-red-400 text-xs font-medium text-center">Something went wrong. Please try again.</p>
                )}
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required 
                        className={`w-full bg-brand-dark border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none transition-all ${theme.borderFocus} focus:border-opacity-50 placeholder-gray-700`}
                        placeholder="Jane" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required 
                        className={`w-full bg-brand-dark border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none transition-all ${theme.borderFocus} focus:border-opacity-50 placeholder-gray-700`} 
                        placeholder="Doe"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     required 
                     className={`w-full bg-brand-dark border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none transition-all ${theme.borderFocus} focus:border-opacity-50 placeholder-gray-700`}
                     placeholder="jane.doe@example.com"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profile URL</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Linkedin size={18} className="text-gray-600 group-focus-within:text-gray-400 transition-colors" />
                     </div>
                     <input 
                       type="url" 
                       name="linkedin"
                       value={formData.linkedin}
                       onChange={handleInputChange}
                       placeholder="linkedin.com/in/..." 
                       className={`w-full bg-brand-dark border border-white/10 rounded-sm pl-12 pr-4 py-3 text-white text-sm focus:outline-none transition-all ${theme.borderFocus} focus:border-opacity-50 placeholder-gray-700`} 
                     />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resume / CV</label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border border-dashed border-white/20 rounded-sm p-8 text-center cursor-pointer hover:bg-white/[0.02] hover:border-white/40 transition-all duration-300 group relative overflow-hidden ${fileName ? 'border-green-500/30 bg-green-500/5' : ''}`}
                   >
                      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                      
                      {/* Hover Flash Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                      {fileName ? (
                         <div className="flex flex-col items-center justify-center gap-2 text-green-400 animate-[fadeIn_0.3s_ease-out]">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-1">
                                <Check size={20} />
                            </div>
                            <span className="text-sm font-medium">{fileName}</span>
                            <span className="text-[10px] uppercase text-green-500/50">Ready to upload</span>
                         </div>
                      ) : (
                         <div className="space-y-3">
                            <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-500 group-hover:text-white transition-colors`}>
                                <Upload size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-300 font-medium">Click to upload resume</p>
                                <p className="text-[10px] text-gray-600 uppercase mt-1">PDF or Word (Max 5MB)</p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>

                <div className="pt-4">
                   <button 
                     type="submit" 
                     className={`w-full py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-300 shadow-lg hover:-translate-y-1 ${theme.button}`}
                   >
                      Submit Application
                   </button>
                </div>
             </form>
           )}

           {step === 'submitting' && (
             <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                    <Loader2 size={48} className={`animate-spin ${theme.icon}`} strokeWidth={1.5} />
                    <div className={`absolute inset-0 blur-xl opacity-50 ${theme.icon} animate-pulse`}></div>
                </div>
                <p className="text-white text-sm font-medium uppercase tracking-widest animate-pulse">Processing Application...</p>
             </div>
           )}

           {step === 'success' && (
             <div className="py-12 flex flex-col items-center justify-center text-center space-y-8 animate-[fadeIn_0.5s_ease-out]">
                <div className={`w-24 h-24 rounded-full bg-white/5 flex items-center justify-center ${theme.icon} relative`}>
                   <Check size={48} strokeWidth={1.5} />
                   <div className={`absolute inset-0 rounded-full border border-current opacity-20 animate-ping`}></div>
                </div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-bold text-white">Application Received</h4>
                   <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                     Your profile has been securely transmitted to our search team. We will review your credentials for the <span className="text-white font-medium">{job.title}</span> mandate.
                   </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="px-10 py-4 border border-white/10 text-white rounded-sm hover:bg-white hover:text-black transition-all duration-300 text-xs uppercase tracking-widest font-bold"
                >
                   Return to Board
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
