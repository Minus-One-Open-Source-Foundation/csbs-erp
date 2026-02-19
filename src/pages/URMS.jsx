import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUpload, FaDownload, FaTrash, FaFilePdf, FaPlus, FaEye, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import { resumeAPI } from "../services/api";

export default function URMS() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [viewingResume, setViewingResume] = useState(null);
  const [loadingViewer, setLoadingViewer] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    role: '',
    customRole: '',
    isCustomRole: false,
    file: null
  });

  const closeResumeViewer = () => {
    if (viewingResume && viewingResume.url && viewingResume.url.startsWith('blob:')) {
      URL.revokeObjectURL(viewingResume.url);
    }
    setShowResumeViewer(false);
    setViewingResume(null);
    setLoadingViewer(false);
  };

  const switchViewerMode = (mode) => {
    const viewers = ['google-viewer', 'direct-viewer'];
    const tabs = ['google-tab', 'direct-tab'];

    viewers.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });

    tabs.forEach((id, index) => {
      const tab = document.getElementById(id);
      if (tab) {
        tab.classList.remove('active');
        if (tabs[index] === `${mode}-tab`) {
          tab.classList.add('active');
        }
      }
    });

    const activeViewer = document.getElementById(`${mode}-viewer`);
    if (activeViewer) {
      activeViewer.style.display = 'block';
    }
  };

  const predefinedRoles = [
    'Software Development Engineer (SDE)',
    'Software Development Engineer in Test (SDET)',
    'Data Analyst',
    'Data Scientist',
    'Business Analyst',
    'Product Manager',
    'UI/UX Designer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Quality Assurance Engineer',
    'Technical Writer',
    'Sales Executive',
    'Marketing Analyst',
    'Financial Analyst',
    'Human Resources Specialist',
    'Consultant',
    'Research Analyst'
  ];

  const getRoleCategory = (role) => {
    const roleUpper = role.toUpperCase();
    if (roleUpper.includes('SOFTWARE') || roleUpper.includes('SDE') || roleUpper.includes('DEVELOPER')) {
      return { category: 'Engineering', color: '#3b82f6' };
    } else if (roleUpper.includes('DATA') || roleUpper.includes('ANALYST') || roleUpper.includes('SCIENTIST')) {
      return { category: 'Analytics', color: '#8b5cf6' };
    } else if (roleUpper.includes('DESIGN') || roleUpper.includes('UI') || roleUpper.includes('UX')) {
      return { category: 'Design', color: '#ec4899' };
    } else if (roleUpper.includes('MARKETING') || roleUpper.includes('SALES')) {
      return { category: 'Sales & Marketing', color: '#f59e0b' };
    } else if (roleUpper.includes('FINANCIAL') || roleUpper.includes('FINANCE')) {
      return { category: 'Finance', color: '#10b981' };
    } else if (roleUpper.includes('HUMAN') || roleUpper.includes('HR')) {
      return { category: 'HR', color: '#ef4444' };
    } else if (roleUpper.includes('PRODUCT') || roleUpper.includes('MANAGER')) {
      return { category: 'Management', color: '#6366f1' };
    } else {
      return { category: 'Other', color: '#64748b' };
    }
  };

  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email;
    }
    return null;
  };

  useEffect(() => {
    loadUserResumes();
  }, []);

  const loadUserResumes = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        setError('Please log in to view your resumes');
        return;
      }

      const resumesData = await resumeAPI.getUserResumes(userEmail);
      setResumes(resumesData);
      setError(null);
    } catch (err) {
      console.error('Error loading resumes:', err);
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.warning('Please select a PDF file only');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('File size should be less than 10MB');
        return;
      }
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.role.trim()) {
      toast.warning('Please select or enter a role');
      return;
    }

    if (!uploadForm.file) {
      toast.warning('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      const userEmail = getUserEmail();

      await resumeAPI.uploadResume(userEmail, uploadForm.role.trim(), uploadForm.file);

      setUploadForm({ role: '', customRole: '', isCustomRole: false, file: null });
      setShowUploadForm(false);

      await loadUserResumes();

      toast.success('Resume uploaded successfully!');
    } catch (err) {
      console.error('Error uploading resume:', err);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (resume) => {
    try {
      console.log('Viewing resume:', resume);
      console.log('File URL:', resume.fileUrl);

      setLoadingViewer(true);
      setShowResumeViewer(true);

      let viewUrl = resume.fileUrl;

      if (viewUrl.includes('blob.core.windows.net')) {
        console.log('Detected Azure Blob Storage URL');
      }

      console.log('Using view URL for iframe:', viewUrl);

      setViewingResume({ ...resume, url: viewUrl });
      setLoadingViewer(false);

    } catch (err) {
      console.error('Error loading resume for view:', err);
      setLoadingViewer(false);
      setShowResumeViewer(false);
      toast.error('Failed to load resume for viewing. Please try downloading it instead.');
    }
  };

  const handleDownload = async (resume) => {
    try {
      const userEmail = getUserEmail();
      const downloadUrl = await resumeAPI.getDownloadUrl(userEmail, resume.id);
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Error downloading resume:', err);
      toast.error('Failed to download resume. Please try again.');
    }
  };

  const handleDelete = async (resume) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the resume for "${resume.role}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const userEmail = getUserEmail();
      await resumeAPI.deleteResume(userEmail, resume.id);
      await loadUserResumes();
      toast.success('Resume deleted successfully');
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast.error('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto font-sans max-md:p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-[2.5rem] font-bold text-slate-800 mb-2 max-md:text-[2rem]">Unified Resume Management System</h1>
        <p className="text-slate-500 text-[1.1rem]">Upload, preview, and manage your resumes for different roles</p>
      </header>

      {/* Resume Summary */}
      {!loading && !error && resumes.length > 0 && (
        <div className="mb-8">
          <div
            className="rounded-xl p-8 text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <h3 className="m-0 mb-6 text-2xl font-semibold">Resume Portfolio</h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-8">
              <div className="text-center">
                <span className="block text-[2.5rem] font-bold mb-1">{resumes.length}</span>
                <span className="text-[0.9rem] opacity-90 uppercase tracking-wider">Total Resumes</span>
              </div>
              <div className="text-center">
                <span className="block text-[2.5rem] font-bold mb-1">{[...new Set(resumes.map(r => r.role))].length}</span>
                <span className="text-[0.9rem] opacity-90 uppercase tracking-wider">Different Roles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center mb-8">
        <button
          className="text-white border-none py-4 px-8 rounded-[10px] text-base font-semibold cursor-pointer flex items-center gap-2 transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}
          onClick={() => setShowUploadForm(true)}
          disabled={uploading}
        >
          <FaPlus /> Upload New Resume
        </button>
      </div>

      {/* Enhanced Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={() => setShowUploadForm(false)}>
          <div
            className="bg-white rounded-2xl w-[90%] max-w-[580px] max-h-[90vh] overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] relative z-[1100] flex flex-col max-md:w-[95%]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Upload Header */}
            <div
              className="text-white p-8 text-center rounded-t-2xl max-md:p-6"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <h3 className="m-0 mb-2 text-[1.75rem] font-bold max-md:text-2xl">Upload New Resume</h3>
              <p className="m-0 opacity-90 text-base">Add a role-specific resume to your portfolio</p>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-0 p-8">
              {/* Step 1: Role Selection */}
              <div className="flex items-start gap-4 mb-8">
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-base shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  1
                </div>
                <div className="flex-1">
                  <div className="mb-0">
                    <label className="block mb-3 font-semibold text-slate-800">
                      <span className="text-base">Target Role/Position</span>
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={uploadForm.isCustomRole ? 'custom' : uploadForm.role}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setUploadForm({ ...uploadForm, isCustomRole: true, role: '' });
                          } else {
                            setUploadForm({ ...uploadForm, isCustomRole: false, role: e.target.value, customRole: '' });
                          }
                        }}
                        required
                        className="w-full py-3.5 px-4 border-2 border-slate-200 rounded-[10px] text-base bg-white text-slate-800 cursor-pointer transition-all duration-200 appearance-none pr-12 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25rem'
                        }}
                      >
                        <option value="">Choose your target role...</option>
                        <optgroup label="🚀 Engineering">
                          <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                          <option value="Software Development Engineer in Test (SDET)">Software Development Engineer in Test (SDET)</option>
                          <option value="Frontend Developer">Frontend Developer</option>
                          <option value="Backend Developer">Backend Developer</option>
                          <option value="Full Stack Developer">Full Stack Developer</option>
                          <option value="DevOps Engineer">DevOps Engineer</option>
                        </optgroup>
                        <optgroup label="📊 Data & Analytics">
                          <option value="Data Analyst">Data Analyst</option>
                          <option value="Data Scientist">Data Scientist</option>
                          <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                        </optgroup>
                        <optgroup label="🎨 Design & Product">
                          <option value="UI/UX Designer">UI/UX Designer</option>
                          <option value="Product Manager">Product Manager</option>
                        </optgroup>
                        <optgroup label="💼 Business & Marketing">
                          <option value="Business Analyst">Business Analyst</option>
                          <option value="Sales Executive">Sales Executive</option>
                          <option value="Marketing Analyst">Marketing Analyst</option>
                        </optgroup>
                        <optgroup label="🔧 Other Roles">
                          <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
                          <option value="Technical Writer">Technical Writer</option>
                          <option value="Financial Analyst">Financial Analyst</option>
                          <option value="Human Resources Specialist">Human Resources Specialist</option>
                          <option value="Consultant">Consultant</option>
                          <option value="Research Analyst">Research Analyst</option>
                        </optgroup>
                        <option value="custom">✏️ Custom Role (Type your own)</option>
                      </select>
                    </div>

                    {uploadForm.isCustomRole && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="e.g., Machine Learning Intern, Cloud Architect..."
                          value={uploadForm.customRole}
                          onChange={(e) => setUploadForm({ ...uploadForm, customRole: e.target.value, role: e.target.value })}
                          required
                          className="w-full py-3.5 px-4 border-2 border-slate-200 rounded-[10px] text-base transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: File Upload */}
              <div className="flex items-start gap-4 mb-8">
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-base shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  2
                </div>
                <div className="flex-1">
                  <div className="mb-0">
                    <label className="block mb-3 font-semibold text-slate-800">
                      <span className="text-base">Resume Document</span>
                      <span className="text-red-500 ml-1">*</span>
                      <span className="text-[0.875rem] text-slate-500 font-normal ml-2">PDF format, max 10MB</span>
                    </label>

                    <div
                      className="border-[3px] border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50 transition-all duration-300 cursor-pointer relative min-h-[140px] flex items-center justify-center hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-md max-md:p-6"
                      onDrop={(e) => {
                        e.preventDefault();
                        const files = e.dataTransfer.files;
                        if (files[0]) handleFileSelect({ target: { files } });
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        required
                        id="resume-file"
                        className="absolute opacity-0 pointer-events-none"
                      />

                      {!uploadForm.file ? (
                        <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center gap-4 w-full">
                          <div className="text-[3rem] text-gray-400 transition-colors duration-300">
                            <FaFilePdf />
                          </div>
                          <div className="flex flex-col gap-2 text-center">
                            <span className="text-[1.125rem] font-semibold text-gray-700">Click to select or drag & drop</span>
                            <span className="text-[0.9rem] text-gray-500">PDF files only, up to 10MB</span>
                          </div>
                        </label>
                      ) : (
                        <div className="flex items-center gap-4 p-5 bg-sky-50 border-2 border-sky-200 rounded-xl w-full">
                          <div className="text-[2.5rem] text-sky-500 shrink-0">
                            <FaFilePdf />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="block font-semibold text-sky-900 mb-1 text-base">{uploadForm.file.name}</span>
                            <span className="block text-[0.875rem] text-sky-700">{formatFileSize(uploadForm.file.size)}</span>
                          </div>
                          <button
                            type="button"
                            className="bg-red-500 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 hover:bg-red-600 hover:scale-110"
                            onClick={() => setUploadForm({ ...uploadForm, file: null })}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end py-6 px-8 bg-slate-50 -mx-8 -mb-8 mt-6 border-t border-slate-200 rounded-b-2xl max-md:flex-col">
                <button
                  type="button"
                  className="py-3.5 px-8 rounded-[10px] font-semibold text-base cursor-pointer transition-all duration-200 flex items-center gap-2 border-2 border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 max-md:w-full max-md:justify-center"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadForm({ role: '', customRole: '', isCustomRole: false, file: null });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadForm.file || !uploadForm.role}
                  className="py-3.5 px-8 rounded-[10px] font-semibold text-base cursor-pointer transition-all duration-200 flex items-center gap-2 border-none text-white shadow-[0_4px_14px_rgba(102,126,234,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none max-md:w-full max-md:justify-center"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-l-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Upload Resume
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {showResumeViewer && (
        <div className="fixed top-[60px] left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm p-4" onClick={closeResumeViewer}>
          <div className="w-[85vw] h-[80vh] max-w-[1000px] bg-white rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col my-8 max-md:w-[95vw] max-md:h-[95vh] max-md:my-[2.5vh]" onClick={(e) => e.stopPropagation()}>
            {/* Viewer Header */}
            <div className="flex justify-between items-center py-6 px-8 bg-slate-50 border-b border-slate-200 max-md:p-4">
              <div>
                <h3 className="m-0 text-[1.25rem] font-semibold text-slate-800 max-md:text-[1.1rem]">{viewingResume ? viewingResume.role : 'Loading...'}</h3>
                <p className="mt-1 mb-0 text-[0.875rem] text-slate-500">{viewingResume ? viewingResume.fileName : 'Please wait'}</p>
              </div>
              <button
                className="bg-red-500 text-white border-none rounded-lg p-3 cursor-pointer transition-all duration-200 flex items-center justify-center text-base hover:bg-red-600 hover:scale-105 max-md:p-2"
                onClick={closeResumeViewer}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 p-0 bg-slate-100">
              {loadingViewer ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p>Loading PDF...</p>
                </div>
              ) : viewingResume && viewingResume.url ? (
                <div className="w-full h-full relative">
                  {/* Viewer Tabs */}
                  <div className="flex border-b-2 border-gray-200 bg-gray-50 max-md:flex-wrap">
                    <button
                      className="py-3 px-6 border-none bg-white text-blue-500 cursor-pointer font-medium border-b-2 border-b-blue-500 transition-all duration-200 max-md:py-2 max-md:px-4 max-md:text-[0.9rem] max-md:flex-1 max-md:min-w-[80px]"
                      onClick={() => switchViewerMode('google')}
                      id="google-tab"
                    >
                      Google Viewer
                    </button>
                    <button
                      className="py-3 px-6 border-none bg-transparent text-gray-500 cursor-pointer font-medium border-b-2 border-b-transparent transition-all duration-200 hover:text-gray-700 hover:bg-gray-100 max-md:py-2 max-md:px-4 max-md:text-[0.9rem] max-md:flex-1 max-md:min-w-[80px]"
                      onClick={() => switchViewerMode('direct')}
                      id="direct-tab"
                    >
                      Direct View
                    </button>
                  </div>

                  <div className="h-[calc(100%-50px)] relative">
                    {/* Google Docs Viewer */}
                    <iframe
                      id="google-viewer"
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingResume.url)}&embedded=true&v=1&format=pdf`}
                      title={`${viewingResume.role} Resume - Google Viewer`}
                      className="w-full h-full border-none bg-white block"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin"
                    />

                    {/* Direct PDF Viewer */}
                    <iframe
                      id="direct-viewer"
                      src={`${viewingResume.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=1&embedded=true`}
                      title={`${viewingResume.role} Resume - Direct`}
                      className="w-full h-full border-none bg-white"
                      type="application/pdf"
                      allowFullScreen
                      style={{ display: 'none' }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <p>Failed to load PDF</p>
                  <button
                    onClick={closeResumeViewer}
                    className="mt-4 py-2 px-4 bg-red-500 text-white border-none rounded-md cursor-pointer hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-l-indigo-500 rounded-full animate-spin mb-4"></div>
          <p>Loading your resumes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadUserResumes}
            className="bg-red-600 text-white border-none py-3 px-6 rounded-lg cursor-pointer hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Resumes Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 max-md:grid-cols-1">
          {resumes.length === 0 ? (
            <div className="col-span-full text-center p-12 text-slate-500">
              <FaFilePdf className="text-[4rem] mb-4 text-slate-300 mx-auto" />
              <h3>No resumes uploaded yet</h3>
              <p>Upload your first resume to get started</p>
            </div>
          ) : (
            resumes.map((resume) => (
              <div key={resume.id} className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-200 border border-slate-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
                <div className="flex items-start gap-4 mb-4">
                  <FaFilePdf className="text-[2rem] text-red-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[1.25rem] font-semibold text-slate-800 m-0 flex-1">{resume.role}</h3>
                      <span
                        className="py-1 px-3 rounded-[20px] text-[0.75rem] font-medium text-white uppercase tracking-wider"
                        style={{ backgroundColor: getRoleCategory(resume.role).color }}
                      >
                        {getRoleCategory(resume.role).category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[0.9rem] mb-1">{resume.fileName}</p>
                    <p className="text-slate-400 text-[0.8rem]">
                      {formatFileSize(resume.fileSize)} • {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end max-md:gap-1">
                  <button
                    className="p-2 rounded-md border-none cursor-pointer transition-all duration-200 flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 max-md:p-1.5 max-md:text-[0.875rem]"
                    onClick={() => handleView(resume)}
                    title="View Resume"
                  >
                    <FaEye />
                  </button>
                  <button
                    className="p-2 rounded-md border-none cursor-pointer transition-all duration-200 flex items-center justify-center bg-emerald-500 text-white hover:bg-emerald-600 max-md:p-1.5 max-md:text-[0.875rem]"
                    onClick={() => handleDownload(resume)}
                    title="Download Resume"
                  >
                    <FaDownload />
                  </button>
                  <button
                    className="p-2 rounded-md border-none cursor-pointer transition-all duration-200 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 max-md:p-1.5 max-md:text-[0.875rem]"
                    onClick={() => handleDelete(resume)}
                    title="Delete Resume"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
