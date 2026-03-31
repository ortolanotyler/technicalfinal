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
      if (window.innerWidth >= 1280) setVisibleItems(4);
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
    if (currentIndex > maxIdx) {
      setCurrentIndex(maxIdx);
    }
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
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      nextPost();
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      prevPost();
    }
  };

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPost]);

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
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">LinkedIn</h2>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-end">
            <a 
              href="https://www.linkedin.com/showcase/certus-technical-search/" 
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
            <div className="overflow-hidden px-1 touch-pan-y">
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
                  width: `${(posts.length * 100) / visibleItems}%`
                }}
              >
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="w-full px-3 md:px-4"
                    style={{ flex: `0 0 ${100 / posts.length}%` }}
                  >
                    <div 
                      onClick={() => setSelectedPost(post)}
                      className="bg-brand-navy/20 border border-white/5 rounded-sm overflow-hidden flex flex-col h-full group hover:border-brand-silver/30 transition-all duration-500 cursor-pointer"
                    >
                      {/* Post Content */}
                      <div className="p-5 flex-grow flex flex-col">
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
                            </div>
                          </div>
                          <Linkedin size={14} className="text-[#0077B5]" />
                        </div>
                        
                        <p className="text-gray-300 text-xs font-light leading-relaxed mb-4 line-clamp-[5] whitespace-pre-wrap">
                          {post.content}
                        </p>

                        {/* Post Image */}
                        {typeof post.image === 'string' && post.image.trim() !== '' && (
                          <div className="w-full overflow-hidden rounded-sm mb-4 border border-white/5 bg-black/20 mt-auto">
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
            
            {/* Carousel Navigation Arrows */}
            {posts.length > visibleItems && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <button 
                  onClick={prevPost}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-brand-silver/50 transition-all active:scale-95"
                  aria-label="Previous post"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextPost}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-brand-silver/50 transition-all active:scale-95"
                  aria-label="Next post"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6 bg-black/95 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-brand-dark border border-white/10 w-full max-w-xl max-h-[85vh] md:max-h-[80vh] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-brand-navy/20 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#0077B5] flex items-center justify-center rounded-sm">
                  <Linkedin className="text-white" size={14} fill="currentColor" />
                </div>
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Post</span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)} 
                className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src="https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png" 
                    className="w-5 h-5 opacity-80 grayscale brightness-[2]"
                    alt="Certus Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">Certus Technical Search</span>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-gray-200 text-sm md:text-[15px] font-light leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>

                {typeof selectedPost.image === 'string' && selectedPost.image.trim() !== '' && (
                  <div className="rounded-sm overflow-hidden border border-white/10 bg-black/20">
                    <img 
                      src={selectedPost.image} 
                      alt="Post visual" 
                      className="w-full h-auto object-contain max-h-[35vh] mx-auto"
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
