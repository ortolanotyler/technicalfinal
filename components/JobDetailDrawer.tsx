
import React, { useEffect, useState } from 'react';
import { JobPosting } from '../types';
import { X, MapPin, DollarSign, Check, ArrowRight, Calendar } from 'lucide-react';
import ApplicationModal from './ApplicationModal';

interface JobDetailDrawerProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  isSupply: boolean;
}

const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({ job, isOpen, onClose, isSupply }) => {
  const [visible, setVisible] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  // Theme Config - Monochrome Brand
  const theme = {
    accent: 'text-brand-silver',
    bg: 'bg-brand-steel',
    bgSoft: 'bg-brand-steel/10',
    border: 'border-brand-steel/30',
    button: 'bg-brand-silver hover:bg-white text-black',
    bullet: 'bg-brand-steel'
  };

  return (
    <>
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div 
        className={`
          relative w-full max-w-2xl bg-brand-dark border-l border-white/10 h-full shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {job && (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-8 py-6 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
              <div className="pr-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded-sm border ${theme.border} ${theme.accent} ${theme.bgSoft}`}>
                        REF: {job.ref}
                    </span>
                    <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={12} /> Posted {job.posted}
                    </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{job.title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4 p-8 border-b border-white/5 bg-white/[0.01]">
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Location</span>
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin size={18} strokeWidth={1.5} className={theme.accent} />
                            {job.location}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Compensation</span>
                        <div className="flex items-center gap-2 text-gray-300">
                            <DollarSign size={18} strokeWidth={1.5} className={theme.accent} />
                            {job.salary}
                        </div>
                    </div>
                </div>

                {/* Main Body */}
                <div className="p-8 space-y-10">
                    
                    {/* Summary */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                           <span className={`w-1 h-4 ${theme.bg}`}></span> Executive Summary
                        </h3>
                        <p className="text-gray-400 leading-relaxed font-light text-base">
                            {job.summary}
                        </p>
                    </section>

                    {/* Responsibilities */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                           <span className={`w-1 h-4 ${theme.bg}`}></span> The Mandate
                        </h3>
                        <ul className="space-y-4">
                            {job.responsibilities.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${theme.bullet}`}></div>
                                    <span className="text-gray-400 font-light leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Requirements */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                           <span className={`w-1 h-4 ${theme.bg}`}></span> Candidate Profile
                        </h3>
                        <ul className="space-y-4">
                            {job.requirements.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <Check size={16} className={`mt-1 flex-shrink-0 ${theme.accent}`} strokeWidth={2} />
                                    <span className="text-gray-400 font-light leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 p-8 border-t border-white/10 bg-brand-dark z-10">
                <button 
                  onClick={() => setIsApplying(true)}
                  className={`w-full py-4 font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${theme.button}`}
                >
                    Apply for this Position <ArrowRight size={18} />
                </button>
                <p className="text-center text-xs text-gray-600 mt-4">
                    Reference ID: <span className="text-gray-400">{job.ref}</span> • Confidentiality Guaranteed
                </p>
            </div>
          </>
        )}
      </div>
    </div>
    
    {/* Nested Application Modal */}
    {job && (
      <ApplicationModal 
        job={job}
        isOpen={isApplying}
        onClose={() => setIsApplying(false)}
        isSupply={isSupply}
      />
    )}
    </>
  );
};

export default JobDetailDrawer;
