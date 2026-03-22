import React, { useState, useEffect } from 'react';
import { Domain, JobPosting } from '../types';
import { ArrowLeft, Search, MapPin, DollarSign, Clock, X, ArrowRight } from 'lucide-react';
import JobDetailDrawer from './JobDetailDrawer';
import { jobService } from '../services/jobService';

interface JobBoardPageProps {
  domain: Domain;
  onBack: () => void;
}

const JobBoardPage: React.FC<JobBoardPageProps> = ({ domain, onBack }) => {
  const isTrades = domain === 'skilled-trades';
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const data = await jobService.getJobsByDomain(domain);
      setJobs(data);
      setLoading(false);
    };
    fetchJobs();
  }, [domain]);

  // Theme Config synced with Services
  const theme = {
    accent: 'text-brand-silver',
    bg: domain === 'skilled-trades' ? 'bg-brand-logistics' : 'bg-brand-navy',
    borderFocus: 'focus:border-brand-silver/50',
    cardGradient: 'from-brand-silver/[0.05]',
    cardBorderHover: 'group-hover:border-brand-silver/30',
    button: 'bg-white text-black hover:bg-brand-silver hover:text-black',
    iconColor: 'text-brand-silver',
    bar: 'bg-brand-silver'
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative bg-[#0F151E] transition-colors duration-700">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={onBack}
                        className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                    >
                        <div className="p-2 rounded-full border border-white/10 group-hover:border-white/30 bg-white/5 group-hover:bg-white/10 transition-all">
                             <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">Back to Gateway</span>
                    </button>
                </div>
                
                <div className="flex flex-col items-end cursor-pointer group select-none" onClick={onBack}>
                    <span className="font-sans font-bold text-xl tracking-tight leading-none text-white transition-all duration-300">
                        CERTUS<span className="text-brand-accent">GROUP</span>
                    </span>
                    <span className="text-gray-500 text-[8px] font-bold uppercase tracking-[0.4em] mt-1.5 group-hover:text-brand-silver transition-colors">
                        Current Openings
                    </span>
                </div>
            </div>
        </header>

        {/* Roles Grid */}
        <main className="flex-grow pt-24 pb-24 px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Active <span className="text-brand-silver italic font-serif font-light">Mandates</span>
                    </h2>
                    <p className="mt-4 text-gray-500 text-sm font-light uppercase tracking-widest">
                        Showing {jobs.length} Priority Search Opportunities
                    </p>
                </div>
                {jobs.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {jobs.map((job) => (
                            <div 
                                key={job.id} 
                                onClick={() => setSelectedJob(job)}
                                className={`
                                    relative group cursor-pointer bg-white/[0.01] border border-white/5 rounded-sm overflow-hidden
                                    transition-all duration-500 ease-out hover:-translate-y-1
                                    flex flex-col backdrop-blur-sm
                                    ${theme.cardBorderHover}
                                `}
                            >
                                <div className="p-8 md:p-10 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <span className="font-mono text-[10px] text-gray-600 uppercase tracking-widest px-2 py-1 border border-white/5 rounded-sm">
                                            REF: {job.ref}
                                        </span>
                                        <div className="flex items-center gap-2 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                                            <Clock size={12} />
                                            <span>{job.posted}</span>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-brand-silver transition-colors tracking-tight leading-tight text-balance">
                                        {job.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm leading-relaxed mb-10 line-clamp-2 font-light text-justify">
                                        {job.summary}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className={theme.iconColor} />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2">
                                                <DollarSign size={14} className={theme.iconColor} />
                                                <span>{job.salary}</span>
                                            </div>
                                        </div>

                                        <div className="p-2 rounded-full border border-white/10 group-hover:bg-white group-hover:text-brand-dark transition-all duration-300">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`absolute inset-0 bg-gradient-to-br ${theme.cardGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 border border-dashed border-white/5 rounded-sm bg-white/[0.01]">
                        <p className="text-gray-600 font-bold text-xs uppercase tracking-widest mb-2">No Mandates Available</p>
                        <p className="text-gray-700 text-sm">Check back soon for new opportunities.</p>
                    </div>
                )}
            </div>
        </main>

        <JobDetailDrawer 
            job={selectedJob} 
            isOpen={!!selectedJob} 
            onClose={() => setSelectedJob(null)} 
            isSupply={isTrades} 
        />
    </div>
  );
};

export default JobBoardPage;