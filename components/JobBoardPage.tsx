import React, { useState, useEffect } from 'react';
import { JobPosting } from '../types';
import { ArrowLeft, MapPin, DollarSign, ArrowRight, Share2, Check } from 'lucide-react';
import JobDetailDrawer from './JobDetailDrawer';
import { jobService } from '../services/jobService';
import { jobSlug } from '../services/jobSlug';
import SEO from './SEO';

interface JobBoardPageProps {
  onBack: () => void;
  initialJobId?: string | null;
}

const JobBoardPage: React.FC<JobBoardPageProps> = ({ onBack, initialJobId }) => {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;
    const matchesType = selectedType === 'All' || job.type === selectedType;
    return matchesSearch && matchesLocation && matchesType;
  });

  const locations = ['All', ...Array.from(new Set(jobs.map(j => j.location)))];
  const types = ['All', ...Array.from(new Set(jobs.map(j => j.type)))];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const data = await jobService.getJobsByDomain();
      // Sort featured jobs to the top
      const sortedJobs = [...data].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
      setJobs(sortedJobs);
      setLoading(false);
      
      // Handle initial job selection from URL (slug or legacy raw id).
      if (initialJobId && data.length > 0) {
        const job = data.find(j => jobSlug(j) === initialJobId || String(j.id) === initialJobId);
        if (job) {
          setSelectedJob(job);
        }
      }
    };
    fetchJobs();
  }, [initialJobId]);

  // Update URL when selected job changes
  useEffect(() => {
    const path = window.location.pathname;
    if (selectedJob) {
      const newPath = `/jobs/${jobSlug(selectedJob)}`;
      if (path !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    } else if (path.startsWith('/jobs/')) {
      window.history.pushState({}, '', '/jobs');
    }
  }, [selectedJob]);

  const handleShare = (e: React.MouseEvent, job: JobPosting) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${jobSlug(job)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(job.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/jobs/')) {
        const jobId = path.split('/jobs/')[1];
        const job = jobs.find(j => String(j.id) === jobId);
        if (job) {
          setSelectedJob(job);
        } else {
          setSelectedJob(null);
        }
      } else {
        setSelectedJob(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [jobs]);

  // Theme Config synced with Services
  const theme = {
    accent: 'text-brand-silver',
    bg: 'bg-brand-logistics',
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
        <main className="flex-grow pt-24 pb-24 px-6 lg:px-8 relative">
            <SEO title="Open Positions" description="Explore current technical and skilled trades job opportunities at Certus Technical Search." />
            <div className="max-w-7xl mx-auto">
                <h1 className="sr-only">Certus Group Technical Search - Job Board</h1>
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input 
                            type="text" 
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-silver flex-grow"
                        />
                        <select onChange={(e) => setSelectedLocation(e.target.value)} className="bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-silver">
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <select onChange={(e) => setSelectedType(e.target.value)} className="bg-white/[0.02] border border-white/10 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-silver">
                            {types.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                    <p className="mt-4 text-gray-500 text-sm font-light uppercase tracking-widest">
                        Showing {filteredJobs.length} open {filteredJobs.length === 1 ? 'position' : 'positions'}
                    </p>
                </div>
                {filteredJobs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className="group relative bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-sm hover:border-brand-silver/40 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden"
                            >
                                {/* Hover accent */}
                                <div className="absolute top-0 left-0 w-[2px] h-full bg-brand-silver scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"></div>

                                <div className="flex-grow min-w-0">
                                    <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-brand-silver transition-colors leading-tight">
                                        {job.title}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-5 md:gap-8 flex-shrink-0">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <MapPin size={14} className="text-brand-silver" />
                                        <span>{job.location}</span>
                                    </div>
                                    {job.salary && (
                                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                        <DollarSign size={14} className="text-brand-silver" />
                                        <span>{job.salary}</span>
                                      </div>
                                    )}

                                    <button
                                        onClick={(e) => handleShare(e, job)}
                                        className="p-2.5 rounded-sm border border-white/5 hover:border-brand-silver/30 hover:bg-white/5 transition-all relative"
                                        title="Copy job link"
                                    >
                                        {copiedId === job.id ? (
                                            <Check size={14} className="text-green-400" />
                                        ) : (
                                            <Share2 size={14} className="text-gray-500 hover:text-brand-silver" />
                                        )}
                                    </button>

                                    <div className="flex items-center gap-3 bg-brand-silver/10 group-hover:bg-brand-silver text-brand-silver group-hover:text-black px-6 py-3 rounded-sm transition-all duration-500">
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Apply Now</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 border border-dashed border-white/5 rounded-sm bg-white/[0.01]">
                        <p className="text-gray-600 font-bold text-xs uppercase tracking-widest mb-2">No Open Positions</p>
                        <p className="text-gray-700 text-sm">Check back soon for new opportunities.</p>
                    </div>
                )}
            </div>
        </main>

        <JobDetailDrawer 
            job={selectedJob} 
            isOpen={!!selectedJob} 
            onClose={() => setSelectedJob(null)} 
        />
    </div>
  );
};

export default JobBoardPage;