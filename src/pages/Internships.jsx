import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaSpinner,
} from "react-icons/fa";
import { internshipAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Internships() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    companyName: "",
    description: "",
    mode: "",
    certificate: null,
  });

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email;
    }
    return null;
  };

  // Fetch user internships on component mount
  useEffect(() => {
    fetchUserInternships();
  }, []);

  const fetchUserInternships = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        setError('Please log in to view your internships');
        return;
      }

      const internships = await internshipAPI.getUserInternships(userEmail);
      setEvents(internships);
      setError(null);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternship = async () => {
    try {
      setSubmitting(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        toast.error('Please log in to submit an internship');
        return;
      }

      // Validate form data
      if (!formData.title || !formData.companyName || !formData.startDate || !formData.endDate || !formData.mode) {
        toast.warning('Please fill in all required fields');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('companyName', formData.companyName);
      submitData.append('mode', formData.mode);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('description', formData.description);
      submitData.append('userEmail', userEmail);
      
      if (formData.certificate) {
        submitData.append('certificate', formData.certificate);
      }

      // Submit to backend
      const response = await internshipAPI.createInternship(submitData);
      
      if (response.success) {
        // Refresh the internships list
        await fetchUserInternships();
        setShowForm(false);
        setFormData({
          title: "",
          startDate: "",
          endDate: "",
          companyName: "",
          description: "",
          mode: "",
          certificate: null,
        });
        toast.success('Internship submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit internship');
      }
    } catch (err) {
      console.error('Error submitting internship:', err);
      toast.error('Failed to submit internship. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem 1rem",
        fontFamily: "'Inter', sans-serif",
        background: `url("${bgImage}") no-repeat center center fixed`,
        backgroundSize: "cover",
        color: "#111",
      }}
    >
      {/* Header */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "2.5rem",
          marginTop: "2.5rem",
        }}
      >
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            style={{
              flex: 1,
              padding: "1rem 3rem 1rem 1.5rem",
              borderRadius: "30px",
              border: "none",
              background: "rgba(255,255,255,0.7)",
              color: "#232526",
              fontSize: "1.1rem",
              outline: "none",
              width: "580px",
            }}
          />
          <button
            className="add-btn"
            onClick={() => setShowForm(true)}
            style={{
              padding: "0.7rem 1.5rem",
              background: "linear-gradient(90deg,#ff6a00,#ee0979)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FaPlus style={{ marginRight: 6 }} /> Add internships
          </button>
        </div>
      </header>

      {showForm && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: "32px",
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-form"
            style={{
              width: "70%",
              maxWidth: "350px",
              background: "#fff",
              padding: "1.2rem 1.2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              maxHeight: "92vh",
              overflowY: "auto",
              position: "fixed",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1100,
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#333",
              }}
            >
              Add New Internship
            </h3>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              style={{
                width: "100%",
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
            <input
              type="text"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              style={{
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                outline: "none",
                width: "100%",
              }}
            />
            <select
              value={formData.mode || ""}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              style={{
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                outline: "none",
                width: "100%",
              }}
            >
              <option value="" disabled>
                Select Internship Mode
              </option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <label style={{ fontWeight: 500, marginBottom: "0.1rem", marginLeft: "8px" }}>
              Start Date
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              style={{
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                outline: "none",
                width: "100%",
              }}
            />
            <label style={{ fontWeight: 500, marginBottom: "0.1rem", marginLeft: "8px" }}>
              End Date
            </label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              style={{
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                outline: "none",
                width: "100%",
              }}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              maxLength={100}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{
                minHeight: "120px",
                maxHeight: "120px",
                resize: "none",
                borderRadius: "8px",
                padding: "0.7rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ccc",
                outline: "none",
                width: "100%",
              }}
            />
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) =>
                setFormData({ ...formData, certificate: e.target.files[0] })
              }
              style={{
                width: "100%",
                padding: "0.8rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
            <div
              className="modal-actions"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={handleAddInternship}
                disabled={submitting}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: submitting ? "#ccc" : "linear-gradient(90deg,#ff6a00,#ee0979)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {submitting && <FaSpinner className="spinner" />}
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "0.8rem 1.5rem",
                  background: "none",
                  color: "#333",
                  fontWeight: 600,
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <FaSpinner className="spinner" style={{ fontSize: "2rem", color: "#007bff" }} />
          <p>Loading your internships...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.9)", borderRadius: "8px", margin: "2rem auto", maxWidth: "500px" }}>
          <p style={{ color: "#dc3545", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
          <button onClick={fetchUserInternships} style={{ padding: "0.5rem 1rem", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {/* No Internships State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.9)", borderRadius: "8px", margin: "2rem auto", maxWidth: "500px" }}>
          <p>No internships found. Click "Add internships" to create your first internship entry.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && filteredEvents.length > 0 && (
        <section
          className="cards-container"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="event-card"
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                  padding: "2rem 1.6rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  position: "relative",
                }}
              >
                <div
                  className="badge internship"
                  style={{
                    position: "absolute",
                    top: "1.2rem",
                    left: "1.2rem",
                    padding: "0.4rem 1.2rem",
                    borderRadius: "14px",
                    fontWeight: 700,
                    fontSize: "1rem",
                    background: "#fff",
                    border: "2px solid #ff6a00",
                    color: "#ff6a00",
                  }}
                >
                  Internship
                </div>
                <div
                  className="event-main"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: "2rem",
                    marginTop: "1rem", // Add space to avoid badge collision
                  }}
                >
                  <div className="event-info" style={{ flex: 1 }}>
                    <h3
                      className="event-title"
                      style={{
                        color: "#3a3aee",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        margin: "1rem 0 0.5rem 0", // Add top margin to avoid badge overlap
                      }}
                    >
                      {event.title}
                    </h3>
                    <span
                      className="company-name"
                      style={{
                        fontSize: "1rem",
                        color: "#555",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        display: "block",
                      }}
                    >
                      {event.companyName}
                    </span>
                    <span
                      className="date"
                      style={{
                        fontSize: "0.95rem",
                        color: "#777",
                        marginBottom: "0.7rem",
                        display: "block",
                      }}
                    >
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                    <div style={{ fontSize: '1rem', color: '#3a3aee', fontWeight: 600, marginBottom: '0.7rem', textAlign: 'left' }}>
                      Internship mode: <span style={{ color: '#222', fontWeight: 500 }}>{event.mode || 'REMOTE'}</span>
                    </div>
                    <p
                      style={{
                        color: "#444",
                        fontSize: "1rem",
                        marginBottom: "0.7rem",
                      }}
                    >
                      {event.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                      position: 'relative',
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
                    {/* Status below the rectangle box */}
                    <div style={{ marginTop: '0.7rem', textAlign: 'center' }}>
                      {event.status === "APPROVED" ? (
                        <span style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#e8f5e9', borderRadius: '8px', padding: '0.3rem 0.8rem', border: '1.5px solid #4CAF50' }}>
                          <FaCheckCircle style={{ marginRight: '4px' }} /> Approved
                        </span>
                      ) : event.status === "REJECTED" ? (
                        <span style={{ color: '#f44336', fontWeight: 'bold', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ffebee', borderRadius: '8px', padding: '0.3rem 0.8rem', border: '1.5px solid #f44336' }}>
                          <FaExclamationCircle style={{ marginRight: '4px' }} /> Rejected
                        </span>
                      ) : (
                        <span style={{ color: '#FF9800', fontWeight: 'bold', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fff8e1', borderRadius: '8px', padding: '0.3rem 0.8rem', border: '1.5px solid #FF9800' }}>
                          <FaExclamationCircle style={{ marginRight: '4px' }} /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )
      }

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
      `}</style>
    </div>
  );
}
