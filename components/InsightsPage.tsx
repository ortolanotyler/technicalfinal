import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { BlogPost } from '../types';
import { getBlogPosts } from '../services/blogService';
import SEO from './SEO';

interface InsightsPageProps {
  onBack: () => void;
  onOpenPost: (slug: string) => void;
}

const CERTUS_LOGO =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const readingTime = (content: string): string => {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const InsightsPage: React.FC<InsightsPageProps> = ({ onBack, onOpenPost }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setPosts(getBlogPosts());
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col font-sans">
      <SEO
        title="Insights"
        description="Market commentary and hiring insight from Certus Technical Search — the skilled-trades, heavy-duty, and industrial maintenance talent market across Canada."
        keywords="skilled trades blog, technician hiring, heavy-duty mechanic shortage, 310T, Red Seal, fleet maintenance hiring, trades labour market Canada"
        ogType="article"
      />

      <header className="sticky top-0 z-50 bg-[#0F151E]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
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

      <main className="flex-grow w-full">
        {/* Page intro */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-16 md:pt-24 pb-12 md:pb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brand-silver">
            Insights
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-medium tracking-tight leading-[1.05]">
            Notes on the trades &amp; talent
          </h1>
          <p className="mt-5 max-w-xl text-white/50 text-base md:text-lg font-light leading-relaxed">
            Practical perspective on the skilled-trades labour market — hiring, retention,
            licensing, and careers across heavy-duty, truck &amp; coach, and industrial maintenance.
          </p>
        </div>

        {/* Post list */}
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-24 md:pb-32">
          {posts.length === 0 ? (
            <p className="text-white/40 text-sm">No posts yet — check back soon.</p>
          ) : (
            <div className="grid gap-px bg-white/5 border border-white/5 rounded-sm overflow-hidden">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  onClick={() => onOpenPost(post.slug)}
                  className="group bg-brand-dark hover:bg-white/[0.03] transition-colors cursor-pointer p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8"
                >
                  {post.coverImage && (
                    <div className="md:w-56 lg:w-64 shrink-0 aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-sm bg-white/5">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      <span>{formatDate(post.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} strokeWidth={1.5} />
                        {readingTime(post.content)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl md:text-3xl font-medium text-white group-hover:text-brand-silver transition-colors leading-tight tracking-tight">
                      {post.title}
                    </h2>

                    <p className="mt-3 text-white/55 text-sm md:text-[15px] font-light leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white transition-colors">
                      Read article
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InsightsPage;
