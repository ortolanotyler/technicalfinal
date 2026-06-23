import React, { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { getBlogPost } from '../services/blogService';
import SEO from './SEO';

interface InsightsPostPageProps {
  slug: string;
  onBack: () => void;            // back to main site
  onBackToInsights: () => void;  // back to /insights index
  onViewJobs: () => void;
}

const CERTUS_LOGO =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const readingTime = (content: string): string => {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

// Markdown element styling (no @tailwindcss/typography plugin in this project,
// so styles are applied explicitly per element).
const md = {
  h2: (props: any) => (
    <h2 className="text-2xl md:text-3xl font-medium text-white mt-12 mb-4 tracking-tight leading-tight" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-medium text-white mt-8 mb-3 tracking-tight" {...props} />
  ),
  p: (props: any) => (
    <p className="text-white/70 leading-relaxed mb-5 text-[15px] md:text-[17px] font-light" {...props} />
  ),
  a: (props: any) => (
    <a
      className="text-brand-silver underline underline-offset-4 decoration-white/30 hover:decoration-white hover:text-white transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul className="list-disc pl-5 space-y-2 mb-6 text-white/70 marker:text-brand-silver text-[15px] md:text-[17px] font-light" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal pl-5 space-y-2 mb-6 text-white/70 marker:text-white/40 text-[15px] md:text-[17px] font-light" {...props} />
  ),
  li: (props: any) => <li className="leading-relaxed pl-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-2 border-brand-silver/50 pl-5 my-7 text-white/80 italic text-lg md:text-xl font-light leading-relaxed" {...props} />
  ),
  strong: (props: any) => <strong className="text-white font-semibold" {...props} />,
  em: (props: any) => <em className="italic" {...props} />,
  hr: () => <hr className="border-white/10 my-10" />,
  code: (props: any) => (
    <code className="bg-white/10 text-brand-silver px-1.5 py-0.5 rounded text-[0.9em]" {...props} />
  ),
  h1: (props: any) => (
    <h2 className="text-2xl md:text-3xl font-medium text-white mt-12 mb-4 tracking-tight" {...props} />
  ),
};

const InsightsPostPage: React.FC<InsightsPostPageProps> = ({ slug, onBack, onBackToInsights, onViewJobs }) => {
  const post = useMemo(() => getBlogPost(slug), [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const Header = (
    <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <button
          onClick={onBackToInsights}
          className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
        >
          <div className="p-2 rounded-full border border-white/10 group-hover:border-white/30 bg-white/5 group-hover:bg-white/10 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">
            All insights
          </span>
        </button>

        <button onClick={onBack} className="flex items-center gap-3 select-none group">
          <img
            src={CERTUS_LOGO}
            className="w-6 h-6 opacity-90"
            alt="Certus Logo"
            referrerPolicy="no-referrer"
          />
          <span className="font-sans font-bold text-xl tracking-tight leading-none text-white">
            CERTUS<span className="text-brand-accent">GROUP</span>
          </span>
        </button>
      </div>
    </header>
  );

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-dark text-white flex flex-col font-sans">
        <SEO title="Article not found" description="This insight may have moved or been retired." />
        {Header}
        <main className="flex-grow flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Article not found</h1>
            <p className="mt-4 text-white/50 font-light">
              This post may have moved or been retired.
            </p>
            <button
              onClick={onBackToInsights}
              className="mt-8 inline-flex items-center gap-2 bg-white text-brand-dark hover:bg-brand-silver px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
            >
              <ArrowLeft size={14} />
              Back to insights
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col font-sans">
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags?.join(', ')}
        ogType="article"
        ogImage={post.coverImage}
      />
      {Header}

      <main className="flex-grow w-full">
        <article className="max-w-3xl mx-auto px-6 lg:px-8 pt-14 md:pt-20 pb-24 md:pb-32">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <span>{formatDate(post.date)}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5">
              <Clock size={11} strokeWidth={1.5} />
              {readingTime(post.content)}
            </span>
            {post.tags?.length ? (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-brand-silver">{post.tags.join(' · ')}</span>
              </>
            ) : null}
          </div>

          {/* Title */}
          <h1 className="mt-5 text-3xl md:text-5xl font-medium tracking-tight leading-[1.08]">
            {post.title}
          </h1>

          <p className="mt-5 text-white/55 text-lg font-light leading-relaxed">{post.excerpt}</p>

          <div className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/40">
            By {post.author}
          </div>

          {/* Cover */}
          {post.coverImage && (
            <div className="mt-10 -mx-1 overflow-hidden rounded-sm border border-white/5 bg-white/5">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[440px]"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Body */}
          <div className="mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md as any}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-16 pt-10 border-t border-white/10">
            <div className="bg-white/[0.03] border border-white/5 rounded-sm p-8 md:p-10">
              <h3 className="text-xl md:text-2xl font-medium tracking-tight">
                Hiring skilled technicians — or looking for your next bay?
              </h3>
              <p className="mt-3 text-white/55 font-light leading-relaxed max-w-lg">
                Certus Technical Search recruits heavy-duty, truck &amp; coach, and industrial
                maintenance talent for employers across North America.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={onViewJobs}
                  className="inline-flex items-center gap-2 bg-white text-brand-dark hover:bg-brand-silver px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                >
                  View open roles
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={onBackToInsights}
                  className="inline-flex items-center gap-2 border border-white/15 hover:border-white/40 hover:bg-white/5 text-white px-6 py-3 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
                >
                  <ArrowLeft size={14} />
                  More insights
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default InsightsPostPage;
