import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { JobPosting } from '../types';
import { jobService } from '../services/jobService';
import JobDetailDrawer from './JobDetailDrawer';

import SEO from './SEO';

interface FeaturedJobsHeroProps {
  onViewJobs: () => void;
}

const FeaturedJobsHero: React.FC<FeaturedJobsHeroProps> = ({ onViewJobs }) => {
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const JOBS_PER_PAGE = 3;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const jobsData = await jobService.getJobsByDomain();
      // Sort featured jobs to the top
      const sortedJobs = [...jobsData].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
      setAllJobs(sortedJobs);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const displayedJobs = allJobs.slice(currentIndex, currentIndex + JOBS_PER_PAGE);

  const handleNext = () => {
    if (currentIndex + JOBS_PER_PAGE < allJobs.length) {
      setCurrentIndex(prev => prev + JOBS_PER_PAGE);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (currentIndex - JOBS_PER_PAGE >= 0) {
      setCurrentIndex(prev => prev - JOBS_PER_PAGE);
    } else {
      // Go to last page
      const lastPageStart = Math.floor((allJobs.length - 1) / JOBS_PER_PAGE) * JOBS_PER_PAGE;
      setCurrentIndex(lastPageStart);
    }
  };

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
  };

  if (!loading && allJobs.length === 0) return null;

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
            <h2 className="text-4xl md:text-7xl font-medium text-white tracking-tighter leading-none">
              Active <span className="text-brand-silver italic font-serif font-light">Searches</span>
            </h2>
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
          <div className="space-y-8">
            <div className="space-y-4">
              {displayedJobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => handleJobClick(job)}
                  className="group relative bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-sm hover:border-brand-silver/40 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* SEO Structured Data for each job - schemaOnly to avoid overwriting page title */}
                  <SEO key={`seo-${job.id}`} job={job} schemaOnly={true} />
                  
                  {/* Hover Accent */}
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-brand-silver scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>
                  
                  <div className="flex-grow">
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

            {/* Navigation Controls */}
            {allJobs.length > JOBS_PER_PAGE && (
              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrev}
                    className="p-3 border border-white/10 rounded-sm text-gray-500 hover:text-white hover:border-white/30 transition-all"
                    aria-label="Previous Jobs"
                  >
                    <ArrowRight size={18} className="rotate-180" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-3 border border-white/10 rounded-sm text-gray-500 hover:text-white hover:border-white/30 transition-all"
                    aria-label="Next Jobs"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(allJobs.length / JOBS_PER_PAGE) }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-1 transition-all duration-300 rounded-full ${
                        Math.floor(currentIndex / JOBS_PER_PAGE) === idx 
                          ? 'w-8 bg-brand-silver' 
                          : 'w-2 bg-white/10'
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Page {Math.floor(currentIndex / JOBS_PER_PAGE) + 1} of {Math.ceil(allJobs.length / JOBS_PER_PAGE)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailDrawer 
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </section>
  );
};

export default FeaturedJobsHero;

