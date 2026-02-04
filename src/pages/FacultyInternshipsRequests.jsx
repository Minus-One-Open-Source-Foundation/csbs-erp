import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaFileAlt, 
  FaSpinner,
  FaCheck, 
  FaTimes,
  FaEye
} from "react-icons/fa";
import { facultyAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function FacultyInternshipsRequests() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [showCertificateViewer, setShowCertificateViewer] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Filter options
  const filterOptions = [
    { key: "PENDING", label: "Pending", icon: FaExclamationCircle, color: "#FF9800" },
    { key: "APPROVED", label: "Approved", icon: FaCheckCircle, color: "#4CAF50" },
    { key: "REJECTED", label: "Rejected", icon: FaTimes, color: "#f44336" },
    { key: "ALL", label: "All", icon: null, color: "#2196F3" }
  ];

  // Fetch internship requests on component mount and filter change
  useEffect(() => {
    fetchInternshipRequests();
  }, [activeFilter]);

  const fetchInternshipRequests = async () => {
    try {
      setLoading(true);
      let internships;
      
      switch (activeFilter) {
        case "PENDING":
          internships = await facultyAPI.getPendingInternships();
          break;
        case "ALL":
          internships = await facultyAPI.getAllInternships();
          break;
        case "APPROVED":
        case "REJECTED":
          // For now, we'll get all internships and filter client-side
          // You can add specific backend endpoints later if needed
          const allInternships = await facultyAPI.getAllInternships();
          internships = allInternships.filter(internship => internship.status === activeFilter);
          break;
        default:
          internships = await facultyAPI.getPendingInternships();
      }
      
      setEvents(internships);
      setError(null);
    } catch (err) {
      console.error('Error fetching internship requests:', err);
      setError('Failed to load internship requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (internshipId) => {
    try {
      setProcessingId(internshipId);
      await facultyAPI.approveInternship(internshipId);
      
      // Refresh the list to reflect changes
      await fetchInternshipRequests();
      
      // Show success message
      toast.success('Internship approved successfully!');
    } catch (err) {
      console.error('Error approving internship:', err);
      toast.error('Failed to approve internship. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (internshipId) => {
    try {
      setProcessingId(internshipId);
      await facultyAPI.rejectInternship(internshipId);
      
      // Refresh the list to reflect changes
      await fetchInternshipRequests();
      
      // Show success message
      toast.success('Internship rejected successfully!');
    } catch (err) {
      console.error('Error rejecting internship:', err);
      toast.error('Failed to reject internship. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCertificate = (event) => {
    if (event.certificateUrl) {
      setViewingCertificate({
        url: event.certificateUrl,
        filename: event.certificateFilename || 'Certificate',
        studentName: event.studentName,
        companyName: event.companyName,
        title: event.title
      });
      setShowCertificateViewer(true);
    }
  };

  const closeCertificateViewer = () => {
    setShowCertificateViewer(false);
    setViewingCertificate(null);
  };
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="internships-requests-wrapper" style={{ minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Inter', sans-serif", background: `url('${bgImage}') no-repeat center center fixed`, backgroundSize: "cover", color: "#111" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <FaSpinner className="spinner" style={{ fontSize: "2rem", color: "#007bff" }} />
          <p>Loading internship requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="internships-requests-wrapper" style={{ minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Inter', sans-serif", background: `url('${bgImage}') no-repeat center center fixed`, backgroundSize: "cover", color: "#111" }}>
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.9)", borderRadius: "8px", margin: "2rem auto", maxWidth: "500px" }}>
          <p style={{ color: "#dc3545", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
          <button onClick={fetchInternshipRequests} style={{ padding: "0.5rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="internships-requests-wrapper" style={{ minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Inter', sans-serif", background: `url('${bgImage}') no-repeat center center fixed`, backgroundSize: "cover", color: "#111" }}>
      <header style={{ textAlign: "center", marginBottom: "2.5rem", marginTop: "2.5rem" }}>
        <div className="search-bar-wrapper">
            <h2 style={{ fontWeight: 700, fontSize: '2.1rem', color: '#3a3aee', marginBottom: '1.5rem' }}>Internship Requests</h2>
            
            {/* Filter Tabs */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {filterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => setActiveFilter(option.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.7rem 1.2rem',
                      border: activeFilter === option.key ? `2px solid ${option.color}` : '2px solid transparent',
                      borderRadius: '25px',
                      background: activeFilter === option.key ? `${option.color}15` : 'rgba(255,255,255,0.8)',
                      color: activeFilter === option.key ? option.color : '#666',
                      fontWeight: activeFilter === option.key ? 600 : 500,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: activeFilter === option.key ? `0 4px 12px ${option.color}30` : '0 2px 8px rgba(0,0,0,0.1)',
                      transform: activeFilter === option.key ? 'translateY(-1px)' : 'none'
                    }}
                  >
                    {IconComponent && <IconComponent style={{ fontSize: '0.9rem' }} />}
                    {option.label}
                    {option.key !== 'ALL' && (
                      <span style={{
                        background: option.color,
                        color: 'white',
                        borderRadius: '12px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {option.key === activeFilter ? events.length : '•'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
              style={{ flex: 1, padding: "1rem 3rem 1rem 1.5rem", borderRadius: "30px", border: "none", background: "rgba(255,255,255,0.7)", color: "#232526", fontSize: "1.1rem", outline: "none", width: "580px" }}
            />
        </div>
      </header>
      <section className="cards-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {filteredEvents.length === 0 ? (
          <div className="event-card" style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 6px 24px rgba(0,0,0,0.13)", padding: "2rem 1.6rem", textAlign: 'center' }}>
            {searchTerm ? (
              <div>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '0.5rem' }}>
                  No internship requests found matching "{searchTerm}"
                </p>
                <button 
                  onClick={() => setSearchTerm("")} 
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
                No {activeFilter.toLowerCase()} internship requests found.
                {activeFilter === 'PENDING' && ' Great! All requests have been reviewed.'}
              </p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <div className="event-card" style={{ background: "#fff", borderRadius: "18px", boxShadow: "0 6px 24px rgba(0,0,0,0.13)", padding: "2rem 1.6rem", display: "flex", flexDirection: "row", gap: "2rem", alignItems: "flex-start", position: "relative" }}>
                <div className="badge" style={{ position: "absolute", top: "1.2rem", left: "1.2rem", padding: "0.4rem 1.2rem", borderRadius: "14px", fontWeight: 700, fontSize: "1rem", background: "#fff", border: "2px solid #ff6a00", color: "#ff6a00" }}>
                  Internship
                </div>
                <div className="event-info" style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "1rem" }}>
                  <p><strong>Student:</strong> {event.userEmail}</p>
                  <h4 className="event-subtitle" style={{ color: "#3a3aee", fontSize: "1.1rem", fontWeight: 600, margin: "0.5rem 0" }}>{event.title}</h4>
                  <span className="company-name" style={{ fontSize: "1rem", color: "#555", fontWeight: 600, marginBottom: "0.5rem", display: "block" }}><strong>Company:</strong> {event.companyName}</span>
                  <span className="date" style={{ fontSize: "0.95rem", color: "#777", marginBottom: "0.5rem", display: "block" }}>
                    <strong>Duration:</strong> {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </span>
                  <div style={{ fontSize: '1rem', color: '#3a3aee', fontWeight: 600, marginBottom: '0.7rem', textAlign: 'left' }}>
                    <strong>Mode:</strong> <span style={{ color: '#222', fontWeight: 500 }}>{event.mode || 'REMOTE'}</span>
                  </div>
                  {event.description && (
                    <p style={{ color: "#444", fontSize: "1rem", marginBottom: "0.7rem" }}>
                      <strong>Description:</strong> {event.description}
                    </p>
                  )}
                  {event.certificateFilename && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: "0.7rem" }}>
                      <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>
                        <strong>Certificate:</strong> {event.certificateFilename}
                      </p>
                      {event.certificateUrl && (
                        <button
                          onClick={() => handleViewCertificate(event)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.3rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.background = '#2563eb'}
                          onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                          title="View Certificate"
                        >
                          <FaEye /> View
                        </button>
                      )}
                    </div>
                  )}
                  <p style={{ color: "#888", fontSize: "0.85rem" }}>
                    <strong>Submitted:</strong> {formatDate(event.createdAt)}
                  </p>

                  {/* Status Display */}
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {event.status === "APPROVED" && (
                      <span style={{ 
                        color: '#4CAF50', 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: '#e8f5e9', 
                        borderRadius: '8px', 
                        padding: '0.5rem 1rem', 
                        border: '2px solid #4CAF50' 
                      }}>
                        <FaCheckCircle /> APPROVED
                        {event.updatedAt && (
                          <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
                            on {formatDate(event.updatedAt)}
                          </span>
                        )}
                      </span>
                    )}
                    {event.status === "REJECTED" && (
                      <span style={{ 
                        color: '#f44336', 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: '#ffebee', 
                        borderRadius: '8px', 
                        padding: '0.5rem 1rem', 
                        border: '2px solid #f44336' 
                      }}>
                        <FaTimes /> REJECTED
                        {event.updatedAt && (
                          <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>
                            on {formatDate(event.updatedAt)}
                          </span>
                        )}
                      </span>
                    )}
                    {event.status === "PENDING" && (
                      <span style={{ 
                        color: '#FF9800', 
                        fontWeight: 'bold', 
                        fontSize: '1rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        background: '#fff8e1', 
                        borderRadius: '8px', 
                        padding: '0.5rem 1rem', 
                        border: '2px solid #FF9800' 
                      }}>
                        <FaExclamationCircle /> PENDING REVIEW
                      </span>
                    )}
                  </div>

                  {/* Action Buttons - Only show for PENDING status */}
                  {event.status === "PENDING" && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={processingId === event.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.7rem 1.5rem',
                          background: processingId === event.id ? '#ccc' : '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: processingId === event.id ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== event.id) {
                            e.target.style.background = '#218838';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(40, 167, 69, 0.3)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== event.id) {
                            e.target.style.background = '#28a745';
                            e.target.style.transform = 'none';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                      >
                        {processingId === event.id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaCheck />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={processingId === event.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.7rem 1.5rem',
                          background: processingId === event.id ? '#ccc' : '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: processingId === event.id ? 'not-allowed' : 'pointer',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseOver={(e) => {
                          if (processingId !== event.id) {
                            e.target.style.background = '#c82333';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (processingId !== event.id) {
                            e.target.style.background = '#dc3545';
                            e.target.style.transform = 'none';
                            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                          }
                        }}
                      >
                        {processingId === event.id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaTimes />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Document preview box */}
                <div style={{ 
                  width: '180px', 
                  height: '160px', 
                  minWidth: '180px', 
                  minHeight: '160px', 
                  border: '2px dashed #bbb', 
                  borderRadius: '12px', 
                  background: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {event.certificateUrl ? (
                    <img 
                      src={event.certificateUrl} 
                      alt="Certificate" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                      <FaFileAlt style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                      <br />No certificate
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Certificate Viewer Modal */}
      {showCertificateViewer && viewingCertificate && (
        <div 
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={closeCertificateViewer}
        >
          <div 
            className="certificate-modal"
            style={{
              width: '90vw',
              height: 'calc(100vh - 120px)',
              maxWidth: '1200px',
              maxHeight: '800px',
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="certificate-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                  Certificate - {viewingCertificate.title}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                  {viewingCertificate.studentName} • {viewingCertificate.companyName}
                </p>
              </div>
              <button
                onClick={closeCertificateViewer}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#dc2626';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#ef4444';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Certificate Content */}
            <div className="certificate-content" style={{
              flex: 1,
              padding: '1rem',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              minHeight: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  className="certificate-image"
                  src={viewingCertificate.url}
                  alt={viewingCertificate.filename}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onLoad={(e) => {
                    // Ensure the image is fully visible after loading
                    console.log('Certificate loaded:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .approved { color: #10b981; }
        .pending { color: #ff4b5c; }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Certificate Viewer Responsive Styles */
        @media (max-width: 768px) {
          .certificate-modal {
            width: 95vw !important;
            height: calc(100vh - 140px) !important;
            margin: 0 !important;
          }
          
          .certificate-header {
            padding: 1rem !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          
          .certificate-content {
            padding: 0.5rem !important;
          }
          
          .certificate-image {
            border-radius: 4px !important;
          }
        }

        @media (max-width: 480px) {
          .certificate-modal {
            border-radius: 8px !important;
            height: calc(100vh - 160px) !important;
            width: 98vw !important;
          }
          
          .certificate-header h3 {
            font-size: 1rem !important;
          }
          
          .certificate-header p {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
