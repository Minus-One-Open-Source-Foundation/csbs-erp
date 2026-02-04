import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrophy, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { achievementAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Achievements() {
  console.log('🎯 Achievements component initialized');
  
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    category: "SYMPOSIUM",
    description: "",
    image: null,
  });

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('📧 User email retrieved:', user.email);
      return user.email;
    }
    console.warn('⚠️ No user data found in localStorage');
    return null;
  };

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const result = await achievementAPI.testConnection();
      if (result.success) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.error('❌ Backend test failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connectivity test error:', error);
      return false;
    }
  };

  // Fetch user achievements on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      // First test backend connectivity
      const isBackendReachable = await testBackendConnection();
      
      if (isBackendReachable) {
        fetchUserAchievements();
      } else {
        setLoading(false);
        setError(`Cannot connect to the backend server. Please ensure the server is running on ${import.meta.env.VITE_API_URL || 'the configured API URL'}`);
      }
    };

    initializeComponent();
  }, []);

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      console.log('Fetching achievements for user:', userEmail);
      
      if (!userEmail) {
        setError('Please log in to view your achievements');
        return;
      }

      const userAchievements = await achievementAPI.getUserAchievements(userEmail);
      console.log('Fetched achievements:', userAchievements);
      
      if (userAchievements && userAchievements.length > 0) {
        // Debug: Log all achievement categories
        const categories = userAchievements.map(ach => ach.category);
        console.log('🏷️ Achievement categories found:', categories);
        console.log('📋 Sample achievement data:', userAchievements[0]);
      }
      
      setAchievements(userAchievements);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // More specific error messages
      if (err.response?.status === 404) {
        setError('Achievement service not found. Please check if the backend server is running.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError(`Cannot connect to server. Please check if the backend is running on ${import.meta.env.VITE_API_URL || 'the configured API URL'}`);
      } else {
        setError(`Failed to load achievements: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const saveAchievement = async () => {
    try {
      if (!formData.title.trim()) {
        toast.warning("Please enter a title!");
        return;
      }

      setSubmitting(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        toast.error('Please log in to submit an achievement');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('userEmail', userEmail);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Debug: Log what we're sending
      console.log('📤 Submitting achievement data:');
      console.log('- Title:', formData.title);
      console.log('- Category:', formData.category);
      console.log('- Description:', formData.description);
      console.log('- User Email:', userEmail);
      console.log('- Has Image:', !!formData.image);

      // Submit to backend
      const response = await achievementAPI.createAchievement(submitData);
      
      if (response.success) {
        // Refresh the achievements list
        await fetchUserAchievements();
        setShowForm(false);
        setFormData({
          title: "",
          category: "SYMPOSIUM",
          description: "",
          image: null,
        });
        toast.success('Achievement submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit achievement');
      }
    } catch (err) {
      console.error('Error submitting achievement:', err);
      toast.error('Failed to submit achievement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAchievements = achievements.filter(
    (ach) => {
      const categoryMatch = activeCategory === "All" || ach.category === activeCategory;
      const searchMatch = ach.title.toLowerCase().includes(search.toLowerCase()) ||
        ach.category.toLowerCase().includes(search.toLowerCase()) ||
        (ach.description && ach.description.toLowerCase().includes(search.toLowerCase()));
      
      // Debug logging for filtering
      if (activeCategory !== "All") {
        console.log(`🔍 Filtering: "${ach.title}" - Category: "${ach.category}" vs Active: "${activeCategory}" - Match: ${categoryMatch}`);
      }
      
      return categoryMatch && searchMatch;
    }
  );

  // Debug: Log filtered results
  console.log(`📊 Filtered ${filteredAchievements.length} achievements for category: ${activeCategory}`);

  const categories = ["All", "SYMPOSIUM", "ACADEMIC", "CERTIFICATIONS", "OTHERS"];
  const categoryLabels = {
    "All": "All",
    "SYMPOSIUM": "Symposium",
    "ACADEMIC": "Academic",
    "CERTIFICATIONS": "Certifications", 
    "OTHERS": "Others"
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="achievements-wrapper">
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.9)", borderRadius: "8px", margin: "2rem auto", maxWidth: "400px" }}>
          <FaSpinner className="spinner" style={{ fontSize: "2rem", color: "#007bff" }} />
          <p style={{ fontSize: "1.1rem", color: "#495057", margin: "1rem 0 0.5rem 0" }}>Loading your achievements...</p>
          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            Connecting to server and fetching your data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-wrapper">
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.9)", borderRadius: "8px", margin: "2rem auto", maxWidth: "600px" }}>
          <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>⚠️ Connection Error</h2>
          <p style={{ color: "#dc3545", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
          
          <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "4px", marginBottom: "1rem", textAlign: "left" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>🔧 Troubleshooting:</h4>
            <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#6c757d" }}>
              <li>Check if the backend server is running</li>
              <li>Verify backend URL: <code>{import.meta.env.VITE_API_URL || 'Configured API URL'}</code></li>
              <li>Check browser console for detailed error logs</li>
              <li>Ensure you are logged in with a valid account</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button 
              onClick={() => {
                console.log('🔄 Retrying connection...');
                setError(null);
                const initializeComponent = async () => {
                  const isBackendReachable = await testBackendConnection();
                  if (isBackendReachable) {
                    fetchUserAchievements();
                  } else {
                    setError('Cannot connect to the backend server. Please ensure the server is running.');
                  }
                };
                initializeComponent();
              }} 
              style={{ padding: "0.5rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              🔄 Retry Connection
            </button>
            <button 
              onClick={() => {
                console.log('Current user data:', localStorage.getItem('userData'));
                console.log('Current token:', localStorage.getItem('token'));
                toast.info('Check browser console for debug information');
              }} 
              style={{ padding: "0.5rem 1rem", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              🐛 Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-wrapper">
      <h1>Achievements</h1>
      <p>Add and manage your Symposium Achievements, Academic Certifications</p>

      {/* Top Controls */}
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search achievements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />

        <div className="category-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}

          <button className="add-btn" onClick={() => setShowForm(true)}>
            + Add Achievement
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-card" onClick={(e) => e.stopPropagation()}>
            <h2>Add Achievement</h2>

            <input
              type="text"
              name="title"
              placeholder="Achievement Title"
              value={formData.title}
              onChange={handleChange}
            />

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="SYMPOSIUM">Symposium</option>
              <option value="ACADEMIC">Academic</option>
              <option value="CERTIFICATIONS">Certifications</option>
              <option value="OTHERS">Others</option>
            </select>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />

            <input
              type="file"
              name="image"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />

            <div className="form-actions">
              <button 
                onClick={saveAchievement}
                disabled={submitting}
                style={{
                  background: submitting ? '#ccc' : 'linear-gradient(90deg,#ff6a00,#ee0979)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {submitting && <FaSpinner className="spinner" />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button className="cancel-btn" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements List */}
      <div className="achievements-list">
        {filteredAchievements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.9)', borderRadius: '8px' }}>
            {search ? (
              <div>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '0.5rem' }}>
                  No achievements found matching "{search}"
                </p>
                <button 
                  onClick={() => setSearch("")} 
                  style={{ 
                    background: '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                {activeCategory === 'All' 
                  ? 'No achievements found. Click "Add Achievement" to create your first achievement entry.'
                  : `No ${categoryLabels[activeCategory].toLowerCase()} achievements found.`
                }
              </p>
            )}
          </div>
        ) : (
          filteredAchievements.map((ach) => (
            <div key={ach.id} className="achievement-card">
              <div className="ach-text">
                <div className="category-btn-display">{categoryLabels[ach.category] || ach.category}</div>
                <strong>{ach.title}</strong>
                <div className="ach-date">{formatDate(ach.createdAt)}</div>
                <div className="ach-description">{ach.description}</div>
                {ach.imageFilename && (
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                    <strong>File:</strong> {ach.imageFilename}
                  </div>
                )}
              </div>

              {/* Right-side container */}
              <div className="right-side">
                <div className={`status-box ${
                  ach.status === "APPROVED" ? "approved" : 
                  ach.status === "REJECTED" ? "rejected" : "pending"
                }`}>
                  {ach.status === "APPROVED" ? (
                    <span>
                      <FaCheckCircle style={{ marginRight: "4px" }} /> Approved
                    </span>
                  ) : ach.status === "REJECTED" ? (
                    <span>
                      <FaTimes style={{ marginRight: "4px" }} /> Rejected
                    </span>
                  ) : (
                    <span>
                      <FaExclamationCircle style={{ marginRight: "4px" }} /> Pending
                    </span>
                  )}
                </div>

                <div className="file-preview">
                  {ach.imageUrl ? (
                    <img
                      src={ach.imageUrl}
                      alt="Achievement Image"
                      className="file-image"
                      onClick={() => window.open(ach.imageUrl, "_blank")}
                    />
                  ) : (
                    <div className="file-placeholder">
                      <FaFileAlt style={{ fontSize: "2rem", color: "#a18cd1" }} />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Styles */}
      <style>{`
        .achievements-wrapper { min-height: 100vh; padding: 3rem 2rem; background: url('${bgImage}') no-repeat center center fixed; background-size: cover; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; }
        h1 { font-size: 2rem; font-weight: 700; color: #000; margin-bottom: 0.5rem; }
        p { color: #555; margin-bottom: 1.5rem; text-align: center; }

        .top-controls { display: flex; flex-direction: column; align-items: stretch; gap: 40px; }
        .search-bar { width: 100%; max-width: 700px; padding: 16px 20px; border-radius: 30px; border: none; outline: none; font-size: 1.1rem; background: linear-gradient(90deg,#a18cd1,#fbc2eb); color: #fff; }
        .search-bar::placeholder { color: #fff; opacity: 0.8; }
        .category-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

        .category-btn { padding: 10px 14px; border-radius: 14px; border: 1px solid #ccc; background: #fff; color: #000; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: 0.2s; }
        .category-btn.active { background: linear-gradient(90deg,#ff6a00,#ee0979); color: #fff; }

        .category-btn-display { display: inline-block; padding: 8px 16px; border: 2px solid #ff6a00; border-radius: 12px; color: #ff6a00; font-size: 0.9rem; font-weight: 600; background: transparent; cursor: default; margin-bottom: 8px; }

        .add-btn { padding: 12px 20px; background: linear-gradient(90deg,#ff6a00,#ee0979); color: #fff; font-weight: 600; border: none; border-radius: 30px; cursor: pointer; }

        .achievements-list { width: 100%; max-width: 1900px; display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        .achievement-card { background: #f9f9f9; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: flex-start; box-shadow: 0 4px 15px rgba(0,0,0,0.1); min-height: 140px; }
        .ach-text { display: flex; flex-direction: column; gap: 6px; }
        .ach-date { color: #777; font-size: 0.9rem; font-weight: 400; margin-bottom: 10px; }
        .ach-description { color: #000; font-size: 1rem; }
        .ach-text strong { color: #3a3aee; font-size: 1rem; }

        .right-side { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .file-preview { width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
        .file-image { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; cursor: pointer; }
        .file-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }

        .status-box { font-weight: bold; font-size: 0.95rem; }
        .status-box.approved { color: #4CAF50; }
        .status-box.pending { color: #FF9800; }
        .status-box.rejected { color: #f44336; }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .form-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 12px; width: 90%; max-width: 500px; }
        .form-card input, .form-card select, .form-card textarea { padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .form-actions button:first-child { background: linear-gradient(90deg,#ff6a00,#ee0979); color: #fff; border: none; border-radius: 8px; cursor: pointer; padding: 10px 20px; }
        .cancel-btn { background: #ffffff; color: #000; border: 1px solid #ccc; border-radius: 8px; padding: 10px 20px; cursor: pointer; }
      `}</style>
    </div>
  );
}
