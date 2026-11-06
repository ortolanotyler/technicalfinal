import React, { useEffect, useState } from 'react';
import { JobPosting } from '../types';
import { ArrowLeft, MapPin, DollarSign, Briefcase, ArrowRight, Share2, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ApplicationModal from './ApplicationModal';
import SEO from './SEO';
import { jobService } from '../services/jobService';
import { jobSlug } from '../services/jobSlug';

const SITE_ORIGIN = 'https://technical.certusgroup.com';

interface JobPageProps {
  jobId: string;
  onBack: () => void;
  onViewAll: () => void;
}

/**
 * Standalone page for a directly loaded /jobs/:id URL.
 *
 * Before this existed, a direct load mounted the whole job board with the job in
 * a popup and retitled the page "Open Positions". Google renders JavaScript, so
 * every job URL looked like a copy of /jobs and was dropped as a duplicate or
 * soft 404. This page keeps the rendered title, H1, canonical and body matching
 * what api/render.ts serves for the same URL.
 */
const JobPage: React.FC<JobPageProps> = ({ jobId, onBack, onViewAll }) => {
  const [job, setJob] = useState<JobPosting | null | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    jobService.getJobsByDomain().then((data) => {
      if (cancelled) return;
      const id = decodeURIComponent(jobId).replace(/\/$/, '');
      setJob(data.find((j) => jobSlug(j) === id || String(j.id) === id) || null);
    });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const goAll = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    window.history.pushState({}, '', '/jobs');
    onViewAll();
  };

  const handleShare = () => {
    if (!job) return;
    navigator.clipboard.writeText(`${SITE_ORIGIN}/jobs/${jobSlug(job)}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative bg-[#0F151E]">
      <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <a
            href="/jobs"
            onClick={goAll}
            className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full border border-white/10 group-hover:border-white/30 bg-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">All open positions</span>
          </a>
          <div className="flex flex-col items-end cursor-pointer group select-none" onClick={onBack}>
            <span className="font-sans font-bold text-xl tracking-tight leading-none text-white">
              CERTUS<span className="text-brand-accent">GROUP</span>
            </span>
            <span className="text-gray-500 text-[8px] font-bold uppercase tracking-[0.4em] mt-1.5 group-hover:text-brand-silver transition-colors">
              Current Openings
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16 pb-24 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {job === undefined ? null : job === null ? (
            <>
              <SEO
                title="Position filled"
                description="This position is no longer available. View current openings."
                canonical={`${SITE_ORIGIN}/jobs`}
                noindex
              />
              <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-6">Position filled</h1>
              <p className="text-gray-400 text-lg font-light mb-10">This position is no longer available.</p>
              <a
                href="/jobs"
                onClick={goAll}
                className="inline-flex items-center gap-3 bg-brand-silver hover:bg-white text-black px-6 py-3 rounded-sm font-bold text-sm transition-all"
              >
                View current openings <ArrowRight size={16} />
              </a>
            </>
          ) : (
            <>
              <SEO
                title={`${job.title}${job.location ? ` in ${job.location}` : ''}`}
                description={(job.summary || `${job.title} in ${job.location || 'Canada'}`).slice(0, 320)}
                canonical={`${SITE_ORIGIN}/jobs/${jobSlug(job)}`}
                ogType="article"
              />
              <article>
                <div className="flex items-start justify-between gap-6 mb-8">
                  <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.1]">{job.title}</h1>
                  <button
                    onClick={handleShare}
                    className="p-2.5 mt-1 rounded-sm border border-white/10 hover:border-brand-silver/30 hover:bg-white/5 transition-all flex-shrink-0"
                    title="Copy job link"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Share2 size={16} className="text-gray-400" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-8 gap-y-3 pb-8 mb-10 border-b border-white/10 text-gray-300">
                  {job.location && (
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-silver" />{job.location}</span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-2"><DollarSign size={16} className="text-brand-silver" />{job.salary}</span>
                  )}
                  {job.type && (
                    <span className="flex items-center gap-2"><Briefcase size={16} className="text-brand-silver" />{job.type}</span>
                  )}
                </div>

                {job.description ? (
                  <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed font-light text-base [&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&_li]:my-1 [&_li>p]:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{job.description}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-8 text-gray-400 font-light leading-relaxed">
                    {job.summary && <p>{job.summary}</p>}
                    {job.responsibilities?.length > 0 && (
                      <section>
                        <h2 className="text-base font-bold text-white mb-3">The role</h2>
                        <ul className="list-disc pl-5 space-y-2">{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </section>
                    )}
                    {job.requirements?.length > 0 && (
                      <section>
                        <h2 className="text-base font-bold text-white mb-3">What you bring</h2>
                        <ul className="list-disc pl-5 space-y-2">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                      </section>
                    )}
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/10">
                  <button
                    onClick={() => {
                      (window as any).gtag?.('event', 'job_apply', { job_title: job.title, job_ref: job.ref });
                      setIsApplying(true);
                    }}
                    className="w-full sm:w-auto px-10 py-4 font-bold text-base rounded-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-3 bg-brand-silver hover:bg-white text-black"
                  >
                    Apply for this position <ArrowRight size={18} />
                  </button>
                  <p className="mt-8">
                    <a href="/jobs" onClick={goAll} className="text-sm text-gray-500 hover:text-white transition-colors">
                      See all open positions &rarr;
                    </a>
                  </p>
                </div>
              </article>
              <ApplicationModal job={job} isOpen={isApplying} onClose={() => setIsApplying(false)} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobPage;
