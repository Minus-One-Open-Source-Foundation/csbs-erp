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
        <div className="text-center mb-8 text-gray-800">
          <h1 className="text-[2.5rem] mb-2 flex items-center justify-center gap-4 max-sm:text-[1.6rem] max-sm:gap-2">
            <FaTrophy className="text-red-400" /> Achievement Requests
          </h1>
          <p className="text-[1.1rem] text-gray-500">
            Review and manage student achievement submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8 gap-4 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`py-3 px-6 rounded-[25px] font-bold cursor-pointer transition-all duration-300 relative text-[0.9rem] shadow-sm hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] ${filter === category
                ? "bg-red-400 text-white border-2 border-red-400"
                : "bg-white text-gray-800 border-2 border-gray-200"
                }`}
            >
              {categoryLabels[category]}
              <span className={`rounded-full py-0.5 px-2 text-[0.8rem] ml-2 min-w-[1.5rem] inline-block text-center ${filter === category ? "bg-white/30 text-white" : "bg-blue-600 text-white"
                }`}>
                {getStatusCount(category)}
              </span>
            </button>
          ))}
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
          <div className="grid gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] border-2 ${achievement.status === 'PENDING' ? "border-yellow-400" :
                  achievement.status === 'APPROVED' ? "border-green-500" :
                    "border-red-500"
                  }`}
              >
                <div className="grid grid-cols-[1fr_auto] gap-4 items-start max-sm:grid-cols-1">
                  {/* Achievement Details */}
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="m-0 text-gray-800 text-[1.3rem]">
                        {achievement.title}
                      </h3>
                      <span className={`text-white py-1 px-3 rounded-[15px] text-[0.8rem] font-bold ${achievement.status === 'PENDING' ? "bg-yellow-400" :
                        achievement.status === 'APPROVED' ? "bg-green-500" : "bg-red-500"
                        }`}>
                        {achievement.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-4 max-[480px]:grid-cols-1">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaUser />
                        <span><strong>Student:</strong> {achievement.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaTrophy />
                        <span><strong>Category:</strong> {achievementCategoryLabels[achievement.category] || achievement.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaCalendar />
                        <span><strong>Submitted:</strong> {formatDate(achievement.createdAt)}</span>
                      </div>
                    </div>

                    {achievement.description && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <FaFileAlt />
                          <strong>Description:</strong>
                        </div>
                        <p className="m-0 text-gray-600 leading-relaxed pl-6">
                          {achievement.description}
                        </p>
                      </div>
                    )}

                    {achievement.imageUrl && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
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
                          className="bg-blue-600 text-white border-none rounded-md py-2 px-4 ml-6 cursor-pointer text-[0.9rem] flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300"
                        >
                          <FaImage /> View Certificate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {achievement.status === 'PENDING' && (
                    <div className="flex gap-2 flex-col max-sm:flex-row">
                      <button
                        onClick={() => handleApprove(achievement.id)}
                        disabled={processingIds.has(achievement.id)}
                        className="py-2 px-4 bg-green-500 text-white border-none rounded-md cursor-pointer text-[0.9rem] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
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
                        className="py-2 px-4 bg-red-500 text-white border-none rounded-md cursor-pointer text-[0.9rem] font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        {processingIds.has(achievement.id) ? (
                          <FaSpinner className="animate-spin" />
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
          <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-8 max-sm:p-3">
            <div className="bg-white rounded-xl p-6 max-w-[90vw] max-h-[90vh] overflow-auto relative shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                <div>
                  <h3 className="m-0 text-gray-800">{selectedCertificate.title}</h3>
                  <p className="mt-2 mb-0 text-gray-500 text-[0.9rem]">
                    Student: {selectedCertificate.student}
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
