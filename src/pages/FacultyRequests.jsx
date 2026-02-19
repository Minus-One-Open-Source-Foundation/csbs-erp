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
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
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
    <div className="p-8 min-h-screen bg-slate-50 font-sans max-md:p-4">
      <div className="text-center mb-8">
        <h1 className="text-slate-800 text-2xl mb-2">Student Event Requests</h1>
        <p className="text-slate-400">Review and manage student activity requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] mb-8 flex flex-wrap gap-6 items-end justify-center max-md:flex-col max-md:w-full">
        <div className="flex flex-col gap-2 max-md:w-full">
          <label className="font-semibold text-slate-600 text-[0.9rem]">Status Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="py-2.5 pr-8 pl-3 border border-slate-300 rounded-lg text-[0.95rem] text-slate-800 bg-white cursor-pointer max-md:w-full"
          >
            <option value="all">All Events</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 max-md:w-full">
          <label className="font-semibold text-slate-600 text-[0.9rem]">Type Filter:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2.5 pr-8 pl-3 border border-slate-300 rounded-lg text-[0.95rem] text-slate-800 bg-white cursor-pointer max-md:w-full"
          >
            <option value="all">All Types</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="WORKSHOP">Workshops</option>
            <option value="INTERNSHIP">Internships</option>
          </select>
        </div>

        <button
          onClick={fetchEvents}
          className="py-2.5 px-5 bg-blue-500 text-white border-none rounded-lg font-semibold cursor-pointer transition-colors duration-200 h-fit hover:bg-blue-600 max-md:w-full"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8 text-center">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p>Loading events...</p>
        </div>
      ) : (
        <>
          {/* Events Count */}
          <div className="mb-4 text-slate-400 text-[0.9rem]">
            Found {events.length} event{events.length !== 1 ? 's' : ''}
          </div>

          {/* Events List */}
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] max-md:grid-cols-1">
            {events.length === 0 ? (
              <div className="text-center p-8">
                <h3>No events found</h3>
                <p>There are no events matching your current filters.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl">{getTypeIcon(event.type)}</span>
                      <div>
                        <h3 className="m-0 mb-1 text-[1.1rem] text-slate-800">{event.title}</h3>
                        <p className="m-0 text-[0.8rem] text-slate-400 font-medium">{event.type}</p>
                      </div>
                    </div>
                    <span className={`py-1 px-2.5 rounded-full text-[0.75rem] font-semibold uppercase ${getStatusBadgeClass(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-slate-500 text-[0.95rem] leading-relaxed mb-4">{event.description}</p>

                    <div className="bg-slate-50 p-3 rounded-lg text-[0.85rem] flex flex-col gap-1.5">
                      <div>
                        <strong className="text-slate-600">Student:</strong> {event.userEmail}
                      </div>
                      <div>
                        <strong className="text-slate-600">Event Date:</strong> {formatDate(event.eventDate)}
                      </div>
                      <div>
                        <strong className="text-slate-600">Submitted:</strong> {formatDate(event.createdAt)}
                      </div>
                      {event.fileName && (
                        <div>
                          <strong className="text-slate-600">File:</strong> {event.fileName}
                        </div>
                      )}
                    </div>

                    {event.imageUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden w-full h-40">
                        <img src={event.imageUrl} alt="Event" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {event.status === 'PENDING' && (
                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={actionLoading[event.id]}
                        className="flex-1 py-3 border-none rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 transition-opacity duration-200 bg-green-500 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {actionLoading[event.id] === 'approving' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Approving...
                          </>
                        ) : (
                          '✅ Approve'
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={actionLoading[event.id]}
                        className="flex-1 py-3 border-none rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 transition-opacity duration-200 bg-red-500 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {actionLoading[event.id] === 'rejecting' ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
    </div>
  );
};

export default FacultyRequests;