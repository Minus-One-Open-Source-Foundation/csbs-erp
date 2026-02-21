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

export default function FacultyCertificationsRequests() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
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

  // Fetch certification requests on component mount and filter change
  useEffect(() => {
    fetchCertificationRequests();
  }, [activeFilter]);

  const fetchCertificationRequests = async () => {
    try {
      setLoading(true);
      let certifications;

      switch (activeFilter) {
        case "PENDING":
          certifications = await facultyAPI.getPendingInternships();
          break;
        case "ALL":
          certifications = await facultyAPI.getAllInternships();
          break;
        case "APPROVED":
        case "REJECTED":
          const allCertifications = await facultyAPI.getAllInternships();
          certifications = allCertifications.filter(certification => certification.status === activeFilter);
          break;
        default:
          certifications = await facultyAPI.getPendingInternships();
      }

      setEvents(certifications);
      setError(null);
    } catch (err) {
      console.error('Error fetching certification requests:', err);
      setError('Failed to load certification requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (certificationId) => {
    try {
      setApprovingId(certificationId);
      await facultyAPI.approveInternship(certificationId);
      await fetchCertificationRequests();
      toast.success('Certification approved successfully!');
    } catch (err) {
      console.error('Error approving certification:', err);
      toast.error('Failed to approve certification. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (certificationId) => {
    try {
      setRejectingId(certificationId);
      await facultyAPI.rejectInternship(certificationId);
      await fetchCertificationRequests();
      toast.success('Certification rejected successfully!');
    } catch (err) {
      console.error('Error rejecting certification:', err);
      toast.error('Failed to reject certification. Please try again.');
    } finally {
      setRejectingId(null);
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
      <div
        className="min-h-screen py-8 px-4 font-sans bg-cover bg-center bg-fixed text-gray-900"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="text-center p-12">
          <FaSpinner className="animate-spin text-[2rem] text-blue-600 mx-auto" />
          <p>Loading certification requests...</p>
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
        <div className="text-center p-12 bg-white/90 rounded-lg mx-auto my-8 max-w-[500px]">
          <p className="text-red-500 text-[1.1rem] mb-4">{error}</p>
          <button
            onClick={fetchCertificationRequests}
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
      className="min-h-screen py-8 px-4 font-sans bg-cover bg-center bg-fixed text-gray-900"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <header className="text-center mb-10 mt-10">
        <div>
          <h2 className="font-bold text-[2.1rem] text-[#3a3aee] mb-6">Certifications Requests</h2>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {filterOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => setActiveFilter(option.key)}
                  className="flex items-center gap-2 py-3 px-5 rounded-[25px] text-[0.95rem] cursor-pointer transition-all duration-300"
                  style={{
                    border: activeFilter === option.key ? `2px solid ${option.color}` : '2px solid transparent',
                    background: activeFilter === option.key ? `${option.color}15` : 'rgba(255,255,255,0.8)',
                    color: activeFilter === option.key ? option.color : '#666',
                    fontWeight: activeFilter === option.key ? 600 : 500,
                    boxShadow: activeFilter === option.key ? `0 4px 12px ${option.color}30` : '0 2px 8px rgba(0,0,0,0.1)',
                    transform: activeFilter === option.key ? 'translateY(-1px)' : 'none'
                  }}
                >
                  {IconComponent && <IconComponent className="text-[0.9rem]" />}
                  {option.label}
                  {option.key !== 'ALL' && (
                    <span
                      className="rounded-xl py-0.5 px-2 text-[0.75rem] font-semibold min-w-[20px] text-center text-white"
                      style={{ background: option.color }}
                    >
                      {option.key === activeFilter ? events.length : '•'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 py-4 pr-12 pl-6 rounded-[30px] border-none bg-white/70 text-gray-800 text-[1.1rem] outline-none w-[580px] max-w-full"
          />
        </div>
      </header>

      <section className="flex flex-col gap-8">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 text-center">
            {searchTerm ? (
              <div>
                <p className="text-[1.1rem] text-gray-500 mb-2">
                  No certification requests found matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-600 text-white border-none py-2 px-4 rounded cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-[1.1rem] text-gray-500">
                No {activeFilter.toLowerCase()} certification requests found.
                {activeFilter === 'PENDING' && ' Great! All requests have been reviewed.'}
              </p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="mb-6 relative">
              <div className="bg-white rounded-[18px] shadow-[0_6px_24px_rgba(0,0,0,0.13)] py-8 px-6 flex flex-row gap-8 items-start relative max-md:flex-col max-md:gap-4 max-md:px-4 max-md:py-6 max-sm:px-3 max-sm:py-4">
                <div className="flex-1 flex flex-col max-md:w-full min-w-0">
                  <p className="text-[1.15rem]"><span className="text-black font-semibold">Email:</span> <span className="text-gray-600">{event.userEmail}</span></p>
                  <h4 className="text-[1.25rem] font-semibold my-2"><span className="text-black">Title:</span> <span className="text-gray-600">{event.title}</span></h4>
                  <span className="text-[1.15rem] font-semibold mb-2 block"><span className="text-black">Company:</span> <span className="text-gray-600">{event.companyName}</span></span>
                  <span className="text-[1.15rem] font-semibold mb-2 block">
                    <span className="text-black">Duration:</span> <span className="text-gray-600">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                  </span>
                  <div className="text-[1.15rem] font-semibold mb-3 text-left">
                    <span className="text-black">Mode:</span> <span className="text-gray-600">{event.mode || 'REMOTE'}</span>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 text-base mb-3 break-words overflow-hidden">
                      <strong>Description:</strong> {event.description}
                    </p>
                  )}
                  {event.certificateFilename && (
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-gray-500 text-[0.9rem] m-0">
                        <strong>Certificate File Name:</strong> {event.certificateFilename}
                      </p>
                      {event.certificateUrl && (
                        <button
                          onClick={() => handleViewCertificate(event)}
                          className="bg-blue-500 text-white border-none rounded py-1 px-2 cursor-pointer text-[0.8rem] flex items-center gap-1 transition-colors duration-200 hover:bg-blue-600"
                          title="View Certificate"
                        >
                          <FaEye /> View
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-gray-400 text-[0.85rem]">
                    <strong>Submitted:</strong> {formatDate(event.createdAt)}
                  </p>

                  {/* Status Display */}
                  <div className="mt-4 mb-4">
                    {event.status === "APPROVED" && (
                      <span className="text-green-600 font-bold text-base inline-flex items-center gap-2 bg-green-50 rounded-lg py-2 px-4 border-2 border-green-600">
                        <FaCheckCircle /> APPROVED
                        {event.updatedAt && (
                          <span className="text-[0.8rem] text-gray-500 ml-2">
                            on {formatDate(event.updatedAt)}
                          </span>
                        )}
                      </span>
                    )}
                    {event.status === "REJECTED" && (
                      <span className="text-red-500 font-bold text-base inline-flex items-center gap-2 bg-red-50 rounded-lg py-2 px-4 border-2 border-red-500">
                        <FaTimes /> REJECTED
                        {event.updatedAt && (
                          <span className="text-[0.8rem] text-gray-500 ml-2">
                            on {formatDate(event.updatedAt)}
                          </span>
                        )}
                      </span>
                    )}
                    {event.status === "PENDING" && (
                      <span className="text-amber-500 font-bold text-base inline-flex items-center gap-2 bg-amber-50 rounded-lg py-2 px-4 border-2 border-amber-500">
                        <FaExclamationCircle /> PENDING REVIEW
                      </span>
                    )}
                  </div>

                  {/* Action Buttons - Only show for PENDING status */}
                  {event.status === "PENDING" && (
                    <div className="flex gap-4 mt-4 max-sm:flex-col max-sm:w-full max-sm:gap-2">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={approvingId === event.id}
                        className="flex items-center gap-2 py-3 px-4 bg-green-600 text-white border-none rounded-md font-semibold text-[0.9rem] transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-px hover:shadow-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 max-sm:px-3 max-sm:py-2 max-sm:flex-1 max-sm:text-[0.85rem]"
                      >
                        {approvingId === event.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={rejectingId === event.id}
                        className="flex items-center gap-2 py-3 px-4 bg-red-500 text-white border-none rounded-md font-semibold text-[0.9rem] transition-all duration-200 shadow-sm cursor-pointer hover:-translate-y-px hover:shadow-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 max-sm:px-3 max-sm:py-2 max-sm:flex-1 max-sm:text-[0.85rem]"
                      >
                        {rejectingId === event.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimes />
                        )}
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Document preview box */}
                <div className="w-[180px] h-[160px] min-w-[180px] min-h-[160px] border-2 border-dashed border-gray-400 rounded-xl bg-white flex items-center justify-center overflow-hidden max-md:w-full max-md:min-w-0 max-md:h-[180px]">
                  {event.certificateUrl ? (
                    <img
                      src={event.certificateUrl}
                      alt="Certificate"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500 text-[0.9rem]">
                      <FaFileAlt className="text-[2rem] mb-2 mx-auto" />
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
          className="fixed top-[80px] left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
          onClick={closeCertificateViewer}
        >
          <div
            className="w-[90vw] h-[calc(100vh-120px)] max-w-[1200px] max-h-[800px] bg-white rounded-xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col m-auto max-md:w-[95vw] max-md:h-[calc(100vh-140px)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center py-6 px-8 bg-slate-50 border-b border-slate-200 max-md:p-4 max-md:flex-col max-md:items-start max-md:gap-4">
              <div>
                <h3 className="m-0 text-[1.25rem] font-semibold text-slate-800">
                  Certificate - {viewingCertificate.title}
                </h3>
                <p className="mt-1 mb-0 text-[0.875rem] text-slate-400">
                  {viewingCertificate.studentName} • {viewingCertificate.companyName}
                </p>
              </div>
              <button
                onClick={closeCertificateViewer}
                className="bg-red-500 text-white border-none rounded-lg p-3 cursor-pointer text-base flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:scale-105"
                title="Close"
              >
                    <FaTimes />
              </button>
            </div>

            {/* Certificate Content */}
            <div className="flex-1 p-4 bg-slate-100 flex items-center justify-center overflow-auto min-h-0 max-md:p-2">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={viewingCertificate.url}
                  alt={viewingCertificate.filename}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all duration-300"
                  onLoad={(e) => {
                    console.log('Certificate loaded:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
