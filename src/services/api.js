import axios from "axios";

const api = axios.create({
  baseURL: (() => {
    let url = import.meta.env.VITE_API_URL;
    // Fallback to localhost only if strictly necessary or removed per instruction
    if (!url) {
      console.warn('VITE_API_URL is not defined in .env');
      return '/api'; // Relative path for proxy or similar
    }
    if (!url.endsWith('/api')) {
      return url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  })(), // Spring Boot backend
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🚀 API Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    fullURL: config.baseURL + config.url,
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'None'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.response?.data?.message || error.message
    });
    
    // Handle authentication errors globally
    if (error.response?.status === 401) {
      console.warn('Authentication failed - clearing stored credentials');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Add methods to the api instance
api.getAllProfiles = async () => {
  const response = await api.get('/profile/all');
  return response.data;
};

api.deleteUserByEmail = async (email) => {
  const response = await api.delete(`/profile/user/${email}`);
  return response.data;
};

// Authentication API functions
// Matches AuthController endpoints: @RequestMapping("/api/auth")
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      // Handle HTTP error responses
      if (error.response) {
        // Extract error message from AuthResponse if available
        const errorMessage = error.response.data?.message || 'Login failed';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
  
  register: async (name, email, password) => {
    const requestData = { 
      username: name,  // Your DTO expects 'username', not 'name'
      email, 
      password,
      role: "STUDENT"  // All registrations are for students, faculty added via database
    };
    console.log('Sending registration request:', requestData); // Debug log
    
    try {
      const response = await api.post('/auth/register', requestData);
      console.log('API register response status:', response.status); // Debug log
      console.log('API register response data:', response.data); // Debug log
      
      // If we get here, the request was successful (status 200-299)
      return response.data;
    } catch (error) {
      console.error('API register error:', error); // Debug log
      
      // Only throw for actual HTTP errors (400, 500, etc.)
      if (error.response) {
        // This is an HTTP error response from your backend
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        // Extract the actual error message from your AuthResponse
        const errorMessage = error.response.data?.message || 'Registration failed';
        throw new Error(errorMessage);
      }
      
      // Network error
      throw new Error('Network error - please check your connection');
    }
  }
};

// File upload API (for blob storage)
const fileAPI = axios.create({
  baseURL: (() => {
    let url = import.meta.env.VITE_API_URL;
    if (!url) return 'http://localhost:8080/api';
    if (!url.endsWith('/api')) {
      return url.endsWith('/') ? `${url}api` : `${url}/api`;
    }
    return url;
  })(), // Ensure /api prefix for file endpoints too
});

// Add token to file requests if available
fileAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fileService = {
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fileAPI.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data; // This should return the file URL
    } catch (error) {
      console.error('File upload error:', error);
      if (error.response) {
        throw new Error(error.response.data || 'File upload failed');
      }
      throw new Error('Network error during file upload');
    }
  },

  downloadFile: async (filename) => {
    try {
      const response = await fileAPI.get(`/files/download/${filename}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('File download error:', error);
      throw new Error('File download failed');
    }
  }
};

// Events API - Updated to match your controller exactly
export const eventsAPI = {
  // Create new event with file upload - matches your controller exactly
  createEvent: async (eventData, file) => {
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('type', eventData.type); // HACKATHON or WORKSHOP
    formData.append('eventDate', eventData.eventDate); // YYYY-MM-DD format
    formData.append('userEmail', eventData.userEmail);
    
    if (file) {
      formData.append('file', file);
    }

    console.log('Sending event data:', {
      title: eventData.title,
      description: eventData.description,
      type: eventData.type,
      eventDate: eventData.eventDate,
      userEmail: eventData.userEmail,
      hasFile: !!file
    });

    const response = await api.post('/events/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user events
  getUserEvents: async (userEmail) => {
    const response = await api.get(`/events/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Get events by type
  getUserEventsByType: async (userEmail, type) => {
    const response = await api.get(`/events/user/${encodeURIComponent(userEmail)}/type/${type}`);
    return response.data;
  },

  // Search events
  searchUserEvents: async (userEmail, query) => {
    const response = await api.get(`/events/user/${encodeURIComponent(userEmail)}/search`, {
      params: { query }
    });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id, userEmail) => {
    const response = await api.get(`/events/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Update event status (for faculty)
  updateEventStatus: async (id, status) => {
    const response = await api.put(`/events/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  // Delete event
  deleteEvent: async (id, userEmail) => {
    const response = await api.delete(`/events/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  }
};

// Profile API - matches your ProfileController
export const profileAPI = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Making profile request with token:', token ? 'Present' : 'Missing');
      
      const response = await api.get('/profile');
      console.log('Profile API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. Invalid authentication.');
      } else if (error.response?.status === 404) {
        throw new Error('Profile not found. Please create your profile first.');
      } else if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to load profile');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Making profile update request with token:', token ? 'Present' : 'Missing');
      console.log('Sending profile data:', profileData);
      
      const response = await api.put('/profile', profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. Invalid authentication.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid profile data. Please check all fields.');
      } else if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Alternative methods using path parameters for email (matches your controller structure)
  getUserProfileByEmail: async (email) => {
    try {
      console.log('Making profile request by email path param:', email);
      
      // Use path parameter instead of request body
      const encodedEmail = encodeURIComponent(email);
      const response = await api.get(`/profile/user/${encodedEmail}`);
      console.log('Profile by email response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile by email:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Profile not found for this user.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid email format.');
      }
      throw error;
    }
  },

  updateUserProfileByEmail: async (email, profileData) => {
    try {
      console.log('Updating profile by email path param:', email, profileData);
      
      // Use path parameter for email and send profile data in body
      const encodedEmail = encodeURIComponent(email);
      const response = await api.put(`/profile/user/${encodedEmail}`, profileData);
      console.log('Profile update by email response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile by email:', error);
      
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid profile data.');
      }
      throw error;
    }
  },

  // New method for multipart form data with file upload (matches your updated ProfileController)
  updateUserProfileByEmailWithFile: async (email, formData) => {
    try {
      console.log('Updating profile with file by email path param:', email);
      
      // Use path parameter for email and send FormData (multipart/form-data)
      const encodedEmail = encodeURIComponent(email);
      const response = await api.put(`/profile/user/${encodedEmail}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Profile update with file response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile with file by email:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid profile data or file format.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please select a smaller image.');
      }
      throw error;
    }
  },

  // Transfer account (update email)
  transferAccount: async (currentEmail, newEmail) => {
    try {
      console.log('Transferring account from:', currentEmail, 'to:', newEmail);
      
      const encodedCurrentEmail = encodeURIComponent(currentEmail);
      const response = await api.put(`/profile/user/${encodedCurrentEmail}/transfer-email`, {
        newEmail: newEmail
      });
      console.log('Account transfer response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to transfer account:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        throw new Error('Current user not found.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid email format or email already exists.');
      } else if (error.response?.status === 409) {
        throw new Error('The new email address is already in use.');
      }
      throw error;
    }
  }
};

// Faculty API - matches your FacultyController
export const facultyAPI = {
  // Get all pending events for faculty review
  getPendingEvents: async () => {
    const response = await api.get('/faculty/events/pending');
    return response.data;
  },

  // Get pending events by type
  getPendingEventsByType: async (type) => {
    const response = await api.get(`/faculty/events/pending/${type}`);
    return response.data;
  },

  // Approve an event
  approveEvent: async (id) => {
    const response = await api.put(`/faculty/events/${id}/approve`);
    return response.data;
  },

  // Reject an event
  rejectEvent: async (id) => {
    const response = await api.put(`/faculty/events/${id}/reject`);
    return response.data;
  },

  // Get all events with their status
  getAllEvents: async () => {
    const response = await api.get('/faculty/events/all');
    return response.data;
  },

  // Get events by status
  getEventsByStatus: async (status) => {
    const response = await api.get(`/faculty/events/status/${status}`);
    return response.data;
  },

  // Internship management endpoints for faculty
  // Get all pending internships for faculty review
  getPendingInternships: async () => {
    const response = await api.get('/faculty/internships/pending');
    return response.data;
  },

  // Get all internships with their status
  getAllInternships: async () => {
    const response = await api.get('/faculty/internships/all');
    return response.data;
  },

  // Approve an internship
  approveInternship: async (id) => {
    const response = await api.put(`/faculty/internships/${id}/approve`);
    return response.data;
  },

  // Reject an internship
  rejectInternship: async (id) => {
    const response = await api.put(`/faculty/internships/${id}/reject`);
    return response.data;
  },

  // Achievement management endpoints for faculty
  // Get all pending achievements for faculty review
  getPendingAchievements: async () => {
    const response = await api.get('/achievements/faculty/pending');
    return response.data;
  },

  // Get all achievements with their status
  getAllAchievementsForFaculty: async () => {
    const response = await api.get('/achievements/faculty/all');
    return response.data;
  },

  // Approve an achievement
  approveAchievement: async (id) => {
    const response = await api.put(`/achievements/faculty/${id}/approve`);
    return response.data;
  },

  // Reject an achievement
  rejectAchievement: async (id) => {
    const response = await api.put(`/achievements/faculty/${id}/reject`);
    return response.data;
  }
};

// Internship API - matches your InternshipController
export const internshipAPI = {
  // Create a new internship
  createInternship: async (formData) => {
    const response = await api.post('/internships/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user internships
  getUserInternships: async (userEmail) => {
    const response = await api.get(`/internships/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Get internship by ID
  getInternshipById: async (id, userEmail) => {
    const response = await api.get(`/internships/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  }
};

// Achievements API - matches your AchievementController
export const achievementAPI = {
  // Test connection to achievements endpoint
  testConnection: async () => {
    try {
      const response = await api.get('/achievements/faculty/all');
      console.log('Backend connection test successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { success: false, error };
    }
  },

  // Create a new achievement
  createAchievement: async (formData) => {
    const response = await api.post('/achievements/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user achievements
  getUserAchievements: async (userEmail) => {
    console.log('Making API call to get user achievements for:', userEmail);
    const response = await api.get(`/achievements/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Get achievement by ID
  getAchievementById: async (id, userEmail) => {
    const response = await api.get(`/achievements/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Delete achievement
  deleteAchievement: async (id, userEmail) => {
    const response = await api.delete(`/achievements/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Faculty endpoints
  getPendingAchievements: async () => {
    const response = await api.get('/achievements/faculty/pending');
    return response.data;
  },

  getAllForFaculty: async () => {
    console.log('📥 Fetching all achievements for faculty review...');
    console.log('🔗 Making request to: /achievements/faculty/all');
    try {
      const response = await api.get('/achievements/faculty/all');
      console.log('✅ Faculty achievements API response:', response.data);
      // Backend returns List<AchievementResponse> directly
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Faculty achievements API error:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    console.log(`🔄 Updating achievement ${id} status to ${status}`);
    try {
      const response = await api.put(`/achievements/faculty/${id}/status`, null, {
        params: { status }
      });
      console.log('✅ Status update response:', response.data);
      return { success: response.data.success, data: response.data };
    } catch (error) {
      console.error('❌ Status update error:', error);
      throw error;
    }
  },

  // Legacy endpoints (kept for compatibility)
  getAllAchievements: async () => {
    const response = await api.get('/achievements/faculty/all');
    return response.data;
  },

  approveAchievement: async (id) => {
    const response = await api.put(`/achievements/faculty/${id}/approve`);
    return response.data;
  },

  rejectAchievement: async (id) => {
    const response = await api.put(`/achievements/faculty/${id}/reject`);
    return response.data;
  },

  updateAchievementStatus: async (id, status) => {
    const response = await api.put(`/achievements/faculty/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

// Resume API for URMS (Unified Resume Management System)
export const resumeAPI = {
  // Get all resumes for a user
  getUserResumes: async (userEmail) => {
    const response = await api.get(`/resumes/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Upload a new resume
  uploadResume: async (userEmail, role, file) => {
    const formData = new FormData();
    formData.append('userEmail', userEmail);
    formData.append('role', role);
    formData.append('file', file);

    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get resume by ID
  getResumeById: async (userEmail, id) => {
    const response = await api.get(`/resumes/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Delete resume
  deleteResume: async (userEmail, id) => {
    const response = await api.delete(`/resumes/${id}/user/${encodeURIComponent(userEmail)}`);
    return response.data;
  },

  // Get download URL for resume
  getDownloadUrl: async (userEmail, id) => {
    const response = await api.get(`/resumes/${id}/download/user/${encodeURIComponent(userEmail)}`);
    return response.data; // This will be the download URL
  }
};

export default api;
