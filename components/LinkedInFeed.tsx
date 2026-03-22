import React, { useState, useEffect } from 'react';
import { Linkedin, ExternalLink, Loader2, X } from 'lucide-react';
import { Domain, Section, LinkedInPost } from '../types';
import { jobService } from '../services/jobService';

interface LinkedInFeedProps {
  domain: Domain;
}

const LinkedInFeed: React.FC<LinkedInFeedProps> = ({ domain }) => {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const data = await jobService.getLinkedInPosts();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <section id={Section.INSIGHTS} className="py-24 bg-brand-dark relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-silver/[0.02] -skew-x-12 transform translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#0077B5] flex items-center justify-center rounded-sm shadow-lg shadow-[#0077B5]/20">
                <Linkedin className="text-white" size={24} fill="currentColor" />
              </div>
              <span className="text-brand-silver text-xs font-bold uppercase tracking-[0.4em]">Market Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-medium text-white tracking-tighter leading-none">
              LinkedIn <span className="text-brand-silver italic font-serif font-light">Insights</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-end gap-4">
            <a 
              href="https://www.linkedin.com/company/certus-group-executive-search" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white hover:text-brand-silver transition-colors"
            >
              Follow our Network
              <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
            <div className="h-px w-24 bg-white/20"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-silver animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="bg-brand-navy/20 border border-white/5 rounded-sm overflow-hidden flex flex-col group hover:border-brand-silver/30 transition-all duration-500 cursor-pointer"
              >
                {/* Post Content */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-silver/10 rounded-full flex items-center justify-center text-brand-silver font-bold text-[10px] overflow-hidden">
                        {post.avatar ? (
                          <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          "CG"
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-none">{post.author}</span>
                        <span className="text-[10px] text-gray-500 mt-1">{post.date}</span>
                      </div>
                    </div>
                    <Linkedin size={14} className="text-[#0077B5]" />
                  </div>
                  
                  <p className="text-gray-300 text-sm font-light leading-relaxed mb-6 line-clamp-4">
                    {post.content}
                  </p>

                  {/* Post Image - Now under the text */}
                  {typeof post.image === 'string' && post.image.trim() !== '' && (
                    <div className="aspect-video overflow-hidden rounded-sm mb-6 border border-white/5">
                      <img 
                        src={post.image} 
                        alt="Post visual" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center text-gray-500">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-brand-silver/50">
                      Insight Shared
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                <div className="w-12 h-12 bg-brand-silver/10 rounded-full flex items-center justify-center text-brand-silver font-bold text-sm overflow-hidden border border-brand-silver/20">
                  {selectedPost.avatar ? (
                    <img src={selectedPost.avatar} alt={selectedPost.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    "CG"
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white leading-none">{selectedPost.author}</span>
                  <span className="text-xs text-brand-silver/60 mt-1.5 font-medium tracking-wider uppercase">{selectedPost.role || 'Certus Group Insight'}</span>
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

            <div className="p-6 border-t border-white/10 bg-brand-navy/20 flex justify-between items-center">
              <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-silver/40">
                © Certus Group Intelligence
              </div>
              <a 
                href="https://www.linkedin.com/company/certus-group-executive-search" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#0077B5] hover:bg-white hover:text-[#0077B5] text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-[#0077B5]/20"
              >
                View on LinkedIn
              </a>
            </div>
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
