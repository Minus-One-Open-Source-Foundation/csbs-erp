import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaTrophy, FaCheckCircle, FaExclamationCircle, FaFileAlt, FaSpinner, FaTimes } from "react-icons/fa";
import { achievementAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Achievements() {
  console.log('🎯 Achievements component initialized');

  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    achievementType: "SYMPOSIUM",
    extraType: "SPORTS",
    otherAchievementType: "",
    otherExtraType: "",
    description: "",
    date: "",
    image: null,
  });

  // Get user email from localStorage
  const getUserEmail = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('📧 User email retrieved:', user.email);
      return user.email;
    }
    console.warn('⚠️ No user data found in localStorage');
    return null;
  };

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const result = await achievementAPI.testConnection();
      if (result.success) {
        console.log('✅ Backend is reachable');
        return true;
      } else {
        console.error('❌ Backend test failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connectivity test error:', error);
      return false;
    }
  };

  // Fetch user achievements on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      // First test backend connectivity
      const isBackendReachable = await testBackendConnection();

      if (isBackendReachable) {
        fetchUserAchievements();
      } else {
        setLoading(false);
        setError(`Cannot connect to the backend server. Please ensure the server is running on ${import.meta.env.VITE_API_URL || 'the configured API URL'}`);
      }
    };

    initializeComponent();
  }, []);

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      console.log('Fetching achievements for user:', userEmail);

      if (!userEmail) {
        setError('Please log in to view your achievements');
        return;
      }

      const userAchievements = await achievementAPI.getUserAchievements(userEmail);
      console.log('Fetched achievements:', userAchievements);

      if (userAchievements && userAchievements.length > 0) {
        // Debug: Log all achievement categories
        const categories = userAchievements.map(ach => ach.category);
        console.log('🏷️ Achievement categories found:', categories);
        console.log('📋 Sample achievement data:', userAchievements[0]);
      }

      setAchievements(userAchievements);
      setError(null);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      // More specific error messages
      if (err.response?.status === 404) {
        setError('Achievement service not found. Please check if the backend server is running.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError(`Cannot connect to server. Please check if the backend is running on ${import.meta.env.VITE_API_URL || 'the configured API URL'}`);
      } else {
        setError(`Failed to load achievements: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const saveAchievement = async () => {
    try {
      if (!formData.title.trim()) {
        toast.warning("Please enter a title!");
        return;
      }

      setSubmitting(true);
      const userEmail = getUserEmail();
      if (!userEmail) {
        toast.error('Please log in to submit an achievement');
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      // Include the specific achievement type (handle co- and extra-curricular)
      let finalType = '';
      if (formData.category === 'CO_CURRICULAR') {
        finalType = formData.achievementType === 'OTHERS' ? formData.otherAchievementType : formData.achievementType;
      } else if (formData.category === 'EXTRA_CURRICULAR') {
        finalType = formData.extraType === 'OTHERS' ? formData.otherExtraType : formData.extraType;
      } else {
        finalType = formData.achievementType || formData.extraType || '';
      }
      submitData.append('achievementType', finalType);
      submitData.append('description', formData.description);
      // Include optional date if provided
      if (formData.date) submitData.append('date', formData.date);
      submitData.append('userEmail', userEmail);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Debug: Log what we're sending
      console.log('📤 Submitting achievement data:');
      console.log('- Title:', formData.title);
      console.log('- Category:', formData.category);
      console.log('- Achievement Type:', finalType);
      console.log('- Description:', formData.description);
      console.log('- Date:', formData.date);
      console.log('- User Email:', userEmail);
      console.log('- Has Image:', !!formData.image);

      // Submit to backend
      const response = await achievementAPI.createAchievement(submitData);

      if (response.success) {
        // Refresh the achievements list
        await fetchUserAchievements();
        setShowForm(false);
        setFormData({
          title: "",
          category: "",
          achievementType: "SYMPOSIUM",
          otherAchievementType: "",
          extraType: "SPORTS",
          otherExtraType: "",
          description: "",
          date: "",
          image: null,
        });
        toast.success('Achievement submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit achievement');
      }
    } catch (err) {
      console.error('Error submitting achievement:', err);
      toast.error('Failed to submit achievement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAchievements = achievements.filter(
    (ach) => {
      const categoryMatch = activeCategory === "All" || ach.category === activeCategory;
      const searchMatch = ach.title.toLowerCase().includes(search.toLowerCase()) ||
        ach.category.toLowerCase().includes(search.toLowerCase()) ||
        (ach.description && ach.description.toLowerCase().includes(search.toLowerCase()));

      // Debug logging for filtering
      if (activeCategory !== "All") {
        console.log(`🔍 Filtering: "${ach.title}" - Category: "${ach.category}" vs Active: "${activeCategory}" - Match: ${categoryMatch}`);
      }

      return categoryMatch && searchMatch;
    }
  );

  // Debug: Log filtered results
  console.log(`📊 Filtered ${filteredAchievements.length} achievements for category: ${activeCategory}`);

  const categories = ["All", "CO_CURRICULAR", "EXTRA_CURRICULAR"];
  const categoryLabels = {
    "All": "All",
    "CO_CURRICULAR": "Co-Curricular",
    "EXTRA_CURRICULAR": "Extra-Curricular"
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen py-12 px-8 bg-cover bg-center bg-fixed font-sans flex flex-col items-center max-sm:py-6 max-sm:px-3"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="text-center p-12 bg-white/90 rounded-lg mx-auto max-w-[400px]">
          <FaSpinner className="animate-spin text-[2rem] text-blue-600 mx-auto" />
          <p className="text-[1.1rem] text-gray-600 mt-4 mb-2">Loading your achievements...</p>
          <div className="text-[0.9rem] text-gray-500">
            Connecting to server and fetching your data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen py-12 px-8 bg-cover bg-center bg-fixed font-sans flex flex-col items-center max-sm:py-6 max-sm:px-3"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="text-center p-12 bg-white/90 rounded-lg mx-auto max-w-[600px]">
          <h2 className="text-red-600 mb-4">⚠️ Connection Error</h2>
          <p className="text-red-600 text-[1.1rem] mb-4">{error}</p>

          <div className="bg-gray-100 p-4 rounded mb-4 text-left">
            <h4 className="m-0 mb-2 text-gray-700">🔧 Troubleshooting:</h4>
            <ul className="m-0 pl-6 text-gray-500">
              <li>Check if the backend server is running</li>
              <li>Verify backend URL: <code>{import.meta.env.VITE_API_URL || 'Configured API URL'}</code></li>
              <li>Check browser console for detailed error logs</li>
              <li>Ensure you are logged in with a valid account</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                console.log('🔄 Retrying connection...');
                setError(null);
                const initializeComponent = async () => {
                  const isBackendReachable = await testBackendConnection();
                  if (isBackendReachable) {
                    fetchUserAchievements();
                  } else {
                    setError('Cannot connect to the backend server. Please ensure the server is running.');
                  }
                };
                initializeComponent();
              }}
              className="py-2 px-4 bg-blue-600 text-white border-none rounded cursor-pointer"
            >
              🔄 Retry Connection
            </button>
            <button
              onClick={() => {
                console.log('Current user data:', localStorage.getItem('userData'));
                console.log('Current token:', localStorage.getItem('token'));
                toast.info('Check browser console for debug information');
              }}
              className="py-2 px-4 bg-gray-500 text-white border-none rounded cursor-pointer"
            >
              🐛 Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-8 bg-cover bg-center bg-fixed font-sans flex flex-col items-center max-sm:py-6 max-sm:px-3"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <h1 className="text-2xl font-bold text-black mb-2">Achievements</h1>
      <p className="text-gray-500 mb-6 text-center">Add and manage your Co-Curricular and Extra-Curricular Achievements</p>

      {/* Top Controls */}
      <div className="flex flex-col items-stretch gap-10">
        <input
          type="text"
          placeholder="Search achievements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[700px] py-4 px-5 rounded-[30px] border-none outline-none text-[1.1rem] text-white placeholder:text-white placeholder:opacity-80 max-sm:max-w-full"
          style={{ background: "linear-gradient(90deg, #a18cd1, #fbc2eb)" }}
        />

        <div className="flex gap-2.5 flex-wrap items-center max-sm:gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`py-2.5 px-3.5 rounded-[14px] border cursor-pointer text-[0.9rem] font-medium transition-all duration-200 ${activeCategory === cat
                ? "text-white border-transparent max-sm:py-2 max-sm:px-2.5 max-sm:text-[0.8rem]"
                : "bg-white text-black border-gray-300"
                }`}
              style={activeCategory === cat ? { background: "linear-gradient(90deg, #ff6a00, #ee0979)" } : {}}
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}

          <button
            className="py-3 px-5 text-white font-semibold border-none rounded-[30px] cursor-pointer"
            style={{ background: "linear-gradient(90deg, #ff6a00, #ee0979)" }}
            onClick={() => {
              setFormData({ title: "", category: "", achievementType: "SYMPOSIUM", otherAchievementType: "", extraType: "SPORTS", otherExtraType: "", description: "", date: "", image: null });
              setShowForm(true);
            }}
          >
            + Add Achievement
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-[2000]"
          onClick={() => { setShowForm(false); setFormData({ title: "", category: "", achievementType: "SYMPOSIUM", otherAchievementType: "", extraType: "SPORTS", otherExtraType: "", description: "", date: "", image: null }); }}
        >
          <div
            className="bg-white p-6 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.2)] flex flex-col gap-3 w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto max-sm:w-[95%] max-sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add Achievement</h2>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-base">
                <option value="">Select Category</option>
                <option value="CO_CURRICULAR">Co-Curricular</option>
                <option value="EXTRA_CURRICULAR">Extra-Curricular</option>
              </select>
            </div>

            {formData.category === "CO_CURRICULAR" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Event</label>
                  <select name="achievementType" value={formData.achievementType} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-base">
                  <option value="SYMPOSIUM">Symposium</option>
                  <option value="INTRA_DEPARTMENT">Intra-Department</option>
                  <option value="INTER_DEPARTMENT">Inter-Department</option>
                  <option value="OTHERS">Others</option>
                  </select>
                </div>

                {formData.achievementType === "OTHERS" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Event (Other)</label>
                    <input
                      type="text"
                      name="otherAchievementType"
                      placeholder="Write what (Achievement Type)"
                      value={formData.otherAchievementType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base"
                    />
                  </div>
                )}

                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Achievement Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Achievement Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg bg-gray-50 w-full">
                    <label
                      className="bg-white border border-gray-300 px-4 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Choose File
                      <input
                        type="file"
                        name="image"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className={`text-sm truncate ${formData.image ? 'text-blue-600 font-medium' : 'text-gray-500 italic'}`}>
                      {formData.image ? formData.image.name : 'No file chosen'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Allowed formats: jpg, jpeg, png</div>
                </div>

                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button
                    onClick={saveAchievement}
                    disabled={submitting}
                    className="py-2.5 px-5 text-white border-none rounded-lg cursor-pointer font-semibold flex items-center gap-2 disabled:cursor-not-allowed"
                    style={{
                      background: submitting ? '#ccc' : 'linear-gradient(90deg, #ff6a00, #ee0979)',
                    }}
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    className="bg-white text-black border border-gray-300 rounded-lg py-2.5 px-5 cursor-pointer"
                    onClick={() => { setShowForm(false); setFormData({ title: "", category: "", achievementType: "SYMPOSIUM", otherAchievementType: "", extraType: "SPORTS", otherExtraType: "", description: "", date: "", image: null }); }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {formData.category === "EXTRA_CURRICULAR" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Event</label>
                  <select name="extraType" value={formData.extraType} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg text-base">
                    <option value="SPORTS">Sports</option>
                    <option value="OTHERS">Others</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>

                {formData.extraType === 'OTHERS' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Event (Other)</label>
                    <input
                      type="text"
                      name="otherExtraType"
                      placeholder="Write what (Achievement Type)"
                      value={formData.otherExtraType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Achievement Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Achievement Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Description</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-2 border border-gray-300 rounded-lg bg-gray-50 w-full">
                    <label
                      className="bg-white border border-gray-300 px-4 py-2 rounded-md cursor-pointer text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Choose File
                      <input
                        type="file"
                        name="image"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className={`text-sm truncate ${formData.image ? 'text-blue-600 font-medium' : 'text-gray-500 italic'}`}>
                      {formData.image ? formData.image.name : 'No file chosen'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Allowed formats: jpg, jpeg, png</div>
                </div>

                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button
                    onClick={saveAchievement}
                    disabled={submitting}
                    className="py-2.5 px-5 text-white border-none rounded-lg cursor-pointer font-semibold flex items-center gap-2 disabled:cursor-not-allowed"
                    style={{
                      background: submitting ? '#ccc' : 'linear-gradient(90deg, #ff6a00, #ee0979)',
                    }}
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    className="bg-white text-black border border-gray-300 rounded-lg py-2.5 px-5 cursor-pointer"
                    onClick={() => { setShowForm(false); setFormData({ title: "", category: "", achievementType: "SYMPOSIUM", otherAchievementType: "", extraType: "SPORTS", otherExtraType: "", description: "", date: "", image: null }); }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Achievements List */}
      <div className="w-full max-w-[1900px] flex flex-col gap-5 mt-5">
        {filteredAchievements.length === 0 ? (
          <div className="text-center p-12 bg-white/90 rounded-lg">
            {search ? (
              <div>
                <p className="text-[1.1rem] text-gray-500 mb-2">
                  No achievements found matching "{search}"
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="bg-blue-600 text-white border-none py-2 px-4 rounded cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-[1.1rem] text-gray-500">
                {activeCategory === 'All'
                  ? 'No achievements found. Click "Add Achievement" to create your first achievement entry.'
                  : `No ${categoryLabels[activeCategory].toLowerCase()} achievements found.`
                }
              </p>
            )}
          </div>
        ) : (
          filteredAchievements.map((ach) => (
            <div key={ach.id} className="bg-[#f9f9f9] p-5 rounded-xl flex justify-between items-start shadow-[0_4px_15px_rgba(0,0,0,0.1)] min-h-[140px] max-sm:flex-col max-sm:gap-3 max-sm:p-4">
              <div className="flex flex-col gap-1.5">
                <div className="inline-block py-2 px-4 border-2 border-[#ff6a00] rounded-xl text-[#ff6a00] text-[0.9rem] font-semibold bg-transparent cursor-default mb-2">
                  {categoryLabels[ach.category] || ach.category}
                </div>
                <strong className="text-[#3a3aee] text-base">{ach.title}</strong>
                <div className="text-gray-500 text-[0.9rem] font-normal mb-2.5">{formatDate(ach.createdAt)}</div>
                <div className="text-black text-base">{ach.description}</div>
                {ach.imageFilename && (
                  <div className="text-[0.9rem] text-gray-500 mt-2">
                    <strong>File:</strong> {ach.imageFilename}
                  </div>
                )}
              </div>

              {/* Right-side container */}
              <div className="flex flex-col items-center gap-3">
                <div className={`font-bold text-[0.95rem] ${ach.status === "APPROVED" ? "text-green-500" :
                  ach.status === "REJECTED" ? "text-red-500" : "text-orange-500"
                  }`}>
                  {ach.status === "APPROVED" ? (
                    <span>
                      <FaCheckCircle className="inline mr-1" /> Approved
                    </span>
                  ) : ach.status === "REJECTED" ? (
                    <span>
                      <FaTimes className="inline mr-1" /> Rejected
                    </span>
                  ) : (
                    <span>
                      <FaExclamationCircle className="inline mr-1" /> Pending
                    </span>
                  )}
                </div>

                <div className="w-[140px] h-[140px] flex items-center justify-center">
                  {ach.imageUrl ? (
                    <img
                      src={ach.imageUrl}
                      alt="Achievement Image"
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => window.open(ach.imageUrl, "_blank")}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FaFileAlt className="text-[2rem] text-[#a18cd1]" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
