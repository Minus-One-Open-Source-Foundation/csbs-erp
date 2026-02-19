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
      setRequests(requests.filter(request => request.id !== eventId));
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
      setRequests(requests.filter(request => request.id !== eventId));
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
      <div
        className="min-h-screen py-8 px-4 font-sans bg-cover bg-center bg-fixed text-gray-900"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <FaSpinner className="animate-spin text-[2rem] text-blue-600 mb-4" />
          <p>Loading {filter.toLowerCase()} requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen py-8 px-4 font-sans bg-cover bg-center bg-fixed text-gray-900"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-red-600 text-[1.1rem] mb-4">{error}</p>
          <button
            onClick={() => fetchRequestsByStatus(filter)}
            className="py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8 font-sans bg-cover bg-center bg-fixed text-gray-900 max-md:p-4 max-sm:p-2"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <h2 className="text-center text-[2rem] font-bold mb-8 text-gray-800 max-sm:text-[1.5rem] max-sm:mb-5">Hackathons And Workshops Requests</h2>

      {/* Filter Buttons */}
      <div className="flex flex-row justify-start items-center gap-3 mb-8 mt-3 flex-wrap max-sm:gap-2">
        <button
          className={`flex items-center py-2 px-5 font-semibold text-base border-none rounded-[10px] cursor-pointer transition-all duration-200 shadow-sm min-w-[120px] tracking-[0.2px] hover:brightness-95 hover:saturate-[1.2] hover:-translate-y-0.5 hover:shadow-md max-sm:py-1.5 max-sm:px-3 max-sm:text-[0.85rem] max-sm:min-w-0 ${filter === 'PENDING'
            ? 'border-2 border-gray-800 text-white brightness-[1.08] saturate-[1.2] shadow-md'
            : ''
            }`}
          style={{ background: 'linear-gradient(90deg, #ffe29f 0%, #ffa99f 100%)', color: filter === 'PENDING' ? '#fff' : '#b26a00' }}
          onClick={() => setFilter('PENDING')}
        >
          <FaClock className="mr-2" /> Pending
        </button>
        <button
          className={`flex items-center py-2 px-5 font-semibold text-base border-none rounded-[10px] cursor-pointer transition-all duration-200 shadow-sm min-w-[120px] tracking-[0.2px] hover:brightness-95 hover:saturate-[1.2] hover:-translate-y-0.5 hover:shadow-md max-sm:py-1.5 max-sm:px-3 max-sm:text-[0.85rem] max-sm:min-w-0 ${filter === 'APPROVED'
            ? 'border-2 border-gray-800 text-white brightness-[1.08] saturate-[1.2] shadow-md'
            : ''
            }`}
          style={{ background: 'linear-gradient(90deg, #a8ff78 0%, #78ffd6 100%)', color: filter === 'APPROVED' ? '#fff' : '#0a7d3b' }}
          onClick={() => setFilter('APPROVED')}
        >
          <FaCheck className="mr-2" /> Approved
        </button>
        <button
          className={`flex items-center py-2 px-5 font-semibold text-base border-none rounded-[10px] cursor-pointer transition-all duration-200 shadow-sm min-w-[120px] tracking-[0.2px] hover:brightness-95 hover:saturate-[1.2] hover:-translate-y-0.5 hover:shadow-md max-sm:py-1.5 max-sm:px-3 max-sm:text-[0.85rem] max-sm:min-w-0 ${filter === 'REJECTED'
            ? 'border-2 border-gray-800 text-white brightness-[1.08] saturate-[1.2] shadow-md'
            : ''
            }`}
          style={{ background: 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)', color: filter === 'REJECTED' ? '#fff' : '#a80000' }}
          onClick={() => setFilter('REJECTED')}
        >
          <FaTimes className="mr-2" /> Rejected
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center p-8 bg-white/90 rounded-lg">
          <p>No {filter.toLowerCase()} requests match your search.</p>
        </div>
      ) : (
        filteredRequests.map((req) => (
          <div
            className="bg-white rounded-[20px] shadow-[0_6px_32px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.09)] border-2 border-gray-300 mb-8 mt-2 text-left relative w-full transition-all duration-200 hover:-translate-y-1 pb-12 max-md:pb-3 max-md:min-h-0"
            key={req.id}
          >
            <div className="flex flex-row items-stretch py-7 px-8 min-h-[180px] max-md:flex-col max-md:p-4 max-sm:p-3">
              {/* Request Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4 max-md:flex-col max-md:items-start max-md:gap-2 max-md:pr-0">
                  <h3 className="text-[1.25rem] m-0">{getEventTypeDisplay(req.type)} Request</h3>
                  {filter === 'PENDING' && (
                    <span className="flex items-center text-[0.9rem] text-amber-500 font-semibold gap-1">
                      <FaClock /> Pending
                    </span>
                  )}
                  {filter === 'APPROVED' && (
                    <span className="flex items-center text-[0.9rem] text-emerald-500 font-semibold gap-1">
                      <FaCheck /> Approved
                    </span>
                  )}
                  {filter === 'REJECTED' && (
                    <span className="flex items-center text-[0.9rem] text-red-600 font-semibold gap-1">
                      <FaTimes /> Rejected
                    </span>
                  )}
                </div>
                <div className="flex-1 max-md:pr-0 [&>p]:my-2 [&>p]:leading-relaxed">
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
                    <div className="absolute right-4 bottom-4 flex justify-end gap-3 max-md:static max-md:mt-4 max-md:w-full max-md:flex-col max-md:gap-2">
                      <button
                        className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-green-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:justify-center"
                        onClick={() => handleApprove(req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Approve
                      </button>
                      <button
                        className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-red-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:justify-center"
                        onClick={() => handleReject(req.id)}
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                  {filter === 'APPROVED' && (
                    <button
                      className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-red-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={async () => {
                        try {
                          setProcessingId(req.id);
                          await facultyAPI.rejectEvent(req.id);
                          setRequests(requests.filter(request => request.id !== req.id));
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
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                      Reject
                    </button>
                  )}
                  {filter === 'REJECTED' && (
                    <button
                      className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-green-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={async () => {
                        try {
                          setProcessingId(req.id);
                          await facultyAPI.approveEvent(req.id);
                          setRequests(requests.filter(request => request.id !== req.id));
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
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                      Approve
                    </button>
                  )}
                </div>
              </div>

              {/* Document Preview Box */}
              <div className="w-[240px] h-[200px] bg-gray-50 border-[2.5px] border-dashed border-gray-300 rounded-xl ml-8 flex items-center justify-center overflow-hidden max-md:ml-0 max-md:mt-4 max-md:w-full max-md:max-w-full max-md:h-[200px] max-md:mx-auto">
                {req.imageUrl ? (
                  <img
                    src={req.imageUrl}
                    alt="Event document"
                    className="w-full h-full object-cover rounded-md cursor-pointer"
                    onClick={() => setModalImage(req.imageUrl)}
                  />
                ) : (
                  <div className="text-center text-gray-500 text-[0.8rem] p-4">
                    <p>No document attached</p>
                  </div>
                )}

                {/* Modal for viewing image */}
                {modalImage && (
                  <div
                    className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center"
                    onClick={() => setModalImage(null)}
                  >
                    <span
                      className="absolute top-[2.5%] right-[3%] text-[1.4rem] text-white cursor-pointer z-[10000] font-bold select-none bg-black/25 rounded-full w-[1.8em] h-[1.8em] flex items-center justify-center transition-colors duration-200"
                      onClick={e => { e.stopPropagation(); setModalImage(null); }}
                      title="Close"
                    >
                      &#10005;
                    </span>
                    <img
                      src={modalImage}
                      alt="Preview"
                      className="w-auto h-auto max-w-[100vw] max-h-[100vh] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] bg-white p-6 object-contain block"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
