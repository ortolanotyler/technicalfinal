import React, { useState, useEffect, useRef } from 'react';
import { Linkedin, ExternalLink, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section, LinkedInPost } from '../types';
import { jobService } from '../services/jobService';
import { motion, AnimatePresence } from 'motion/react';

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
      if (window.innerWidth >= 1024) setVisibleItems(3);
      else if (window.innerWidth >= 768) setVisibleItems(2);
      else setVisibleItems(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextPost = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % (posts.length - visibleItems + 1));
  };

  const prevPost = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + (posts.length - visibleItems + 1)) % (posts.length - visibleItems + 1));
  };

  const maxIndex = Math.max(0, posts.length - visibleItems);
  const safeIndex = Math.min(currentIndex, maxIndex);

  return (
    <section id={Section.INSIGHTS} className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-silver/[0.02] -skew-x-12 transform translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-20 gap-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#0077B5] flex items-center justify-center rounded-sm shadow-lg shadow-[#0077B5]/20">
                <Linkedin className="text-white" size={24} fill="currentColor" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={prevPost}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-brand-silver/50 transition-all"
                aria-label="Previous post"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextPost}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 hover:border-brand-silver/50 transition-all"
                aria-label="Next post"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <a 
              href="https://www.linkedin.com/company/certus-group-executive-search" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white hover:text-brand-silver transition-colors"
            >
              Follow our Network
              <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-silver animate-spin" size={40} />
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div 
                className="flex gap-6 md:gap-8"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                  if (swipe) {
                    if (offset.x > 0) prevPost();
                    else nextPost();
                  }
                }}
                animate={{ x: `-${safeIndex * (100 / visibleItems)}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ 
                  display: 'flex',
                  width: `${(posts.length * 100) / visibleItems}%`,
                  cursor: 'grab'
                }}
                whileTap={{ cursor: 'grabbing' }}
              >
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="w-full"
                    style={{ flex: `0 0 ${100 / posts.length}%` }}
                  >
                    <div 
                      onClick={() => setSelectedPost(post)}
                      className="bg-brand-navy/20 border border-white/5 rounded-sm overflow-hidden flex flex-col h-full group hover:border-brand-silver/30 transition-all duration-500 cursor-pointer mx-1"
                    >
                      {/* Post Content */}
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                              <img 
                                src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png" 
                                className="w-5 h-5 opacity-80 grayscale brightness-[2]"
                                alt="Certus Logo"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white leading-none">Certus Technical Search</span>
                              <span className="text-[10px] text-gray-500 mt-1">{post.date}</span>
                            </div>
                          </div>
                          <Linkedin size={14} className="text-[#0077B5]" />
                        </div>
                        
                        <p className="text-gray-300 text-sm font-light leading-relaxed mb-6 line-clamp-6">
                          {post.content}
                        </p>

                        {/* Post Image - Full image display */}
                        {typeof post.image === 'string' && post.image.trim() !== '' && (
                          <div className="w-full overflow-hidden rounded-sm mb-6 border border-white/5 bg-black/20 mt-auto">
                            <img 
                              src={post.image} 
                              alt="Post visual" 
                              className="w-full h-auto object-contain group-hover:scale-[1.02] transition-all duration-700"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: posts.length - visibleItems + 1 }).map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${safeIndex === idx ? 'bg-brand-silver w-6' : 'bg-white/20'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-brand-dark border border-white/10 w-full max-w-3xl max-h-[90vh] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-brand-navy/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0077B5] flex items-center justify-center rounded-sm">
                  <Linkedin className="text-white" size={20} fill="currentColor" />
                </div>
                <span className="text-white text-sm font-bold uppercase tracking-widest">Post Insight</span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)} 
                className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png" 
                    className="w-7 h-7 opacity-80 grayscale brightness-[2]"
                    alt="Certus Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-none">Certus Technical Search</span>
                  <span className="text-xs text-brand-silver/60 mt-1.5 font-medium tracking-wider uppercase">Technical Search & Recruitment</span>
                  <span className="text-[10px] text-gray-500 mt-1">{selectedPost.date}</span>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-gray-200 text-lg md:text-xl font-light leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                {typeof selectedPost.image === 'string' && selectedPost.image.trim() !== '' && (
                  <div className="rounded-sm overflow-hidden border border-white/10 bg-black/20">
                    <img 
                      src={selectedPost.image} 
                      alt="Post visual" 
                      className="w-full h-auto object-contain max-h-[500px] mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Removed */}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default LinkedInFeed;
