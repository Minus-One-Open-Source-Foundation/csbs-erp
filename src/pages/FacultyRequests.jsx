import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllPendingEvents, getPendingEventsByType, approveEvent, rejectEvent, getAllEvents, getEventsByStatus } from '../services/api';

const FacultyRequests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'HACKATHON', 'WORKSHOP', 'INTERNSHIP'
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [filter, typeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (filter === 'all') {
        response = await getAllEvents();
      } else if (filter === 'pending') {
        if (typeFilter === 'all') {
          response = await getAllPendingEvents();
        } else {
          response = await getPendingEventsByType(typeFilter);
        }
      } else {
        response = await getEventsByStatus(filter.toUpperCase());
      }
      
      setEvents(response.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: 'approving' }));
    try {
      const response = await approveEvent(eventId);
      if (response.data.success) {
        await fetchEvents(); // Refresh the list
        toast.success('Event approved successfully!');
      } else {
        toast.error(response.data.message || 'Failed to approve event');
      }
    } catch (err) {
      console.error('Error approving event:', err);
      toast.error('Failed to approve event. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: null }));
    }
  };

  const handleReject = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: 'rejecting' }));
    try {
      const response = await rejectEvent(eventId);
      if (response.data.success) {
        await fetchEvents(); // Refresh the list
        toast.success('Event rejected successfully!');
      } else {
        toast.error(response.data.message || 'Failed to reject event');
      }
    } catch (err) {
      console.error('Error rejecting event:', err);
      toast.error('Failed to reject event. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: null }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'HACKATHON': return '💻';
      case 'WORKSHOP': return '🛠️';
      case 'INTERNSHIP': return '🏢';
      default: return '📅';
    }
  };

  return (
    <div className="faculty-requests">
      <div className="requests-header">
        <h1>Student Event Requests</h1>
        <p>Review and manage student activity requests</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status Filter:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type Filter:</label>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="WORKSHOP">Workshops</option>
            <option value="INTERNSHIP">Internships</option>
          </select>
        </div>

        <button onClick={fetchEvents} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <>
          {/* Events Count */}
          <div className="events-count">
            Found {events.length} event{events.length !== 1 ? 's' : ''}
          </div>

          {/* Events List */}
          <div className="events-container">
            {events.length === 0 ? (
              <div className="no-events">
                <h3>No events found</h3>
                <p>There are no events matching your current filters.</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-title-section">
                      <span className="event-icon">{getTypeIcon(event.type)}</span>
                      <div>
                        <h3>{event.title}</h3>
                        <p className="event-type">{event.type}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="event-content">
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <div className="detail-item">
                        <strong>Student:</strong> {event.userEmail}
                      </div>
                      <div className="detail-item">
                        <strong>Event Date:</strong> {formatDate(event.eventDate)}
                      </div>
                      <div className="detail-item">
                        <strong>Submitted:</strong> {formatDate(event.createdAt)}
                      </div>
                      {event.fileName && (
                        <div className="detail-item">
                          <strong>File:</strong> {event.fileName}
                        </div>
                      )}
                    </div>

                    {event.imageUrl && (
                      <div className="event-image">
                        <img src={event.imageUrl} alt="Event" />
                      </div>
                    )}
                  </div>

                  {event.status === 'PENDING' && (
                    <div className="event-actions">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={actionLoading[event.id]}
                        className="approve-btn"
                      >
                        {actionLoading[event.id] === 'approving' ? (
                          <>
                            <span className="action-spinner"></span>
                            Approving...
                          </>
                        ) : (
                          '✅ Approve'
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={actionLoading[event.id]}
                        className="reject-btn"
                      >
                        {actionLoading[event.id] === 'rejecting' ? (
                          <>
                            <span className="action-spinner"></span>
                            Rejecting...
                          </>
                        ) : (
                          '❌ Reject'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      <style>{`
        .faculty-requests {
          padding: 2rem;
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', sans-serif;
        }

        .requests-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .requests-header h1 {
          color: #1e293b;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .requests-header p {
          color: #64748b;
        }

        .filters-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: flex-end;
          justify-content: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 600;
          color: #334155;
          font-size: 0.9rem;
        }

        .filter-select {
          padding: 0.6rem 2rem 0.6rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #1e293b;
          background-color: white;
          cursor: pointer;
        }

        .refresh-btn {
          padding: 0.6rem 1.2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          height: fit-content;
        }

        .refresh-btn:hover {
          background: #2563eb;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .events-count {
          margin-bottom: 1rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .events-container {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .event-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .event-title-section {
          display: flex;
          gap: 0.8rem;
          align-items: flex-start;
        }

        .event-icon {
          font-size: 1.5rem;
        }

        .event-title-section h3 {
          margin: 0 0 0.3rem 0;
          font-size: 1.1rem;
          color: #1e293b;
        }

        .event-type {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .status-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.status-pending { background: #ffedd5; color: #9a3412; }
        .status-badge.status-approved { background: #dcfce7; color: #166534; }
        .status-badge.status-rejected { background: #fee2e2; color: #991b1b; }

        .event-content {
          flex: 1;
        }

        .event-description {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .event-details {
          background: #f8fafc;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .detail-item strong {
          color: #334155;
        }

        .event-image {
          margin-top: 1rem;
          border-radius: 8px;
          overflow: hidden;
          width: 100%;
          height: 160px;
        }

        .event-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-actions {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .approve-btn, .reject-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: opacity 0.2s;
        }

        .approve-btn {
          background: #22c55e;
          color: white;
        }

        .reject-btn {
          background: #ef4444;
          color: white;
        }

        .approve-btn:disabled, .reject-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .action-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .faculty-requests {
            padding: 1rem;
          }
          .filters-section {
            flex-direction: column;
            width: 100%;
          }
           .filter-group, .filter-select, .refresh-btn {
            width: 100%;
          }
          .events-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FacultyRequests;