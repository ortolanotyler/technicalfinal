import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Loader2, X, ChevronLeft, ChevronRight, Linkedin } from 'lucide-react';
import { Section, LinkedInPost } from '../types';
import { jobService } from '../services/jobService';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const COMPANY_LINKEDIN_URL = 'https://www.linkedin.com/showcase/certus-technical-search/';

const formatDate = (raw?: string) => {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const LinkedInFeed: React.FC = () => {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await jobService.getLinkedInPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();

    const handleResize = () => {
      if (window.innerWidth >= 1280) setVisibleItems(3);
      else if (window.innerWidth >= 1024) setVisibleItems(3);
      else if (window.innerWidth >= 640) setVisibleItems(2);
      else setVisibleItems(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const maxIdx = Math.max(0, posts.length - visibleItems);
    if (currentIndex > maxIdx) setCurrentIndex(maxIdx);
  }, [visibleItems, posts.length, currentIndex]);

  const nextPost = () => {
    if (posts.length <= visibleItems) return;
    setCurrentIndex((prev) => {
      const maxIdx = posts.length - visibleItems;
      return prev >= maxIdx ? 0 : prev + 1;
    });
  };

  const prevPost = () => {
    if (posts.length <= visibleItems) return;
    setCurrentIndex((prev) => {
      const maxIdx = posts.length - visibleItems;
      return prev <= 0 ? maxIdx : prev - 1;
    });
  };

  const onDragEnd = (_: any, info: any) => {
    const threshold = 50;
    const velocityThreshold = 500;
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) nextPost();
    else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) prevPost();
  };

  useEffect(() => {
    document.body.style.overflow = selectedPost ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

  const canPaginate = posts.length > visibleItems;

  return (
    <section
      id={Section.INSIGHTS}
      className="relative py-24 md:py-32 bg-brand-dark border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 -translate-y-1/2 right-[-200px] w-[600px] h-[600px] rounded-full bg-brand-silver/[0.02] blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-[1.05]">
            Recent posts.
          </h2>

          <a
            href={COMPANY_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors"
          >
            Follow on LinkedIn →
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-silver animate-spin" size={36} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-sm bg-white/[0.01]">
            <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-bold">No posts yet</p>
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden touch-pan-y">
              <motion.div
                className="flex cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={onDragEnd}
                animate={{ x: `-${currentIndex * (100 / posts.length)}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  display: 'flex',
                  width: `${(posts.length * 100) / visibleItems}%`,
                }}
              >
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="px-3 md:px-4"
                    style={{ flex: `0 0 ${100 / posts.length}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="group relative w-full h-full text-left bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden flex flex-col hover:border-brand-silver/30 hover:bg-white/[0.04] transition-all duration-500"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-silver scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-20"></div>

                      <div className="p-6 md:p-7 flex items-center justify-between border-b border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                          {formatDate(post.createdAt || post.date)}
                        </span>
                        <Linkedin
                          size={14}
                          className="text-white/30 group-hover:text-brand-silver transition-colors"
                          strokeWidth={1.75}
                        />
                      </div>

                      <div className="flex-grow flex flex-col">
                        {typeof post.image === 'string' && post.image.trim() !== '' ? (
                          <div className="flex-grow overflow-hidden bg-black/20">
                            <img
                              src={post.image}
                              alt=""
                              className="w-full h-full object-cover min-h-[220px] grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="p-6 md:p-7 flex-grow text-gray-300 text-sm font-light leading-relaxed line-clamp-[7] prose prose-invert prose-sm max-w-none whitespace-pre-wrap [&_p]:my-0">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {post.content.replace(/\n\s*\n/g, '\n\n&nbsp;\n\n')}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      <div className="px-6 md:px-7 py-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 group-hover:text-white transition-colors">
                        <span>Read full post</span>
                        <ArrowUpRight
                          size={14}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        />
                      </div>
                    </button>
                  </div>
                ))}
              </motion.div>
            </div>

            {canPaginate && (
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  {currentIndex + 1} – {Math.min(currentIndex + visibleItems, posts.length)} of {posts.length}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={prevPost}
                    className="w-11 h-11 rounded-sm border border-white/10 hover:border-white/40 hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                    aria-label="Previous post"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={nextPost}
                    className="w-11 h-11 rounded-sm border border-white/10 hover:border-white/40 hover:bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
                    aria-label="Next post"
                  >
                    <ChevronRight size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-brand-dark border border-white/10 w-full max-w-2xl max-h-[88vh] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 md:px-8 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02] flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                  {formatDate(selectedPost.createdAt || selectedPost.date)}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-silver">
                  Certus Technical Search
                </span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-sm"
                aria-label="Close post"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar flex-grow">
              <div className="text-gray-200 text-base md:text-[17px] font-light leading-relaxed prose prose-invert max-w-none whitespace-pre-wrap">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {selectedPost.content.replace(/\n\s*\n/g, '\n\n&nbsp;\n\n')}
                </ReactMarkdown>
              </div>

              {typeof selectedPost.image === 'string' && selectedPost.image.trim() !== '' && (
                <div className="mt-8 rounded-sm overflow-hidden border border-white/10 bg-black/20">
                  <img
                    src={selectedPost.image}
                    alt=""
                    className="w-full h-auto object-contain max-h-[50vh] mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            <div className="px-6 md:px-8 py-4 border-t border-white/10 flex justify-end bg-white/[0.02] flex-shrink-0">
              <a
                href={COMPANY_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors"
              >
                View on LinkedIn
                <ArrowUpRight
                  size={12}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default LinkedInFeed;
