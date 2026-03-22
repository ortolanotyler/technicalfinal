import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, ArrowRight, Loader2, Clock } from 'lucide-react';
import { Domain, JobPosting } from '../types';
import { jobService } from '../services/jobService';
import ApplicationModal from './ApplicationModal';

interface FeaturedJobsHeroProps {
  domain: Domain;
  onViewJobs: () => void;
}

const FeaturedJobsHero: React.FC<FeaturedJobsHeroProps> = ({ domain, onViewJobs }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const jobsData = await jobService.getJobsByDomain(domain);
      setJobs(jobsData.slice(0, 3)); // Show top 3 jobs
      setLoading(false);
    };
    fetchJobs();
  }, [domain]);

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
    setIsApplying(true);
  };

  if (!loading && jobs.length === 0) return null;

  return (
    <section className="relative py-32 bg-brand-dark overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-dark via-transparent to-brand-dark"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-silver/10 flex items-center justify-center rounded-sm">
                <Briefcase className="text-brand-silver" size={24} />
              </div>
              <span className="text-brand-silver text-xs font-bold uppercase tracking-[0.4em]">Priority Mandates</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-medium text-white tracking-tighter leading-none">
              Active <span className="text-brand-silver italic font-serif font-light">Searches</span>
            </h2>
            <p className="mt-8 text-gray-400 text-lg md:text-xl font-light max-w-xl leading-relaxed">
              Strategic leadership and technical roles currently under search for our {domain === 'skilled-trades' ? 'Skilled Trades' : 'Industrial'} partners.
            </p>
          </div>
          
          <button 
            onClick={onViewJobs}
            className="group flex flex-col items-end gap-2"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-white group-hover:text-brand-silver transition-colors">
              Explore All Opportunities
            </span>
            <div className="h-[1px] w-24 bg-brand-silver/30 group-hover:w-full group-hover:bg-brand-silver transition-all duration-500"></div>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-silver animate-spin" size={40} />
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div 
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="group relative bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-sm hover:border-brand-silver/40 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Hover Accent */}
                <div className="absolute top-0 left-0 w-[2px] h-full bg-brand-silver scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-sm border border-white/5">
                      {job.ref}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-brand-silver/60 font-bold uppercase tracking-widest">
                      <Clock size={12} />
                      <span>{job.posted}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-brand-silver transition-colors leading-tight">
                    {job.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-6 md:gap-12">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <MapPin size={14} className="text-brand-silver" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <DollarSign size={14} className="text-brand-silver" />
                    <span>{job.salary}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-brand-silver/10 group-hover:bg-brand-silver text-brand-silver group-hover:text-black px-6 py-3 rounded-sm transition-all duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Apply Now</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplicationModal 
          job={selectedJob}
          isOpen={isApplying}
          onClose={() => setIsApplying(false)}
          isSupply={domain === 'skilled-trades'}
        />
      )}
    </section>
  );
};

export default FeaturedJobsHero;

