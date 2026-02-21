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
    "INTRA_DEPARTMENT": "Intra-Department",
    "INTER_DEPARTMENT": "Inter-Department",
    "ACADEMIC": "Academic",
    "CERTIFICATIONS": "Certifications",
    "OTHERS": "Others"
  };

  const FALLBACK_ACHIEVEMENTS = [
    {
      id: "sample-1",
      title: "First Prize in Tech Symposium",
      status: "PENDING",
      userEmail: "student1@example.com",
      category: "CO_CURRICULAR",
      achievementType: "SYMPOSIUM",
      achievementDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      description: "Won first prize in the national level technical symposium for paper presentation on AI/ML.",
      imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "sample-2",
      title: "Google Cloud Certification",
      status: "APPROVED",
      userEmail: "student2@example.com",
      category: "CO_CURRICULAR",
      achievementType: "CERTIFICATIONS",
      achievementDate: new Date(Date.now() - 604800000).toISOString(),
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      description: "Successfully completed the Professional Cloud Architect certification.",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: "sample-3",
      title: "Inter-Department Football Winner",
      status: "PENDING",
      userEmail: "student3@example.com",
      category: "EXTRA_CURRICULAR",
      achievementType: "OTHERS",
      achievementDate: new Date(Date.now() - 1209600000).toISOString(),
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      description: "Part of the team that won the annual inter-department football tournament.",
      imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&auto=format&fit=crop&q=60"
    }
  ];

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

      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Successfully fetched achievement requests:', response.data.length);
        setAchievements(response.data);
      } else if (response && Array.isArray(response) && response.length > 0) {
        // Handle case where response is directly an array (not wrapped in success/data)
        console.log('✅ Direct array response received:', response.length);
        setAchievements(response);
      } else {
        console.warn('⚠️ No achievements found, using fallback samples');
        setAchievements(FALLBACK_ACHIEVEMENTS);
      }
    } catch (error) {
      console.error('💥 Error fetching achievements:', error);
      console.warn('⚠️ Error occurred, using fallback samples as backup');
      setAchievements(FALLBACK_ACHIEVEMENTS);
      // We don't set error state here to allow fallback data to be shown
      // Instead we can show a small toast if needed or just log it
      toast.info('Using sample data for demonstration');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve action
  const handleApprove = async (achievementId) => {
    try {
      console.log('✅ Approving achievement:', achievementId);
      setProcessingIds(prev => new Set([...prev, achievementId]));

      if (achievementId.toString().startsWith('sample-')) {
        // Handle sample data locally
        setAchievements(prev => prev.map(a =>
          a.id === achievementId ? { ...a, status: 'APPROVED' } : a
        ));
        toast.success('Sample achievement approved locally');
        return;
      }

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

      if (achievementId.toString().startsWith('sample-')) {
        // Handle sample data locally
        setAchievements(prev => prev.map(a =>
          a.id === achievementId ? { ...a, status: 'REJECTED' } : a
        ));
        toast.success('Sample achievement rejected locally');
        return;
      }

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
      <div className="p-8 min-h-screen bg-white animate-fade-in">
        <div className="text-center p-12 bg-gray-50 rounded-lg mx-auto my-8 max-w-[400px] border border-gray-200">
          <FaSpinner className="animate-spin text-[2rem] text-blue-600 mx-auto" />
          <p className="text-[1.1rem] text-gray-600 mt-4 mb-2">Loading achievement requests...</p>
          <div className="text-[0.9rem] text-gray-500">
            Fetching student submissions for review
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-white animate-fade-in">
        <div className="text-center p-12 bg-gray-50 rounded-lg mx-auto my-8 max-w-[500px] border border-gray-200">
          <h2 className="text-red-600 mb-4">⚠️ Error Loading Requests</h2>
          <p className="text-red-600 text-[1.1rem] mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchAllAchievements}
              className="py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300"
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
              className="py-2 px-4 bg-gray-500 text-white border-none rounded cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              🧪 Test Backend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-white animate-fade-in max-sm:p-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[2.25rem] font-bold text-[#4c4cf4] mb-2 tracking-tight max-sm:text-[1.8rem]">
            Achievement Requests
          </h1>
        </div>

        {/* Filter Tabs */}
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

        {/* Achievement Requests List */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-lg border border-gray-200">
            <FaTrophy className="text-[3rem] text-gray-300 mb-4 mx-auto" />
            <h3 className="text-gray-500 mb-2">No Achievement Requests</h3>
            <p className="text-gray-400">
              {filter === "ALL" ? "No achievement requests found." : `No ${filter.toLowerCase()} achievement requests.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
              >
                {/* Image Thumbnail (Top Right on Desktop, Hidden below md) */}
                {achievement.imageUrl && (
                  <div className="absolute top-8 right-8 w-56 h-40 rounded-xl border-2 border-dashed border-gray-300 p-2 bg-white shadow-sm hidden md:block">
                    <img
                      src={achievement.imageUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => {
                        setSelectedCertificate({
                          url: achievement.imageUrl,
                          title: achievement.title,
                          student: achievement.userEmail
                        });
                        setShowCertificate(true);
                      }}
                    />
                  </div>
                )}

                {/* Header Title for the Card */}
                <h2 className="text-[1.1rem] font-bold text-[#0f172a] mb-6 mt-0 tracking-tight">Achievement Request</h2>

                {/* Mobile Image (Shown only on small screens) */}
                {achievement.imageUrl && (
                  <div className="w-full h-64 mb-6 rounded-xl border-2 border-dashed border-gray-300 p-2 bg-white shadow-sm md:hidden block overflow-hidden">
                    <img
                      src={achievement.imageUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded-lg"
                      onClick={() => {
                        setSelectedCertificate({
                          url: achievement.imageUrl,
                          title: achievement.title,
                          student: achievement.userEmail
                        });
                        setShowCertificate(true);
                      }}
                    />
                  </div>
                )}

                {/* Content Info */}
                <div className="flex flex-col gap-3 md:pr-40">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
                    <span className="font-bold text-gray-900 min-w-[120px]">Email:</span>
                    <span className="text-gray-500 font-medium break-all">{achievement.userEmail}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
                    <span className="font-bold text-gray-900 min-w-[120px]">Title:</span>
                    <span className="text-gray-500 font-medium">{achievement.title}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
                    <span className="font-bold text-gray-900 min-w-[120px]">Category:</span>
                    <span className="text-gray-500 font-medium">{achievementCategoryLabels[achievement.achievementType] || achievement.achievementType || 'N/A'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
                    <span className="font-bold text-gray-900 min-w-[120px]">Date:</span>
                    <span className="text-gray-500 font-medium">{formatDate(achievement.achievementDate)}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 mt-2">
                    <span className="font-bold text-gray-900 min-w-[120px]">Description:</span>
                    <span className="text-gray-500 font-medium leading-relaxed">
                      {achievement.description || 'No description provided.'}
                    </span>
                  </div>

                  {achievement.imageUrl && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                      <span className="font-bold text-gray-900 min-w-[120px]">Certificate:</span>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-gray-400 font-medium text-sm truncate max-w-[150px] md:max-w-[200px]">
                          certificate_{achievement.id.slice(0, 8)}.png
                        </span>
                        <button
                          onClick={() => {
                            setSelectedCertificate({
                              url: achievement.imageUrl,
                              title: achievement.title,
                              student: achievement.userEmail
                            });
                            setShowCertificate(true);
                          }}
                          className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors shrink-0"
                        >
                          <FaImage size={12} /> View
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0 mt-2">
                    <span className="font-bold text-gray-900 text-sm uppercase tracking-wider min-w-[120px]">Submitted:</span>
                    <span className="text-gray-400 font-medium text-sm">{formatDate(achievement.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons / Status Badge (Bottom) */}
                <div className="mt-8 pt-6 border-t border-gray-50">
                  {achievement.status === 'PENDING' ? (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        onClick={() => handleApprove(achievement.id)}
                        disabled={processingIds.has(achievement.id)}
                        className="w-full sm:w-auto py-2.5 px-8 bg-green-500 text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-green-600 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        {processingIds.has(achievement.id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheckCircle />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(achievement.id)}
                        disabled={processingIds.has(achievement.id)}
                        className="w-full sm:w-auto py-2.5 px-8 bg-red-500 text-white border-none rounded-lg cursor-pointer text-[0.95rem] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-red-600 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        {processingIds.has(achievement.id) ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTimesCircle />
                        )}
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-2 py-2.5 px-6 rounded-lg border-2 font-bold w-full sm:w-auto justify-center sm:justify-start ${achievement.status === 'APPROVED'
                      ? "border-green-500 text-green-600 bg-green-50/50"
                      : "border-red-500 text-red-600 bg-red-50/50"
                      }`}>
                      {achievement.status === 'APPROVED' ? <FaCheckCircle /> : <FaTimesCircle />}
                      <span className="uppercase tracking-wider">{achievement.status}</span>
                      <span className="font-normal text-sm ml-2">on {formatDate(achievement.achievementDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && selectedCertificate && (
          <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-8 max-sm:p-3">
            <div className="bg-white rounded-xl p-6 max-w-[90vw] max-h-[90vh] overflow-auto relative shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="m-0 text-gray-800">{selectedCertificate.title}</h3>
                  <p className="mt-2 mb-0 text-gray-500 text-[0.9rem]">
                    Student: <span className="text-gray-500">{selectedCertificate.student}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCertificate(false);
                    setSelectedCertificate(null);
                  }}
                  className="bg-red-500 text-white border-none rounded-full w-10 h-10 text-[1.2rem] cursor-pointer flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Certificate Image */}
              <div className="text-center">
                <img
                  src={selectedCertificate.url}
                  alt="Achievement Certificate"
                  className="max-w-full max-h-[70vh] rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden p-8 text-gray-500">
                  <FaExclamationCircle className="text-[2rem] mb-4" />
                  <p>Unable to load certificate image</p>
                  <a
                    href={selectedCertificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 no-underline"
                  >
                    📎 Open in new tab
                  </a>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <a
                  href={selectedCertificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white py-2 px-4 rounded-md no-underline mr-4 inline-flex items-center gap-2"
                >
                  🔗 Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowCertificate(false);
                    setSelectedCertificate(null);
                  }}
                  className="bg-gray-500 text-white border-none rounded-md py-2 px-4 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
