import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaClock, FaCheck, FaTimes, FaSpinner, FaSearch, FaFileAlt, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { facultyAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Reports() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState({ id: null, type: null });
  const [filter, setFilter] = useState('PENDING');
  const [modalImage, setModalImage] = useState(null);
  const [search, setSearch] = useState('');
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const events = await facultyAPI.getAllEvents();
      setAllEvents(events || []);
    } catch (err) {
      console.error('Failed to fetch all events for counts:', err);
    }
  };

  useEffect(() => {
    if (filter === 'ALL') {
      setRequests(allEvents);
      setLoading(false);
    } else {
      fetchRequestsByStatus(filter);
    }
  }, [filter, allEvents]);

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
      setProcessing({ id: eventId, type: 'approve' });
      await facultyAPI.approveEvent(eventId);
      toast.success('Event approved successfully!');
      fetchAllEvents();
      if (filter !== 'ALL') fetchRequestsByStatus(filter);
    } catch (err) {
      console.error('Error approving event:', err);
      toast.error('Failed to approve event. Please try again.');
    } finally {
      setProcessing({ id: null, type: null });
    }
  };

  const handleReject = async (eventId) => {
    try {
      setProcessing({ id: eventId, type: 'reject' });
      await facultyAPI.rejectEvent(eventId);
      toast.success('Event rejected successfully!');
      fetchAllEvents();
      if (filter !== 'ALL') fetchRequestsByStatus(filter);
    } catch (err) {
      console.error('Error rejecting event:', err);
      toast.error('Failed to reject event. Please try again.');
    } finally {
      setProcessing({ id: null, type: null });
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

  const getStatusCount = (status) => {
    if (status === 'ALL') return allEvents.length;
    return allEvents.filter(req => req.status === status).length;
  };

  const categories = ["ALL", "PENDING", "APPROVED", "REJECTED"];
  const categoryLabels = {
    "ALL": "All Requests",
    "PENDING": "Pending",
    "APPROVED": "Approved",
    "REJECTED": "Rejected"
  };

  const getStatusButtons = () => {
    return (
      <div className="flex justify-center mb-10 gap-4 flex-wrap">
        {categories.map((category) => {
          const isActive = filter === category;

          // Define styles based on category and active state
          let styles = "bg-white text-gray-500 border-gray-200";
          let icon = null;
          let countBg = "bg-blue-600";

          if (category === "PENDING") {
            icon = <FaExclamationCircle className={isActive ? "text-[#f59e0b]" : "text-gray-400"} />;
            countBg = "bg-[#f59e0b]";
            if (isActive) styles = "bg-[#fff7ed] text-[#e37a08] border-[#fbbf24]";
          } else if (category === "APPROVED") {
            icon = <FaCheckCircle className={isActive ? "text-[#10b981]" : "text-gray-400"} />;
            countBg = "bg-[#10b981]";
            if (isActive) styles = "bg-[#f0fdf4] text-[#15803d] border-[#4ade80]";
          } else if (category === "REJECTED") {
            icon = <FaTimes className={isActive ? "text-[#ef4444]" : "text-gray-400"} />;
            countBg = "bg-[#ef4444]";
            if (isActive) styles = "bg-[#fef2f2] text-[#b91c1c] border-[#f87171]";
          } else {
            // ALL
            icon = <FaFileAlt className={isActive ? "text-blue-500" : "text-gray-400"} />;
            if (isActive) styles = "bg-[#eff6ff] text-[#1d4ed8] border-[#60a5fa]";
          }

          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`py-3 px-6 rounded-full font-bold cursor-pointer transition-all duration-300 flex items-center gap-3 text-[1rem] border-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${styles}`}
            >
              {icon}
              {categoryLabels[category]}
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.85rem] text-white shadow-inner font-black ${countBg}`}>
                {getStatusCount(category)}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-8 font-sans bg-cover bg-center bg-fixed text-gray-900 max-md:p-4 max-sm:p-2"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <header className="text-center mb-10 mt-10">
        <h1 className="text-[2.2rem] font-bold text-slate-800 mb-2 max-sm:text-[1.5rem]">
          Hackathons And Workshops Requests
        </h1>
      </header>

      {/* Filter Buttons Section */}
      {getStatusButtons()}

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search hackathons and workshops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="py-4 pr-12 pl-6 rounded-[30px] border-none shadow-md text-white placeholder:text-white/70 text-[1.1rem] outline-none w-[580px] max-w-full transition-all duration-300 focus:shadow-lg"
          style={{ background: "linear-gradient(135deg, #30364f, #acbac4)" }}
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center p-8 bg-white/90 rounded-lg">
          <p>No {filter === 'ALL' ? '' : filter.toLowerCase()} requests found.</p>
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
                  <h3 className="text-[1.4rem] m-0 font-bold">{getEventTypeDisplay(req.type)} Request</h3>
                  {req.status === 'PENDING' && (
                    <span className="flex items-center text-[0.9rem] text-amber-500 font-semibold gap-1">
                      <FaClock /> Pending
                    </span>
                  )}
                  {req.status === 'APPROVED' && (
                    <span className="flex items-center text-[0.9rem] text-emerald-500 font-semibold gap-1">
                      <FaCheck /> Approved
                    </span>
                  )}
                  {req.status === 'REJECTED' && (
                    <span className="flex items-center text-[0.9rem] text-red-600 font-semibold gap-1">
                      <FaTimes /> Rejected
                    </span>
                  )}
                </div>

                {/* Mobile-only Document Preview (appears after status) */}
                <div className="hidden max-md:flex w-full h-[200px] bg-gray-50 border-[2.5px] border-dashed border-gray-300 rounded-xl mb-6 items-center justify-center overflow-hidden mx-auto">
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
                </div>

                <div className="flex-1 max-md:pr-0 [&>p]:my-2 [&>p]:leading-relaxed">
                  <p><strong className="text-lg font-semibold mr-2">Student:</strong> <span className="text-gray-500">{req.userEmail}</span></p>
                  <p><strong className="text-lg font-semibold mr-2">Title:</strong> <span className="text-gray-500">{req.title}</span></p>
                  {req.description && (
                    <div className="mb-3">
                      <strong className="text-lg font-semibold block mb-1">Description:</strong>
                      <p className="m-0 text-gray-500 leading-relaxed pl-8 text-justify">
                        {req.description.split(' ').length > 200
                          ? req.description.split(' ').slice(0, 200).join(' ') + '...'
                          : req.description}
                      </p>
                    </div>
                  )}
                  <p><strong className="text-lg font-semibold mr-2">Event Date:</strong> <span className="text-gray-500">{formatDate(req.eventDate)}</span></p>
                  <p><strong className="text-lg font-semibold mr-2">Submitted:</strong> <span className="text-gray-500">{formatDate(req.createdAt)}</span></p>
                  {req.fileName && (
                    <p><strong className="text-lg font-semibold mr-2">File:</strong> <span className="text-gray-500">{req.fileName}</span></p>
                  )}
                  {req.status === 'PENDING' && (
                    <div className="absolute right-4 bottom-4 flex justify-end gap-3 max-md:static max-md:mt-4 max-md:w-full max-md:flex-col max-md:gap-2">
                      <button
                        className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-green-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:justify-center"
                        onClick={() => handleApprove(req.id)}
                        disabled={processing.id === req.id}
                      >
                        {processing.id === req.id && processing.type === 'approve' ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Approve
                      </button>
                      <button
                        className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-red-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:justify-center"
                        onClick={() => handleReject(req.id)}
                        disabled={processing.id === req.id}
                      >
                        {processing.id === req.id && processing.type === 'reject' ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                  {req.status === 'APPROVED' && (
                    <button
                      className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-red-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={async () => {
                        try {
                          setProcessing({ id: req.id, type: 'reject' });
                          await facultyAPI.rejectEvent(req.id);
                          toast.success('Event rejected successfully!');
                          fetchAllEvents();
                          if (filter !== 'ALL') fetchRequestsByStatus(filter);
                        } catch (err) {
                          console.error('Error rejecting event:', err);
                          toast.error('Failed to reject event. Please try again.');
                        } finally {
                          setProcessing({ id: null, type: null });
                        }
                      }}
                      disabled={processing.id === req.id}
                    >
                      {processing.id === req.id && processing.type === 'reject' ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTimes />
                      )}
                      Reject
                    </button>
                  )}
                  {req.status === 'REJECTED' && (
                    <button
                      className="flex items-center gap-1.5 border-none py-3 px-6 rounded-md cursor-pointer text-[0.95rem] font-semibold transition-all duration-200 shadow-sm bg-green-600 text-white hover:-translate-y-px hover:shadow-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={async () => {
                        try {
                          setProcessing({ id: req.id, type: 'approve' });
                          await facultyAPI.approveEvent(req.id);
                          toast.success('Event approved successfully!');
                          fetchAllEvents();
                          if (filter !== 'ALL') fetchRequestsByStatus(filter);
                        } catch (err) {
                          console.error('Error approving event:', err);
                          toast.error('Failed to approve event. Please try again.');
                        } finally {
                          setProcessing({ id: null, type: null });
                        }
                      }}
                      disabled={processing.id === req.id}
                    >
                      {processing.id === req.id && processing.type === 'approve' ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheck />
                      )}
                      Approve
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop-only Document Preview Box */}
              <div className="md:flex hidden w-[240px] h-[200px] bg-gray-50 border-[2.5px] border-dashed border-gray-300 rounded-xl ml-8 items-center justify-center overflow-hidden">
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
