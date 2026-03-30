import React, { useState, useEffect } from 'react';
import { JobPosting, LinkedInPost } from '../types';
import { jobService } from '../services/jobService';
import { User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Briefcase, 
  Linkedin, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Download,
  ShieldCheck
} from 'lucide-react';

interface AdminPortalProps {
  onExit: () => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ onExit }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'linkedin'>('jobs');
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  
  const [editingJob, setEditingJob] = useState<Partial<JobPosting> | null>(null);
  const [editingPost, setEditingPost] = useState<Partial<LinkedInPost> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'job' | 'post', id: string | number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = jobService.onAuthChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await jobService.isAdmin(currentUser);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          fetchData();
        } else {
          setError('Access denied. You do not have administrator privileges.');
        }
      } else {
        setIsAdmin(false);
        setJobs([]);
        setLinkedinPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, postsData] = await Promise.all([
        jobService.getJobs(),
        jobService.getLinkedInPosts()
      ]);
      setJobs(jobsData);
      setLinkedinPosts(postsData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await jobService.login();
    } catch (err: any) {
      console.error('[AdminPortal] Login error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Login failed: Popup was blocked. Please allow popups for this site in your browser settings.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Login failed: This domain is not authorized in the Firebase Console. Please add "${window.location.hostname}" to the "Authorized domains" list in Firebase Authentication settings.`);
      } else {
        setError(`Login failed: ${err.message || 'Unknown error'}. Please check your browser settings and Firebase console.`);
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    jobService.logout();
  };

  const handleDeleteJob = (id: string | number) => {
    setDeleteError(null);
    setConfirmDelete({ type: 'job', id });
  };

  const executeDeleteJob = async (id: string | number) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await jobService.deleteJob(id);
      setJobs(jobs.filter(j => String(j.id) !== String(id)));
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError('Failed to delete job. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveJob = async () => {
    if (!editingJob) return;
    console.log('[AdminPortal] Saving job:', editingJob);
    setLoading(true);
    setError(null);
    try {
      await jobService.saveJob(editingJob as JobPosting);
      console.log('[AdminPortal] Job saved successfully');
      setEditingJob(null);
      fetchData();
    } catch (err: any) {
      console.error('[AdminPortal] Failed to save job:', err);
      setError(`Failed to save job: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = (id: string | number) => {
    setDeleteError(null);
    setConfirmDelete({ type: 'post', id });
  };

  const executeDeletePost = async (id: string | number) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await jobService.deleteLinkedInPost(String(id));
      setLinkedinPosts(linkedinPosts.filter(p => String(p.id) !== String(id)));
      setConfirmDelete(null);
    } catch (err) {
      setDeleteError('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    console.log('[AdminPortal] Saving post:', editingPost);
    setLoading(true);
    setError(null);
    try {
      await jobService.saveLinkedInPost(editingPost);
      console.log('[AdminPortal] Post saved successfully');
      setEditingPost(null);
      fetchData();
    } catch (err: any) {
      console.error('[AdminPortal] Failed to save post:', err);
      setError(`Failed to save post: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const val = row[header];
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJobs = () => {
    const exportData = jobs.map(({ id, responsibilities, requirements, ...rest }) => ({
      ...rest,
      responsibilities: responsibilities.join('; '),
      requirements: requirements.join('; ')
    }));
    exportToCSV(exportData, 'certus_jobs_export.csv');
  };

  const handleExportLinkedIn = () => {
    const exportData = linkedinPosts.map(({ id, avatar, ...rest }) => rest);
    exportToCSV(exportData, 'certus_linkedin_posts_export.csv');
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-brand-navy/30 border border-white/10 p-8 rounded-sm shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Internal <span className="text-brand-silver">Portal</span></h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Authorized Personnel Only</p>
          </div>
          
          <div className="space-y-6">
            {!user ? (
              <button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-100 text-black font-bold uppercase tracking-widest text-xs py-4 rounded-sm transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                  </>
                )}
              </button>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center gap-3 p-4 bg-red-400/5 border border-red-400/20 rounded-sm">
                  <ShieldCheck size={32} className="text-red-400" />
                  <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Access Denied</p>
                  <p className="text-gray-400 text-xs">
                    Logged in as <span className="text-white">{user.email}</span>. 
                    This account does not have administrator privileges.
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Sign out and try another account
                </button>
              </div>
            )}

            {error && !user && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            
            <button 
              onClick={onExit}
              className="w-full text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors pt-4"
            >
              Back to Public Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Admin Header */}
      <header className="bg-brand-navy/50 border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onExit}
              className="p-2 text-gray-500 hover:text-white transition-colors border border-white/10 rounded-sm"
              title="Back to Site"
            >
              <LayoutDashboard size={18} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">CERTUS<span className="text-brand-silver">ADMIN</span></h1>
          </div>
          <nav className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'jobs' ? 'text-brand-silver border-b-2 border-brand-silver' : 'text-gray-500 hover:text-white'}`}
            >
              Job Openings
            </button>
            <button 
              onClick={() => setActiveTab('linkedin')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'linkedin' ? 'text-brand-silver border-b-2 border-brand-silver' : 'text-gray-500 hover:text-white'}`}
            >
              Feed
            </button>
          </nav>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'jobs' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Manage <span className="text-brand-silver">Job Openings</span></h2>
                <p className="text-gray-500 text-sm mt-1">Add, edit or remove active mandates from the job board.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExportJobs}
                  className="bg-brand-navy/50 hover:bg-brand-navy text-white px-4 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-white/10"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button 
                  onClick={() => setEditingJob({ 
                    title: '', 
                    location: '', 
                    salary: '', 
                    summary: '', 
                    ref: `TRD-${Math.floor(Math.random() * 9000) + 1000}`,
                    type: 'Full-Time',
                    responsibilities: [],
                    requirements: []
                  })}
                  className="bg-brand-silver hover:bg-white text-black px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all"
                >
                  <Plus size={16} />
                  Post New Job
                </button>
              </div>
            </div>

            {loading && !editingJob ? (
              <div className="flex justify-center py-20">
                <Loader2 className="text-brand-silver animate-spin" size={40} />
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-brand-navy/20 border border-white/5 p-6 rounded-sm flex items-center justify-between group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-brand-silver/10 rounded-sm flex items-center justify-center text-brand-silver">
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.ref}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingJob(job)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Manage <span className="text-brand-silver">Feed</span></h2>
                <p className="text-gray-500 text-sm mt-1">Control the posts appearing on the Social section.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleExportLinkedIn}
                  className="bg-brand-navy/50 hover:bg-brand-navy text-white px-4 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-white/10"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button 
                  onClick={() => setEditingPost({ 
                    author: 'Tyler Ortolano', 
                    role: 'Managing Partner', 
                    content: '', 
                    image: '',
                    date: 'Just now',
                    avatar: 'https://res.cloudinary.com/dvbubqhpp/image/upload/v1710947667/tyler-avatar_eiabfr.jpg'
                  })}
                  className="bg-[#0077B5] hover:bg-white hover:text-[#0077B5] text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all"
                >
                  <Plus size={16} />
                  Add Post
                </button>
              </div>
            </div>

            {loading && !editingPost ? (
              <div className="flex justify-center py-20">
                <Loader2 className="text-brand-silver animate-spin" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {linkedinPosts.map(post => (
                  <div key={post.id} className="bg-brand-navy/20 border border-white/5 p-6 rounded-sm flex flex-col group hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-silver/10 rounded-full overflow-hidden">
                          <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm leading-none">{post.author}</h3>
                          <p className="text-[10px] text-gray-500 mt-1">{post.role} • {post.date}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-[12] whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.image && post.image.trim() !== '' && (
                      <div className="mt-4 rounded-sm overflow-hidden border border-white/5 bg-black/20">
                        <img src={post.image} alt="Post visual" className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Job Editor Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-dark border border-white/10 w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingJob.id ? 'Edit' : 'Post'} Job Mandate</h3>
              <button onClick={() => setEditingJob(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-sm">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Job Title</label>
                  <input 
                    type="text" 
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sector</label>
                  <input 
                    type="text" 
                    value="Skilled Trades & Operations"
                    disabled
                    className="w-full bg-brand-navy/10 border border-white/5 rounded-sm px-4 py-3 text-gray-500 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Location</label>
                  <input 
                    type="text" 
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                    className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Salary Range</label>
                  <input 
                    type="text" 
                    value={editingJob.salary}
                    onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                    className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reference ID</label>
                  <input 
                    type="text" 
                    value={editingJob.ref}
                    onChange={(e) => setEditingJob({...editingJob, ref: e.target.value})}
                    className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Job Type</label>
                  <input 
                    type="text" 
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({...editingJob, type: e.target.value})}
                    className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                    placeholder="Full-Time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Executive Summary</label>
                <textarea 
                  value={editingJob.summary}
                  onChange={(e) => setEditingJob({...editingJob, summary: e.target.value})}
                  rows={4}
                  className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-brand-navy/20 flex justify-end gap-4">
              <button 
                onClick={() => setEditingJob(null)}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveJob}
                disabled={loading}
                className="bg-brand-silver hover:bg-white text-black px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Mandate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-dark border border-white/10 w-full max-w-lg rounded-sm shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Insight</h3>
              <button onClick={() => setEditingPost(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-sm">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Post Content</label>
                <textarea 
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                  rows={6}
                  className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver resize-none"
                  placeholder="Share a market insight or success story..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={editingPost.image || ''}
                  onChange={(e) => setEditingPost({...editingPost, image: e.target.value})}
                  className="w-full bg-brand-navy/30 border border-white/10 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-silver"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-brand-navy/20 flex justify-end gap-4">
              <button 
                onClick={() => setEditingPost(null)}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePost}
                disabled={loading}
                className="bg-[#0077B5] hover:bg-white hover:text-[#0077B5] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Linkedin size={16} />}
                Publish Insight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-dark border border-white/10 w-full max-w-sm rounded-sm shadow-2xl p-8 text-center">
            <AlertCircle className={`mx-auto mb-4 ${deleteError ? 'text-red-500' : 'text-red-400'}`} size={48} />
            <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
            <p className="text-gray-400 text-sm mb-6">This action is permanent and cannot be undone. Are you sure you want to proceed?</p>
            
            {deleteError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  if (!isDeleting) setConfirmDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all border border-white/10 rounded-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => confirmDelete.type === 'job' ? executeDeleteJob(confirmDelete.id) : executeDeletePost(confirmDelete.id)}
                disabled={isDeleting}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-500 transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
