import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaClock, FaCheck, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import { facultyAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Reports() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [modalImage, setModalImage] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRequestsByStatus(filter);
  }, [filter]);

  const fetchRequestsByStatus = async (status) => {
    try {
      setLoading(true);
      const events = await facultyAPI.getEventsByStatus(status);
      setRequests(events);
      setError(null);
    } catch (err) {
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      setProcessingId(eventId);
      await facultyAPI.approveEvent(eventId);
      
      // Remove the approved request from the list
      setRequests(requests.filter(request => request.id !== eventId));
      
      // Show success message (you could use a toast notification here)
      toast.success('Event approved successfully!');
    } catch (err) {
      console.error('Error approving event:', err);
      toast.error('Failed to approve event. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventId) => {
    try {
      setProcessingId(eventId);
      await facultyAPI.rejectEvent(eventId);
      
      // Remove the rejected request from the list
      setRequests(requests.filter(request => request.id !== eventId));
      
      // Show success message (you could use a toast notification here)
      toast.success('Event rejected successfully!');
    } catch (err) {
      console.error('Error rejecting event:', err);
      toast.error('Failed to reject event. Please try again.');
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

  const getEventTypeDisplay = (type) => {
    switch (type) {
      case 'HACKATHON':
        return 'Hackathon';
      case 'WORKSHOP':
        return 'Workshop';
      case 'ACTIVITY':
        return 'Activity';
      default:
        return type;
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pending-requests-wrapper">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading {filter.toLowerCase()} requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-requests-wrapper">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => fetchRequestsByStatus(filter)} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hackathons-requests-wrapper">
      <h2 className="page-title">Hackathons And Workshops Requests</h2>
      <div className="filter-btn-group">
        <button className={`filter-btn pending-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>
          <FaClock style={{marginRight: '0.5em'}} /> Pending
        </button>
        <button className={`filter-btn approved-btn ${filter === 'APPROVED' ? 'active' : ''}`} onClick={() => setFilter('APPROVED')}>
          <FaCheck style={{marginRight: '0.5em'}} /> Approved
        </button>
        <button className={`filter-btn rejected-btn ${filter === 'REJECTED' ? 'active' : ''}`} onClick={() => setFilter('REJECTED')}>
          <FaTimes style={{marginRight: '0.5em'}} /> Rejected
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="no-requests">
          <p>No {filter.toLowerCase()} requests match your search.</p>
        </div>
      ) : (
        filteredRequests.map((req) => (
          <div className="request-box" key={req.id}>
            <div className="request-box-inner">
              <div className="request-details">
                <div className="request-header">
                  <h3>{getEventTypeDisplay(req.type)} Request</h3>
                  {filter === 'PENDING' && <span className="pending-status"><FaClock /> Pending</span>}
                  {filter === 'APPROVED' && <span className="approved-status"><FaCheck /> Approved</span>}
                  {filter === 'REJECTED' && <span className="rejected-status"><FaTimes /> Rejected</span>}
                </div>
                <div className="request-content">
                  <p><strong>Student:</strong> {req.userEmail}</p>
                  <p><strong>Title:</strong> {req.title}</p>
                  {req.description && (
                    <p><strong>Description:</strong> {req.description}</p>
                  )}
                  <p><strong>Event Date:</strong> {formatDate(req.eventDate)}</p>
                  <p><strong>Submitted:</strong> {formatDate(req.createdAt)}</p>
                  {req.fileName && (
                    <p><strong>File:</strong> {req.fileName}</p>
                  )}
                  {filter === 'PENDING' && (
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaCheck />
                        )}
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaTimes />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                  {filter === 'APPROVED' && (
                    <button 
                      className="reject-btn"
                      onClick={async () => {
                        try {
                          setProcessingId(req.id);
                          await facultyAPI.rejectEvent(req.id); // Call API to reject the event
                          setRequests(requests.filter(request => request.id !== req.id)); // Remove the card from current list
                          toast.success('Event rejected successfully!');
                        } catch (err) {
                          console.error('Error rejecting event:', err);
                          toast.error('Failed to reject event. Please try again.');
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaTimes />
                      )}
                      Reject
                    </button>
                  )}
                  {filter === 'REJECTED' && (
                    <button 
                      className="approve-btn"
                      onClick={async () => {
                        try {
                          setProcessingId(req.id);
                          await facultyAPI.approveEvent(req.id); // Call API to approve the event
                          setRequests(requests.filter(request => request.id !== req.id)); // Remove the card from current list
                          toast.success('Event approved successfully!');
                        } catch (err) {
                          console.error('Error approving event:', err);
                          toast.error('Failed to approve event. Please try again.');
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      disabled={processingId === req.id}
                    >
                      {processingId === req.id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <FaCheck />
                      )}
                      Approve
                    </button>
                  )}
                </div>
              </div>
              <div className="document-preview-box">
                {req.imageUrl ? (
                  <img 
                    src={req.imageUrl} 
                    alt="Event document" 
                    className="document-preview"
                    style={{cursor: 'pointer'}}
                    onClick={() => setModalImage(req.imageUrl)}
                  />
                ) : (
                  <div className="no-document">
                    <p>No document attached</p>
                  </div>
                )}
      {/* Modal for viewing image */}
      {modalImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setModalImage(null)}
        >
          <span
            style={{
              position: 'absolute',
              top: '2.5%',
              right: '3%',
              fontSize: '1.4rem',
              color: '#fff',
              cursor: 'pointer',
              zIndex: 10000,
              fontWeight: 700,
              userSelect: 'none',
              background: 'rgba(0,0,0,0.25)',
              borderRadius: '50%',
              width: '1.8em',
              height: '1.8em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.18s',
            }}
            onClick={e => { e.stopPropagation(); setModalImage(null); }}
            title="Close"
          >
            &#10005;
          </span>
          <img
            src={modalImage}
            alt="Preview"
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              background: '#fff',
              padding: '1.5rem',
              objectFit: 'contain',
              display: 'block',
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
              </div>
            </div>
          </div>
        ))
      )}

  <style>{`
        .hackathons-requests-wrapper {
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          background: url('${bgImage}') no-repeat center center fixed;
          background-size: cover;
          color: #111;
        }
        .page-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #333;
        }
        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }
        .spinner {
          animation: spin 1s linear infinite;
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #007bff;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .error-message {
          color: #dc3545;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .filter-btn-group {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 2.2rem;
          margin-top: 1.2rem;
        }
        .filter-btn {
          padding: 0.5rem 1.2rem;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          background: #f3f4f6;
          color: #222;
          margin: 0;
          letter-spacing: 0.2px;
          min-width: 120px;
        }
        .filter-btn.pending-btn {
          background: linear-gradient(90deg, #ffe29f 0%, #ffa99f 100%);
          color: #b26a00;
        }
        .filter-btn.approved-btn {
          background: linear-gradient(90deg, #a8ff78 0%, #78ffd6 100%);
          color: #0a7d3b;
        }
        .filter-btn.rejected-btn {
          background: linear-gradient(90deg, #ff5858 0%, #f09819 100%);
          color: #a80000;
        }
        .filter-btn:hover, .filter-btn:focus {
          filter: brightness(0.95) saturate(1.2);
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 4px 16px rgba(0,0,0,0.13);
        }
        .filter-btn.active {
          border: 2px solid #333;
          color: #fff !important;
          filter: brightness(1.08) saturate(1.2);
          box-shadow: 0 4px 16px rgba(0,0,0,0.13);
        }
          background: rgba(255, 255, 255, 0.9);
          border-radius: 8px;
          margin: 2rem auto;
          max-width: 500px;
        }
        .request-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.07);
          padding: 1.5rem 1.7rem 1.2rem 1.7rem;
          margin-bottom: 2.2rem;
          text-align: left;
          position: relative;
          display: flex;
          flex-direction: row;
          min-height: 120px;
          transition: box-shadow 0.18s, transform 0.18s;
          align-items: flex-start;
        }
        .request-box {
          background: #fff !important;
          border-radius: 20px;
          box-shadow: 0 6px 32px 0 rgba(0,0,0,0.13), 0 2px 8px 0 rgba(0,0,0,0.09);
          border: 2px solid #e0e0e0;
          padding: 0;
          margin-bottom: 3.2rem;
          margin-top: 0.7rem;
          text-align: left;
          position: relative;
          width: 100%;
          max-width: none;
        }
        .request-box-inner {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          padding: 2.8rem 3.2rem 2.2rem 3.2rem;
          min-height: 180px;
        }
        .request-details {
          flex: 1 1 0%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .document-preview-box {
          width: 240px;
          height: 200px;
          background: #f8f9fa;
          border: 2.5px dashed #dee2e6;
          border-radius: 12px;
          margin-left: 3.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: static;
        }
        @media (max-width: 1200px) {
          .request-box {
            max-width: 98vw;
          }
          .request-box_inner {
            padding: 1.5rem 1.2rem 1.2rem 1.2rem;
          }
          .document-preview-box {
            width: 180px;
            height: 160px;
            margin-left: 1.2rem;
            border-radius: 8px;
          }
        }
        @media (max-width: 900px) {
          .request-box_inner {
            flex-direction: column;
            padding: 1.2rem 1rem 1.2rem 1rem;
          }
          .document-preview-box {
            margin-left: 0;
            margin-top: 1.2rem;
            width: 100%;
            max-width: 220px;
            align-self: center;
          }
        }
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .request-box {
            flex-direction: column;
            padding: 1.2rem 1rem 1.2rem 1rem;
          }
          .request-content {
            padding-right: 0;
          }
          .document-preview-box {
            position: static;
            margin: 1rem auto 0 auto;
            width: 100%;
            max-width: 220px;
            top: unset;
            right: unset;
          }
        }
        .request-content {
          padding-right: 200px;
          flex: 1;
        }
        .request-content p {
          margin: 0.5rem 0;
          line-height: 1.5;
        }
        .request-box:hover {
          transform: translateY(-4px);
        }
        .request-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-right: 200px;
        }
        .request-header h3 {
          font-size: 1.25rem;
          margin: 0;
        }
        .pending-status {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          color: #ff9800;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .pending-status svg {
          margin-right: 0.3rem;
        }
        .approved-status {
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .rejected-status {
          color: #dc3545;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .action-buttons {
          position: absolute; /* Ensure buttons are in the corner */
          right: 1rem; /* Align to the right edge */
          bottom: 1rem; /* Align to the bottom edge */
          display: flex;
          justify-content: flex-end; /* Align buttons horizontally */
          gap: 0.75rem;
        }
        .approve-btn, .reject-btn, .reapprove-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          border: none;
          padding: 0.7rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .approve-btn {
          background-color: #28a745;
          color: #fff;
        }
        .approve-btn:hover:not(:disabled) {
          background-color: #218838;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
        .reject-btn {
          background-color: #dc3545;
          color: #fff;
        }
        .reject-btn:hover:not(:disabled) {
          background-color: #c82333;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
        }
        .reapprove-btn {
          background-color: #ffc107;
          color: #fff;
        }
        .reapprove-btn:hover:not(:disabled) {
          background-color: #e0a800;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
        }
        .approve-btn:disabled, .reject-btn:disabled, .reapprove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .document-preview-box {
          width: 180px;
          height: 160px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          position: absolute;
          right: 1rem;
          top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .document-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }
        .no-document {
          text-align: center;
          color: #6c757d;
          font-size: 0.8rem;
          padding: 1rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .hackathons-requests-wrapper {
            padding: 1rem;
          }
          .request-box {
            min-height: auto;
            flex-direction: column;
          }
          .request-header {
            padding-right: 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .request-content {
            padding-right: 0;
            margin-bottom: 1rem;
          }
          .document-preview-box {
            position: relative;
            right: auto;
            top: auto;
            margin: 1rem auto 0;
            width: 100%;
            max-width: 200px;
          }
          .action-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
          .approve-btn, .reject-btn, .reapprove-btn {
            width: 100%;
            justify-content: center;
          }
        }

        .search-bar {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .search-wrapper {
          position: relative;
          width: 90%;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 1.2rem 0.8rem 2.5rem;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1rem;
          outline: none;
          transition: 0.3s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .filter-btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
        }

        @media (max-width: 900px) {
           .request-box {
             flex-direction: column;
           }
           .request-box-inner {
             flex-direction: column;
             padding: 1.5rem;
           }
           .document-preview-box {
             width: 100%;
             height: 200px;
             margin-left: 0;
             margin-top: 1.5rem;
           }
           .action-buttons {
             position: static;
             margin-top: 1rem;
             width: 100%;
             justify-content: flex-end;
           }
           .request-content {
             padding-right: 0;
           }
           .request-header {
             padding-right: 0;
           }
        }

        .reapprove-btn {
          background-color: #ffc107;
          color: #fff;
          padding: 0.7rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .reapprove-btn:hover:not(:disabled) {
          background-color: #e0a800;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
        }

        .reapprove-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-buttons {
          position: absolute; /* Ensure buttons are in the corner */
          right: 1rem; /* Align to the right edge */
          bottom: 1rem; /* Align to the bottom edge */
          display: flex;
          justify-content: flex-end; /* Align buttons horizontally */
          gap: 0.75rem;
        }

        .request-box {
          position: relative; /* Make the card a positioning context */
          padding-bottom: 3rem; /* Ensure space for buttons */
        }
      `}</style>
    </div>
  );
}
