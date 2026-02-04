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

  // Function to close the resume viewer and cleanup blob URL
  const closeResumeViewer = () => {
    if (viewingResume && viewingResume.url && viewingResume.url.startsWith('blob:')) {
      URL.revokeObjectURL(viewingResume.url);
    }
    setShowResumeViewer(false);
    setViewingResume(null);
    setLoadingViewer(false);
  };

  // Function to switch between different PDF viewer modes
  const switchViewerMode = (mode) => {
    // Hide all viewers
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
    
    // Show selected viewer
    const activeViewer = document.getElementById(`${mode}-viewer`);
    if (activeViewer) {
      activeViewer.style.display = 'block';
    }
  };

  // Predefined company roles that students commonly apply for
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

  // Function to categorize roles for better organization
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

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email;
    }
    return null;
  };

  // Load user resumes on component mount
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
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.warning('File size should be less than 10MB');
        return;
      }
      setUploadForm({...uploadForm, file});
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
      
      // Reset form
      setUploadForm({ role: '', customRole: '', isCustomRole: false, file: null });
      setShowUploadForm(false);
      
      // Reload resumes
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
      
      // For PDF viewing, we'll use the direct URL but prevent automatic downloads
      let viewUrl = resume.fileUrl;
      
      // Check if the URL needs any modifications for better inline viewing
      if (viewUrl.includes('blob.core.windows.net')) {
        // Azure Blob Storage - ensure no download disposition
        console.log('Detected Azure Blob Storage URL');
        // Don't navigate directly to the URL to prevent download
      }
      
      console.log('Using view URL for iframe:', viewUrl);
      
      // Set the viewing resume without triggering a download
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
      
      // Open the download URL in a new tab
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
      
      // Reload resumes
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
    <div className="urms-container">
      <header className="urms-header">
        <h1>Unified Resume Management System</h1>
        <p>Upload, preview, and manage your resumes for different roles</p>
      </header>

      {/* Resume Summary */}
      {!loading && !error && resumes.length > 0 && (
        <div className="resume-summary">
          <div className="summary-card">
            <h3>Resume Portfolio</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{resumes.length}</span>
                <span className="stat-label">Total Resumes</span>
              </div>
              <div className="stat">
                <span className="stat-number">{[...new Set(resumes.map(r => r.role))].length}</span>
                <span className="stat-label">Different Roles</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="upload-section">
        <button 
          className="upload-btn"
          onClick={() => setShowUploadForm(true)}
          disabled={uploading}
        >
          <FaPlus /> Upload New Resume
        </button>
      </div>

      {/* Enhanced Upload Form Modal */}
      {showUploadForm && (
        <div className="modal-overlay" onClick={() => setShowUploadForm(false)}>
          <div className="enhanced-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-header">
              <h3>Upload New Resume</h3>
              <p>Add a role-specific resume to your portfolio</p>
            </div>
            
            <form onSubmit={handleUpload} className="enhanced-form">
              <div className="form-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <div className="form-group enhanced">
                    <label>
                      <span className="label-text">Target Role/Position</span>
                      <span className="label-required">*</span>
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={uploadForm.isCustomRole ? 'custom' : uploadForm.role}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            setUploadForm({...uploadForm, isCustomRole: true, role: ''});
                          } else {
                            setUploadForm({...uploadForm, isCustomRole: false, role: e.target.value, customRole: ''});
                          }
                        }}
                        required
                        className="enhanced-select"
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
                      <div className="custom-role-input">
                        <input
                          type="text"
                          placeholder="e.g., Machine Learning Intern, Cloud Architect..."
                          value={uploadForm.customRole}
                          onChange={(e) => setUploadForm({...uploadForm, customRole: e.target.value, role: e.target.value})}
                          required
                          className="enhanced-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <div className="form-group enhanced">
                    <label>
                      <span className="label-text">Resume Document</span>
                      <span className="label-required">*</span>
                      <span className="label-hint">PDF format, max 10MB</span>
                    </label>
                    
                    <div className="file-upload-area" 
                         onDrop={(e) => {
                           e.preventDefault();
                           const files = e.dataTransfer.files;
                           if (files[0]) handleFileSelect({target: {files}});
                         }}
                         onDragOver={(e) => e.preventDefault()}
                         onDragEnter={(e) => e.preventDefault()}>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        required
                        id="resume-file"
                        className="file-input-hidden"
                      />
                      
                      {!uploadForm.file ? (
                        <label htmlFor="resume-file" className="file-upload-label">
                          <div className="upload-icon">
                            <FaFilePdf />
                          </div>
                          <div className="upload-text">
                            <span className="upload-primary">Click to select or drag & drop</span>
                            <span className="upload-secondary">PDF files only, up to 10MB</span>
                          </div>
                        </label>
                      ) : (
                        <div className="file-selected">
                          <div className="file-icon">
                            <FaFilePdf />
                          </div>
                          <div className="file-details">
                            <span className="file-name">{uploadForm.file.name}</span>
                            <span className="file-size">{formatFileSize(uploadForm.file.size)}</span>
                          </div>
                          <button 
                            type="button" 
                            className="file-remove"
                            onClick={() => setUploadForm({...uploadForm, file: null})}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions enhanced">
                <button 
                  type="button" 
                  className="btn-secondary"
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
                  className="btn-primary"
                >
                  {uploading ? (
                    <>
                      <div className="spinner"></div>
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
        <div className="resume-viewer-overlay" onClick={closeResumeViewer}>
          <div className="resume-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="resume-viewer-header">
              <div className="resume-viewer-info">
                <h3>{viewingResume ? viewingResume.role : 'Loading...'}</h3>
                <p>{viewingResume ? viewingResume.fileName : 'Please wait'}</p>
              </div>
              <button 
                className="close-viewer-btn"
                onClick={closeResumeViewer}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="resume-viewer-content">
              {loadingViewer ? (
                <div className="viewer-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading PDF...</p>
                </div>
              ) : viewingResume && viewingResume.url ? (
                <div className="pdf-viewer-container">
                  <div className="pdf-viewer-tabs">
                    <button 
                      className="viewer-tab active" 
                      onClick={() => switchViewerMode('google')}
                      id="google-tab"
                    >
                      Google Viewer
                    </button>
                    <button 
                      className="viewer-tab" 
                      onClick={() => switchViewerMode('direct')}
                      id="direct-tab"
                    >
                      Direct View
                    </button>
                  </div>
                  
                  <div className="pdf-content">
                    {/* Google Docs Viewer - Usually most reliable and won't download */}
                    <iframe
                      id="google-viewer"
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingResume.url)}&embedded=true&v=1&format=pdf`}
                      title={`${viewingResume.role} Resume - Google Viewer`}
                      className="resume-iframe active-viewer"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin"
                    />
                    
                    {/* Direct PDF Viewer with embed parameters */}
                    <iframe
                      id="direct-viewer"
                      src={`${viewingResume.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=1&embedded=true`}
                      title={`${viewingResume.role} Resume - Direct`}
                      className="resume-iframe"
                      type="application/pdf"
                      allowFullScreen
                      style={{ display: 'none' }}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              ) : (
                <div className="viewer-error">
                  <p>Failed to load PDF</p>
                  <button onClick={closeResumeViewer}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your resumes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadUserResumes}>Retry</button>
        </div>
      )}

      {/* Resumes Grid */}
      {!loading && !error && (
        <div className="resumes-grid">
          {resumes.length === 0 ? (
            <div className="no-resumes">
              <FaFilePdf className="no-resumes-icon" />
              <h3>No resumes uploaded yet</h3>
              <p>Upload your first resume to get started</p>
            </div>
          ) : (
            resumes.map((resume) => (
              <div key={resume.id} className="resume-card">
                <div className="resume-header">
                  <FaFilePdf className="pdf-icon" />
                  <div className="resume-info">
                    <div className="role-header">
                      <h3>{resume.role}</h3>
                      <span 
                        className="role-badge" 
                        style={{ backgroundColor: getRoleCategory(resume.role).color }}
                      >
                        {getRoleCategory(resume.role).category}
                      </span>
                    </div>
                    <p className="filename">{resume.fileName}</p>
                    <p className="file-details">
                      {formatFileSize(resume.fileSize)} • {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="resume-actions">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => handleView(resume)}
                    title="View Resume"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn download-btn"
                    onClick={() => handleDownload(resume)}
                    title="Download Resume"
                  >
                    <FaDownload />
                  </button>
                  <button 
                    className="action-btn delete-btn"
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

      {/* Styles */}
      <style jsx>{`
        .urms-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .urms-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .urms-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .urms-header p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .resume-summary {
          margin-bottom: 2rem;
        }

        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 2rem;
          color: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .summary-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .upload-section {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .upload-btn {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-content h3 {
          margin-bottom: 1.5rem;
          color: #1e293b;
          font-size: 1.5rem;
        }

        .enhanced-upload-modal {
          background: #fff;
          border-radius: 16px;
          width: 90%;
          max-width: 580px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 1100;
          display: flex;
          flex-direction: column;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .file-info {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #f8fafc;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .form-actions button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .form-actions button[type="button"] {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .form-actions button[type="submit"] {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-left: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container p {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-container button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }

        .resumes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .no-resumes {
          grid-column: 1/-1;
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .no-resumes-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        .resume-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #e2e8f0;
        }

        .resume-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .resume-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .pdf-icon {
          font-size: 2rem;
          color: #dc2626;
          margin-top: 0.25rem;
        }

        .resume-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .role-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .role-header h3 {
          margin: 0;
          flex: 1;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filename {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .file-details {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .resume-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .download-btn {
          background: #10b981;
          color: white;
        }

        .download-btn:hover {
          background: #059669;
        }

        .delete-btn {
          background: #ef4444;
          color: white;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .view-btn {
          background: #3b82f6;
          color: white;
        }

        .view-btn:hover {
          background: #2563eb;
        }

        /* Resume Viewer Styles */
        .resume-viewer-overlay {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          padding: 1rem;
        }

        .resume-viewer-modal {
          width: 85vw;
          height: 80vh;
          max-width: 1000px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }

        .resume-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .resume-viewer-info h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .resume-viewer-info p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }

        .close-viewer-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .close-viewer-btn:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .resume-viewer-content {
          flex: 1;
          padding: 0;
          background: #f1f5f9;
        }

        .resume-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }

        .pdf-fallback {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
        }

        .pdf-fallback p {
          margin: 0 0 0.5rem 0;
          font-size: 0.8rem;
        }

        .pdf-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
        }

        .pdf-link:hover {
          color: #3b82f6;
          text-decoration: underline;
        }

        .viewer-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
        }

        .viewer-loading .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .viewer-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ef4444;
        }

        .viewer-error button {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .viewer-error button:hover {
          background: #dc2626;
        }

        .pdf-viewer-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .fallback-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .pdf-fallback-main {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8fafc;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
        }

        .fallback-content {
          text-align: center;
          padding: 2rem;
        }

        .fallback-content h3 {
          color: #374151;
          margin-bottom: 1rem;
        }

        .fallback-content p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .fallback-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          display: inline-block;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .pdf-viewer-tabs {
          display: flex;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 0;
          background: #f9fafb;
        }

        .viewer-tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .viewer-tab:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .viewer-tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: white;
        }

        .pdf-content {
          height: calc(100% - 50px);
          position: relative;
        }

        .active-viewer {
          display: block !important;
        }

        .download-option {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f8fafc;
        }

        .download-content {
          text-align: center;
          padding: 2rem;
        }

        .pdf-icon-large {
          font-size: 4rem;
          color: #ef4444;
          margin-bottom: 1rem;
        }

        .download-content h3 {
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .download-content p {
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .download-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .download-actions .btn-primary,
        .download-actions .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Enhanced Upload Form Styles */
        .upload-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
          border-radius: 16px 16px 0 0;
        }

        .upload-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .upload-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }

        .upload-body {
          padding: 0;
        }

        .enhanced-form {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 2rem;
        }

        .form-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .step-content {
          flex: 1;
        }

        .form-group.enhanced {
          margin-bottom: 0;
        }

        .form-group.enhanced label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #1e293b;
        }

        .label-text {
          font-size: 1rem;
        }

        .label-required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .label-hint {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 400;
          margin-left: 0.5rem;
        }

        .select-wrapper {
          position: relative;
        }

        .enhanced-select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          background: white;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25rem;
          padding-right: 3rem;
        }

        .enhanced-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .custom-role-input {
          margin-top: 0.75rem;
        }

        .enhanced-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .enhanced-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .file-upload-label {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .upload-icon {
          font-size: 3rem;
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .file-upload-area:hover .upload-icon {
          color: #667eea;
        }

        .upload-text {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
        }

        .upload-primary {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .upload-secondary {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: #f0f9ff;
          border: 2px solid #bae6fd;
          border-radius: 12px;
          width: 100%;
        }

        .file-icon {
          font-size: 2.5rem;
          color: #0ea5e9;
          flex-shrink: 0;
        }

        .file-details {
          flex: 1;
          text-align: left;
        }

        .file-name {
          display: block;
          font-weight: 600;
          color: #0c4a6e;
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .file-size {
          display: block;
          font-size: 0.875rem;
          color: #0369a1;
        }

        .file-remove {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .file-remove:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .form-actions.enhanced {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem 2rem;
          background: #f8fafc;
          margin: 1.5rem -2rem 0;
          border-top: 1px solid #e2e8f0;
          border-radius: 0 0 16px 16px;
        }

        .form-actions.enhanced button {
          padding: 0.875rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #64748b;
          border: 2px solid #e2e8f0 !important;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-left: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .upload-step {
          margin-bottom: 2rem;
          position: relative;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .step-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .role-group {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
          cursor: pointer;
          background: white;
        }

        .role-group:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .role-group.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }

        .role-group-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .role-emoji {
          font-size: 1.5rem;
        }

        .role-category {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
        }

        .role-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .role-tag {
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .role-group.selected .role-tag {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .file-upload-area {
          border: 3px dashed #cbd5e1;
          border-radius: 12px;
          padding: 2.5rem 2rem;
          text-align: center;
          background: #f8fafc;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-upload-area:hover,
        .file-upload-area.drag-active {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .file-upload-icon {
          font-size: 3rem;
          color: #9ca3af;
          margin-bottom: 1rem;
          transition: color 0.3s ease;
        }

        .file-upload-area:hover .file-upload-icon,
        .file-upload-area.drag-active .file-upload-icon {
          color: #667eea;
        }

        .file-upload-text {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
        }

        .file-upload-subtext {
          margin: 0;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .file-input-hidden {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .selected-file {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .file-icon {
          font-size: 2rem;
          color: #0ea5e9;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 600;
          color: #0c4a6e;
          margin: 0 0 0.25rem 0;
        }

        .file-size {
          font-size: 0.875rem;
          color: #0369a1;
          margin: 0;
        }

        .remove-file-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-file-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .enhanced-form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 2rem;
        }

        .enhanced-form-actions button {
          padding: 0.875rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .enhanced-form-actions .cancel-btn {
          background: #f8fafc;
          color: #64748b;
          border: 2px solid #e2e8f0;
        }

        .enhanced-form-actions .cancel-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .enhanced-form-actions .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
        }

        .enhanced-form-actions .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.4);
        }

        .enhanced-form-actions .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          z-index: 10;
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner-large {
          width: 50px;
          height: 50px;
          border: 4px solid #e5e7eb;
          border-left: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .loading-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .resumes-grid {
            grid-template-columns: 1fr;
          }
          
          .urms-header h1 {
            font-size: 2rem;
          }
          
          .modal-content {
            margin: 1rem;
          }

          .enhanced-upload-modal {
            width: 95%;
            max-height: 90vh;
          }

          .upload-header {
            padding: 1.5rem;
          }

          .upload-header h3 {
            font-size: 1.5rem;
          }

          .upload-body {
            padding: 1.5rem;
          }

          .role-grid {
            grid-template-columns: 1fr;
          }

          .file-upload-area {
            padding: 1.5rem;
          }

          .file-upload-icon {
            font-size: 2.5rem;
          }

          .enhanced-form-actions {
            flex-direction: column;
          }

          .enhanced-form-actions button {
            width: 100%;
            justify-content: center;
          }

          .resume-viewer-modal {
            width: 95vw;
            height: 95vh;
            margin: 2.5vh 2.5vw;
          }

          .resume-viewer-header {
            padding: 1rem;
          }

          .resume-viewer-info h3 {
            font-size: 1.1rem;
          }

          .close-viewer-btn {
            padding: 0.5rem;
          }

          .resume-actions {
            gap: 0.25rem;
          }

          .action-btn {
            padding: 0.4rem;
            font-size: 0.875rem;
          }

          .pdf-viewer-tabs {
            flex-wrap: wrap;
          }

          .viewer-tab {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            flex: 1;
            min-width: 80px;
          }

          .download-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
