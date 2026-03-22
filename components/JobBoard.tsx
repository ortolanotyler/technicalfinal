import React, { useState, useEffect } from 'react';
import { Section, Domain, JobPosting } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';
import { jobService } from '../services/jobService';

interface JobBoardProps {
  domain?: Domain;
  onViewMore: () => void;
}

const JobBoard: React.FC<JobBoardProps> = ({ domain, onViewMore }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [hoveredJob, setHoveredJob] = useState<number | null>(null);
  const isFinanceIT = domain === 'finance-it';

  useEffect(() => {
    const fetchJobs = async () => {
      if (domain) {
        const allJobs = await jobService.getJobsByDomain(domain);
        setJobs(allJobs.slice(0, 4));
      }
    };
    fetchJobs();
  }, [domain]);

  // Theme Config - Monochrome Brand
  const theme = {
    accent: 'text-brand-silver',
    bar: 'bg-brand-silver',
    glow: 'from-brand-steel',
    borderHover: 'group-hover:border-brand-silver/30',
    bgHover: 'group-hover:bg-white/[0.03]',
    button: 'border-brand-steel/30 text-brand-silver hover:bg-brand-steel hover:text-white',
    iconColor: 'text-brand-silver',
    sectionBg: 'bg-[#0F151E]',
    cardBg: domain === 'skilled-trades' ? 'bg-brand-logistics/30' : 'bg-brand-navy/30'
  };

  return (
    <section id={Section.JOB_BOARD} className={`${theme.sectionBg} py-32 border-t border-brand-steel/10 relative overflow-hidden transition-colors duration-700`}>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header - Upgraded UI */}
        <div className="relative mb-24">
             {/* Background Decoration */}
             <div className={`absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-b ${theme.glow} to-transparent rounded-full blur-[100px] opacity-10 pointer-events-none`}></div>
             
             <div className="flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
                <div className="max-w-3xl">
                    <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-8">
                      Open <span className="text-gray-600 font-light">Roles</span>
                    </h2>
                    
                    <p className="text-gray-400 text-lg font-light leading-relaxed max-w-xl border-l border-brand-steel/20 pl-8">
                       Our current priority mandates. We are actively interviewing leadership candidates for these strategic positions.
                    </p>
                </div>

                <div className="flex-shrink-0 mb-2">
                    <button 
                        onClick={onViewMore}
                        className={`group flex items-center gap-4 px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] border transition-all duration-300 rounded-sm ${theme.button}`}
                    >
                        View Full Board <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-500" />
                    </button>
                </div>
             </div>
        </div>

        {/* Professional Table Layout */}
        <div className={`border border-white/10 rounded-sm ${theme.cardBg} backdrop-blur-sm overflow-hidden shadow-2xl transition-colors duration-500`}>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="col-span-1">Ref #</div>
                <div className="col-span-6">Role Title</div>
                <div className="col-span-4">Location</div>
                <div className="col-span-1 text-right">Action</div>
            </div>

            {/* List Items */}
            <div className="divide-y divide-white/5">
                {jobs.map((job) => (
                    <div 
                        key={job.id}
                        className={`
                            group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-8 py-6 md:py-5
                            transition-all duration-300 cursor-pointer
                            ${theme.bgHover}
                        `}
                        onMouseEnter={() => setHoveredJob(job.id)}
                        onMouseLeave={() => setHoveredJob(null)}
                        onClick={onViewMore}
                    >
                        {/* Hover Accent Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${hoveredJob === job.id ? theme.bar : 'bg-transparent'}`}></div>

                        {/* Ref ID */}
                        <div className="col-span-1 hidden md:block">
                            <span className="font-mono text-xs text-gray-500 group-hover:text-white transition-colors">{job.ref}</span>
                        </div>

                        {/* Title Section */}
                        <div className="col-span-12 md:col-span-6">
                            <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors tracking-tight">
                                {job.title}
                            </h3>
                            {/* Mobile Meta */}
                            <div className="flex md:hidden gap-4 text-xs text-gray-500 mt-2">
                                <span>{job.ref}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="col-span-6 md:col-span-4 hidden md:flex items-center gap-2 text-sm font-light text-gray-400 group-hover:text-gray-300 transition-colors">
                            <MapPin size={16} strokeWidth={1.5} className="opacity-50" />
                            {job.location}
                        </div>

                        {/* Action Arrow */}
                        <div className="col-span-12 md:col-span-1 flex justify-end">
                            <ArrowRight size={18} className={`text-gray-600 transition-all duration-300 group-hover:text-white group-hover:translate-x-1`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Mobile View More */}
        <div className="mt-8 md:hidden text-center">
             <button 
                onClick={onViewMore}
                className={`inline-flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-widest border transition-all duration-300 rounded-sm ${theme.button}`}
            >
                View Full Board <ArrowRight size={16} />
            </button>
        </div>

      </div>
    </section>
  );
};

export default JobBoard;
