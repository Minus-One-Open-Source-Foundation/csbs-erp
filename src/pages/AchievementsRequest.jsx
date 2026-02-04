import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrophy, FaCheckCircle, FaTimesCircle, FaSpinner, FaUser, FaCalendar, FaFileAlt, FaImage, FaTimes, FaExclamationCircle } from "react-icons/fa";
import { achievementAPI } from "../services/api";

export default function AchievementsRequest() {
  console.log('🎯 AchievementsRequest component initialized');
  
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [processingIds, setProcessingIds] = useState(new Set());
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const categories = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  const categoryLabels = {
    "ALL": "All Requests",
    "PENDING": "Pending",
    "APPROVED": "Approved",
    "REJECTED": "Rejected"
  };

  const achievementCategoryLabels = {
    "SYMPOSIUM": "Symposium",
    "ACADEMIC": "Academic",
    "CERTIFICATIONS": "Certifications",
    "OTHERS": "Others"
  };

  // Fetch all achievement requests for faculty review
  const fetchAllAchievements = async () => {
    try {
      console.log('📥 Fetching all achievement requests for faculty...');
      console.log('🔗 API Endpoint: /achievements/faculty/all');
      setLoading(true);
      setError(null);

      // Get all achievements (faculty endpoint should return all student achievements)
      const response = await achievementAPI.getAllForFaculty();
      console.log('📊 Raw API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched achievement requests:', response.data.length);
        setAchievements(response.data);
      } else if (response && Array.isArray(response)) {
        // Handle case where response is directly an array (not wrapped in success/data)
        console.log('✅ Direct array response received:', response.length);
        setAchievements(response);
      } else {
        console.error('❌ Failed to fetch achievements:', response);
        setError(response?.message || 'Failed to fetch achievement requests');
      }
    } catch (error) {
      console.error('💥 Error fetching achievements:', error);
      console.error('💥 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Failed to load achievement requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve action
  const handleApprove = async (achievementId) => {
    try {
      console.log('✅ Approving achievement:', achievementId);
      setProcessingIds(prev => new Set([...prev, achievementId]));

      const response = await achievementAPI.updateStatus(achievementId, 'APPROVED');
      
      if (response.success) {
        console.log('✅ Achievement approved successfully');
        toast.success('Achievement approved successfully');
        // Refresh the list
        await fetchAllAchievements();
      } else {
        console.error('❌ Failed to approve achievement:', response.message);
        toast.error('Failed to approve achievement: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error approving achievement:', error);
      toast.error('Error approving achievement. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(achievementId);
        return newSet;
      });
    }
  };

  // Handle reject action
  const handleReject = async (achievementId) => {
    try {
      console.log('❌ Rejecting achievement:', achievementId);
      setProcessingIds(prev => new Set([...prev, achievementId]));

      const response = await achievementAPI.updateStatus(achievementId, 'REJECTED');
      
      if (response.success) {
        toast.success('Achievement rejected successfully');
        // Refresh the list
        await fetchAllAchievements();
      } else {
        console.error('❌ Failed to reject achievement:', response.message);
        toast.error('Failed to reject achievement: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Error rejecting achievement:', error);
      toast.error('Error rejecting achievement. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(achievementId);
        return newSet;
      });
    }
  };

  // Filter achievements based on status
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === "ALL") return true;
    return achievement.status === filter;
  });

  // Get count for each status
  const getStatusCount = (status) => {
    if (status === "ALL") return achievements.length;
    return achievements.filter(a => a.status === status).length;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Initialize component
  useEffect(() => {
    fetchAllAchievements();
  }, []);

  if (loading) {
    return (
      <div className="achievements-request-wrapper" style={{ padding: "2rem", minHeight: "100vh", background: "#ffffff" }}>
        <div style={{ textAlign: "center", padding: "3rem", background: "#f8f9fa", borderRadius: "8px", margin: "2rem auto", maxWidth: "400px", border: "1px solid #e0e0e0" }}>
          <FaSpinner className="spinner" style={{ fontSize: "2rem", color: "#007bff" }} />
          <p style={{ fontSize: "1.1rem", color: "#495057", margin: "1rem 0 0.5rem 0" }}>Loading achievement requests...</p>
          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
            Fetching student submissions for review
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achievements-request-wrapper" style={{ padding: "2rem", minHeight: "100vh", background: "#ffffff" }}>
        <div style={{ textAlign: "center", padding: "3rem", background: "#f8f9fa", borderRadius: "8px", margin: "2rem auto", maxWidth: "500px", border: "1px solid #e0e0e0" }}>
          <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>⚠️ Error Loading Requests</h2>
          <p style={{ color: "#dc3545", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button 
              onClick={fetchAllAchievements} 
              style={{ padding: "0.5rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              🔄 Retry
            </button>
            <button 
              onClick={async () => {
                try {
                  console.log('🧪 Testing backend connectivity...');
                  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
                  const testResponse = await fetch(`${apiUrl}/achievements/faculty/all`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  console.log('🧪 Test response status:', testResponse.status);
                  const testData = await testResponse.text();
                  console.log('🧪 Test response data:', testData);
                  toast.info(`Backend test result: Status ${testResponse.status}. Check console for details`);
                } catch (err) {
                  console.error('🧪 Backend test failed:', err);
                  toast.error(`Backend test failed: ${err.message}`);
                }
              }} 
              style={{ padding: "0.5rem 1rem", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              🧪 Test Backend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-request-wrapper" style={{ padding: "2rem", minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem", color: "#333" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <FaTrophy style={{ color: "#ff6b6b" }} /> Achievement Requests
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666" }}>
            Review and manage student achievement submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                padding: "0.75rem 1.5rem",
                border: filter === category ? "2px solid #ff6b6b" : "2px solid #e0e0e0",
                borderRadius: "25px",
                background: filter === category ? "#ff6b6b" : "#ffffff",
                color: filter === category ? "white" : "#333",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                fontSize: "0.9rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              {categoryLabels[category]}
              <span style={{
                background: filter === category ? "rgba(255,255,255,0.3)" : "#007bff",
                color: filter === category ? "white" : "white",
                borderRadius: "50%",
                padding: "0.2rem 0.5rem",
                fontSize: "0.8rem",
                marginLeft: "0.5rem",
                minWidth: "1.5rem",
                display: "inline-block",
                textAlign: "center"
              }}>
                {getStatusCount(category)}
              </span>
            </button>
          ))}
        </div>

        {/* Achievement Requests List */}
        {filteredAchievements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
            <FaTrophy style={{ fontSize: "3rem", color: "#ccc", marginBottom: "1rem" }} />
            <h3 style={{ color: "#666", marginBottom: "0.5rem" }}>No Achievement Requests</h3>
            <p style={{ color: "#999" }}>
              {filter === "ALL" ? "No achievement requests found." : `No ${filter.toLowerCase()} achievement requests.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="achievement-card"
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: achievement.status === 'PENDING' ? "2px solid #ffc107" : 
                         achievement.status === 'APPROVED' ? "2px solid #28a745" : 
                         "2px solid #dc3545"
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}>
                  {/* Achievement Details */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                      <h3 style={{ margin: 0, color: "#333", fontSize: "1.3rem" }}>
                        {achievement.title}
                      </h3>
                      <span style={{
                        background: achievement.status === 'PENDING' ? "#ffc107" : 
                                   achievement.status === 'APPROVED' ? "#28a745" : "#dc3545",
                        color: "white",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        fontWeight: "bold"
                      }}>
                        {achievement.status}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666" }}>
                        <FaUser />
                        <span><strong>Student:</strong> {achievement.userEmail}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666" }}>
                        <FaTrophy />
                        <span><strong>Category:</strong> {achievementCategoryLabels[achievement.category] || achievement.category}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666" }}>
                        <FaCalendar />
                        <span><strong>Submitted:</strong> {formatDate(achievement.createdAt)}</span>
                      </div>
                    </div>

                    {achievement.description && (
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666", marginBottom: "0.5rem" }}>
                          <FaFileAlt />
                          <strong>Description:</strong>
                        </div>
                        <p style={{ margin: 0, color: "#555", lineHeight: "1.5", paddingLeft: "1.5rem" }}>
                          {achievement.description}
                        </p>
                      </div>
                    )}

                    {achievement.imageUrl && (
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#666", marginBottom: "0.5rem" }}>
                          <FaImage />
                          <strong>Certificate/Image:</strong>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCertificate({
                              url: achievement.imageUrl,
                              title: achievement.title,
                              student: achievement.userEmail
                            });
                            setShowCertificate(true);
                          }}
                          style={{ 
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.5rem 1rem",
                            marginLeft: "1.5rem",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                          }}
                        >
                          <FaImage /> View Certificate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {achievement.status === 'PENDING' && (
                    <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                      <button
                        onClick={() => handleApprove(achievement.id)}
                        disabled={processingIds.has(achievement.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: processingIds.has(achievement.id) ? "not-allowed" : "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          opacity: processingIds.has(achievement.id) ? 0.7 : 1
                        }}
                      >
                        {processingIds.has(achievement.id) ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(achievement.id)}
                        disabled={processingIds.has(achievement.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: processingIds.has(achievement.id) ? "not-allowed" : "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          opacity: processingIds.has(achievement.id) ? 0.7 : 1
                        }}
                      >
                        {processingIds.has(achievement.id) ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaTimesCircle />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && selectedCertificate && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}>
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}>
              {/* Modal Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                borderBottom: "1px solid #e0e0e0",
                paddingBottom: "1rem"
              }}>
                <div>
                  <h3 style={{ margin: 0, color: "#333" }}>{selectedCertificate.title}</h3>
                  <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                    Student: {selectedCertificate.student}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCertificate(false);
                    setSelectedCertificate(null);
                  }}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Certificate Image */}
              <div style={{ textAlign: "center" }}>
                <img
                  src={selectedCertificate.url}
                  alt="Achievement Certificate"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "70vh",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div style={{ display: "none", padding: "2rem", color: "#666" }}>
                  <FaExclamationCircle style={{ fontSize: "2rem", marginBottom: "1rem" }} />
                  <p>Unable to load certificate image</p>
                  <a 
                    href={selectedCertificate.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    📎 Open in new tab
                  </a>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e0e0e0",
                textAlign: "center"
              }}>
                <a
                  href={selectedCertificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#28a745",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    textDecoration: "none",
                    marginRight: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  🔗 Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowCertificate(false);
                    setSelectedCertificate(null);
                  }}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        button:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .achievements-request-wrapper {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .achievement-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .achievement-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
