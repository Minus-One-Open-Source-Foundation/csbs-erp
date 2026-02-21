import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { profileAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

export default function StudentProfile() {
  const { user } = useAuth();
  const [info, setInfo] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    department: "",
    regno: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load profile data from backend on component mount
  useEffect(() => {
    const loadProfile = async () => {
      console.log('Starting profile load for user:', user);

      if (user?.email) {
        console.log('User email found:', user.email);
        try {
          // Try the standard approach first, then fallback to email-based
          let profileData;
          try {
            console.log('Attempting standard getUserProfile...');
            profileData = await profileAPI.getUserProfile();
            console.log('Standard approach successful:', profileData);
          } catch (authError) {
            console.log('Standard auth failed, error details:', {
              message: authError.message,
              status: authError.response?.status,
              data: authError.response?.data
            });
            console.log('Trying email-based approach with email:', user.email);
            profileData = await profileAPI.getUserProfileByEmail(user.email);
            console.log('Email-based approach successful:', profileData);
          }

          console.log('Raw profile data from backend:', JSON.stringify(profileData, null, 2));

          // Helper function to convert Indian date format (dd-MM-yyyy) to HTML date input format (yyyy-MM-dd)
          const convertIndianDateToISO = (indianDate) => {
            if (!indianDate) return "";

            console.log('Converting Indian date format:', indianDate);

            // Check if it's already in ISO format (yyyy-MM-dd)
            if (indianDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              console.log('Date already in ISO format:', indianDate);
              return indianDate;
            }

            // Convert from dd-MM-yyyy to yyyy-MM-dd
            if (indianDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
              const [day, month, year] = indianDate.split('-');
              const isoDate = `${year}-${month}-${day}`;
              console.log('Converted Indian date', indianDate, 'to ISO:', isoDate);
              return isoDate;
            }

            console.warn('Unrecognized date format:', indianDate);
            return "";
          };

          // Map backend data to frontend structure (matching your UserService DTO structure)
          setInfo({
            name: profileData.name || profileData.username || "",
            dob: convertIndianDateToISO(profileData.dateOfBirth),
            phone: profileData.phoneNumber || profileData.phone ? String(profileData.phoneNumber || profileData.phone) : "", // Backend returns phoneNumber
            email: profileData.email || user.email || "",
            department: profileData.department || "",
            regno: profileData.registerNumber || "",
          });

          // Set profile image if available from backend
          if (profileData.profileImageUrl) {
            console.log('Setting profile image from backend:', profileData.profileImageUrl);
            setProfilePic(profileData.profileImageUrl);
          }

          console.log('Mapped profile info:', {
            name: profileData.name || profileData.username || "",
            dob: profileData.dateOfBirth || "",
            phone: profileData.phoneNumber || profileData.phone,
            email: profileData.email,
            department: profileData.department,
            registerNumber: profileData.registerNumber,
            profileImageUrl: profileData.profileImageUrl
          });
          console.log('🎂 Date of Birth loaded from backend:', profileData.dateOfBirth);
        } catch (error) {
          console.error('Failed to load profile:', error);

          // Show specific error messages to help debug
          if (error.message.includes('Authentication required')) {
            toast.error('Please log in again to access your profile.');
            // Optionally redirect to login
          } else if (error.message.includes('Profile not found')) {
            console.log('No existing profile found, starting with empty form');
          }

          // If profile doesn't exist or error occurs, initialize with user data
          console.log('Setting fallback user info with email:', user.email);
          setInfo(prev => ({
            ...prev,
            email: user.email || "",
            name: user.name || user.username || ""  // Set any available name from user context
          }));
        }
      } else {
        console.log('No user email available, skipping profile load. User object:', user);
      }
      setLoading(false);
    };

    console.log('PersonalInfo component mounted/updated. User:', user);

    // Load profile when we have a user email
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent email and register number changes
    if (name === 'email') {
      console.log('Email changes are not allowed through edit profile. Use Transfer Account instead.');
      return;
    }

    if (name === 'regno') {
      console.log('Register number changes are not allowed.');
      return;
    }

    // Real-time phone number validation - prevent spaces
    if (name === 'phone') {
      // Remove spaces as user types
      const cleanValue = value.replace(/\s+/g, '');
      if (cleanValue !== value) {
        // Show warning if spaces were removed
        console.log('Removed spaces from phone number');
      }
      setInfo({ ...info, [name]: cleanValue });
    } else {
      setInfo({ ...info, [name]: value });
    }
  };

  // Get field validation status
  const getFieldValidationClass = (fieldName) => {
    if (!isEditing) return '';

    const errors = validateForm();
    const hasError = errors.some(error =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );

    return hasError ? 'invalid' : '';
  };

  const validateForm = () => {
    const errors = [];

    // Name validation
    if (!info.name || info.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (info.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (!/^[a-zA-Z\s]+$/.test(info.name.trim())) {
      errors.push('Name can only contain letters and spaces');
    }

    // Email validation - Skip validation since email is read-only and managed by Transfer Account
    // Email is always provided from authentication and cannot be changed through the form
    if (!info.email || info.email.trim().length === 0) {
      errors.push('Email is required (please log in again if missing)');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) {
      errors.push('Invalid email format (contact support if this appears)');
    }

    // Phone number validation
    if (!info.phone || info.phone.trim().length === 0) {
      errors.push('Phone number is required');
    } else {
      const cleanPhone = info.phone.replace(/\s+/g, ''); // Remove all spaces
      if (cleanPhone !== info.phone) {
        errors.push('Phone number should not contain spaces');
      } else if (!/^\d{10}$/.test(cleanPhone)) {
        errors.push('Phone number must be exactly 10 digits');
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        errors.push('Phone number must start with 6, 7, 8, or 9');
      }
    }

    // Department validation
    if (!info.department || info.department.trim().length === 0) {
      errors.push('Department is required');
    } else if (info.department.trim().length < 2) {
      errors.push('Department name must be at least 2 characters long');
    }

    // Register number validation - skipped as it's now read-only
    // The register number is pre-populated from the backend and cannot be modified

    // Date of birth validation
    if (!info.dob) {
      errors.push('Date of birth is required');
    } else {
      const dobDate = new Date(info.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();

      if (dobDate > today) {
        errors.push('Date of birth cannot be in the future');
      } else if (age < 16) {
        errors.push('You must be at least 16 years old');
      } else if (age > 100) {
        errors.push('Please enter a valid date of birth');
      }
    }

    return errors;
  };

  const handleSave = async () => {
    if (!user?.email) {
      toast.error('Please log in to save profile');
      return;
    }

    // Validate form before saving
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(
        <div>
          Please fix the following errors:
          <ul>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      );
      return;
    }

    setSaving(true);

    console.log('=== PROFILE SAVE DEBUG START ===');
    console.log('Current form info state:', JSON.stringify(info, null, 2));
    console.log('User context:', JSON.stringify(user, null, 2));

    try {
      // Create FormData to match your controller's @ModelAttribute and MultipartFile expectations
      const formData = new FormData();

      // Helper function to convert ISO date format (yyyy-MM-dd) back to Indian format (dd-MM-yyyy) for backend
      const convertISOToIndianDate = (isoDate) => {
        if (!isoDate) return "";

        console.log('Converting ISO date to Indian format:', isoDate);

        // Check if it's in ISO format (yyyy-MM-dd)
        if (isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = isoDate.split('-');
          const indianDate = `${day}-${month}-${year}`;
          console.log('Converted ISO date', isoDate, 'to Indian:', indianDate);
          return indianDate;
        }

        // If already in Indian format, return as is
        console.log('Date already in Indian format or unrecognized:', isoDate);
        return isoDate;
      };

      // Add profile fields as form data (matches @ModelAttribute UserProfileDto)
      if (info.name) formData.append('name', info.name);
      if (info.department) formData.append('department', info.department);
      if (info.phone) formData.append('phoneNumber', info.phone);
      if (info.regno) formData.append('registerNumber', info.regno);
      if (info.dob) {
        const indianDateFormat = convertISOToIndianDate(info.dob);
        formData.append('dateOfBirth', indianDateFormat);
        console.log('🎂 Sending date to backend in Indian format:', indianDateFormat);
      }
      if (info.email) formData.append('email', info.email);

      // Add profile image file if selected (matches @RequestParam MultipartFile profileImage)
      if (profilePic && document.getElementById('fileInput').files[0]) {
        const imageFile = document.getElementById('fileInput').files[0];
        formData.append('profileImage', imageFile);
        console.log('Profile image file added:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
      }

      console.log('=== DATA BEING SENT TO BACKEND ===');
      console.log('Using FormData (multipart/form-data) format for @ModelAttribute');
      console.log('User Email for API call:', user.email);
      console.log('API Endpoint: PUT /api/profile/user/' + encodeURIComponent(user.email));
      console.log('Request Headers will include: Authorization: Bearer ' + (localStorage.getItem('token') ? '[TOKEN_PRESENT]' : '[NO_TOKEN]'));

      // Log FormData contents
      console.log('=== FORM DATA CONTENTS ===');
      console.log('Date of Birth field specifically:', info.dob, '(will be sent as dateOfBirth)');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [FILE] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: "${value}" (type: ${typeof value}, length: ${value?.length || 'null'})`);
          // Highlight dateOfBirth specifically
          if (key === 'dateOfBirth') {
            console.log(`🎂 DATE OF BIRTH: "${value}" - This will be stored in your backend!`);
          }
        }
      }

      // Use the email-based approach that matches your ProfileController
      console.log('=== API CALL START ===');
      console.log('Calling updateUserProfileByEmailWithFile with:');
      console.log('  - Email (path param):', user.email);
      console.log('  - Form Data (multipart):', 'FormData object with', formData.entries ? [...formData.entries()].length : 'unknown', 'entries');

      const updatedProfile = await profileAPI.updateUserProfileByEmailWithFile(user.email, formData);

      console.log('=== API RESPONSE RECEIVED ===');
      console.log('Updated Profile Response:', JSON.stringify(updatedProfile, null, 2));
      console.log('Response type:', typeof updatedProfile);
      if (updatedProfile && typeof updatedProfile === 'object') {
        console.log('Response keys:', Object.keys(updatedProfile));
      }

      console.log('=== SAVE SUCCESS ===');
      toast.success("Profile saved successfully!");
      setIsEditing(false); // Exit edit mode after saving

      // Update the form with the response data from backend
      if (updatedProfile) {
        console.log('Updating form with response data...');

        // Reuse the helper function to convert Indian date back to ISO for display
        const convertIndianDateToISO = (indianDate) => {
          if (!indianDate) return "";

          // Check if it's already in ISO format (yyyy-MM-dd)
          if (indianDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return indianDate;
          }

          // Convert from dd-MM-yyyy to yyyy-MM-dd
          if (indianDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = indianDate.split('-');
            return `${year}-${month}-${day}`;
          }

          return "";
        };

        setInfo({
          name: updatedProfile.name || updatedProfile.username || info.name,
          dob: convertIndianDateToISO(updatedProfile.dateOfBirth) || info.dob,
          phone: updatedProfile.phoneNumber || (updatedProfile.phone ? String(updatedProfile.phone) : info.phone), // Fix: use phoneNumber from backend
          email: updatedProfile.email || info.email,
          department: updatedProfile.department || info.department,
          regno: updatedProfile.registerNumber || info.regno,
        });

        // Update profile image if backend returned a new URL
        if (updatedProfile.profileImageUrl) {
          console.log('Updating profile image from save response:', updatedProfile.profileImageUrl);
          setProfilePic(updatedProfile.profileImageUrl);
        }
      }

    } catch (error) {
      console.error('=== SAVE ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      toast.error("Failed to save profile: " + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
      console.log('=== PROFILE SAVE DEBUG END ===');
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleTransferAccount = () => {
    const currentEmail = info.email; // User's current email
    const alternateEmail = prompt('Enter alternate account email:'); // Prompt user for alternate email

    if (!alternateEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alternateEmail)) {
      toast.warning('Please enter a valid email address.');
      return;
    }

    // Simulate manual transfer request
    toast.info(`Manual transfer initiated from ${currentEmail} to ${alternateEmail}`);

    // Replace with actual API call logic
    console.log(`Manual transfer: Current Email - ${currentEmail}, Alternate Email - ${alternateEmail}`);
  };

  const gradientInputBase = "w-full py-3 px-4 rounded-xl border border-[#c5b3f7] !bg-[#e5d1ff] text-gray-800 text-base outline-none placeholder:text-gray-500 placeholder:opacity-80";
  const readonlyInputClass = `${gradientInputBase} !bg-[#f5f5f5] !text-gray-500 cursor-default !border-gray-300 focus:shadow-none focus:!border-gray-300`;
  const invalidClass = "!border-red-600 !bg-red-50 !shadow-[0_0_0_2px_rgba(220,53,69,0.2)] focus:!border-red-600 focus:!shadow-[0_0_0_3px_rgba(220,53,69,0.3)]";

  return (
    <div
      className="min-h-screen py-10 px-5 flex flex-col items-center bg-cover bg-center bg-fixed font-sans text-gray-800 max-sm:py-6 max-sm:px-3"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <h1 className="text-[2.2rem] font-bold text-slate-800 mb-8 max-sm:text-[1.5rem] max-sm:mb-5">
        Student Profile
      </h1>

      <div
        className="backdrop-blur-[12px] border border-white/20 rounded-[20px] p-8 w-full max-w-[1100px] min-h-[60vh] shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex gap-8 animate-fade-in max-md:flex-col max-sm:p-5 max-sm:gap-5"
        style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.35), rgba(172, 186, 196, 0.15))" }}
      >
        <div className="flex-1 flex flex-col items-center">
          {/* Clickable circle for profile picture */}
          <label
            htmlFor="fileInput"
            className={`w-[250px] h-[250px] rounded-full overflow-hidden border-2 flex justify-center items-center bg-gray-200 mb-3 relative cursor-pointer hover:opacity-85 max-sm:w-[150px] max-sm:h-[150px] ${isEditing ? 'border-[#43cea2] hover:border-[#090b0d] hover:scale-[1.02]' : 'border-gray-300'}`}
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500 text-[0.95rem]">
                {isEditing ? 'Click to Upload Photo' : 'Profile Photo'}
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[2rem] opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full">
                <span>📷</span>
              </div>
            )}
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handlePicUpload}
            style={{ display: "none" }}
            disabled={!isEditing}
          />

          {/* Edit Profile Button */}
          <button
            className="mt-3 py-2.5 px-5 border-none rounded-xl text-white font-semibold cursor-pointer transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(235,169,122,0.4)]"
            style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
            onClick={toggleEditMode}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        <div className="flex-[2] flex flex-col">
          <div className="mb-5 flex flex-col">
            <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Full Name</label>
            <input
              placeholder="Enter full name"
              name="name"
              value={info.name}
              onChange={handleChange}
              className={`${!isEditing ? readonlyInputClass : gradientInputBase} ${getFieldValidationClass('name') === 'invalid' ? invalidClass : ''} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] focus:border-[#090b0d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,90,157,0.2)]`}
              readOnly={!isEditing}
            />
          </div>

          <div className="flex gap-6 max-md:flex-col">
            <div className="flex-1 mb-5 flex flex-col">
              <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={info.dob}
                onChange={handleChange}
                className={`${!isEditing ? readonlyInputClass : gradientInputBase} ${getFieldValidationClass('date') === 'invalid' ? invalidClass : ''} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] focus:border-[#090b0d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,90,157,0.2)]`}
                readOnly={!isEditing}
              />
            </div>
            <div className="flex-1 mb-5 flex flex-col">
              <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Register Number</label>
              <div className="relative">
                <input
                  placeholder="Enter register number"
                  name="regno"
                  value={info.regno}
                  onChange={handleChange}
                  className={`${readonlyInputClass} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] cursor-not-allowed !bg-[#f5f5f5] !text-gray-500`}
                  readOnly={true}
                />
                <small className="block mt-1 text-black font-medium text-[0.8rem] italic">
                  Register number cannot be modified
                </small>
              </div>
            </div>
          </div>

          <div className="flex gap-6 max-md:flex-col">
            <div className="flex-1 mb-5 flex flex-col">
              <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Phone Number</label>
              <input
                placeholder="Enter phone number (10 digits, no spaces)"
                name="phone"
                value={info.phone}
                onChange={handleChange}
                className={`${!isEditing ? readonlyInputClass : gradientInputBase} ${getFieldValidationClass('phone') === 'invalid' ? invalidClass : ''} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] focus:border-[#090b0d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,90,157,0.2)]`}
                readOnly={!isEditing}
                maxLength="10"
              />
            </div>
            <div className="flex-1 mb-5 flex flex-col">
              <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={info.email}
                  onChange={handleChange}
                  className={`${readonlyInputClass} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] cursor-not-allowed !bg-[#f5f5f5] !text-gray-500`}
                  readOnly={true}
                />
                <small className="block mt-1 text-black font-medium text-[0.8rem] italic">
                  Email can only be changed through "Transfer Account" below
                </small>
              </div>
            </div>
          </div>

          <div className="mb-5 flex flex-col">
            <label className="mb-1.5 font-semibold text-[0.95rem] text-white">Department</label>
            <input
              placeholder="Enter department"
              name="department"
              value={info.department}
              onChange={handleChange}
              className={`${!isEditing ? readonlyInputClass : gradientInputBase} ${getFieldValidationClass('department') === 'invalid' ? invalidClass : ''} w-full p-4 rounded-[10px] text-base text-left transition-all duration-[250ms] focus:border-[#090b0d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,90,157,0.2)]`}
              readOnly={!isEditing}
            />
          </div>

          {isEditing && (
            <button
              className="mt-6 self-end py-4 px-8 border-none rounded-[14px] text-white font-bold text-[17px] cursor-pointer shadow-[0_10px_30px_rgba(238,9,121,0.2)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_34px_rgba(238,9,121,0.3)] disabled:opacity-60 disabled:cursor-not-allowed max-md:w-full max-md:self-center"
              style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}

          {/* Transfer Account Button */}
          <div className="mt-6">
            <h3 className="text-white">Transfer Account</h3>
            <p className="text-black font-medium text-[0.9rem] mb-4 italic">
              Transfer your Account if you are going to be graduated soon. All your data will be transferred to the new non HEI domain email.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const destinationEmail = e.target.elements.destinationEmail.value;

                if (!destinationEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destinationEmail)) {
                  toast.warning('Please enter a valid email address.');
                  return;
                }

                if (destinationEmail === info.email) {
                  toast.warning('New email cannot be the same as current email.');
                  return;
                }

                const confirmed = window.confirm(
                  `Are you sure you want to transfer your account from ${info.email} to ${destinationEmail}? This action cannot be undone.`
                );

                if (!confirmed) {
                  return;
                }

                try {
                  setSaving(true);
                  console.log(`Transferring account from ${info.email} to ${destinationEmail}`);

                  // Call the transfer API
                  const updatedProfile = await profileAPI.transferAccount(info.email, destinationEmail);

                  // Update local state with new email
                  setInfo(prev => ({ ...prev, email: destinationEmail }));

                  // Update localStorage with new email
                  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                  userData.email = destinationEmail;
                  localStorage.setItem('userData', JSON.stringify(userData));

                  toast.success(`Account successfully transferred to ${destinationEmail}. Please log in again with your new email.`);

                  // Redirect to login page after a short delay
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 2000);

                } catch (error) {
                  console.error('Transfer failed:', error);
                  toast.error(`Transfer failed: ${error.message || 'Unknown error occurred'}`);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="mb-4">
                <label htmlFor="destinationEmail" className="block mb-2 text-white font-semibold">Destination Email:</label>
                <input
                  type="email"
                  id="destinationEmail"
                  name="destinationEmail"
                  placeholder="Enter destination email"
                  required
                  className="w-full py-3 px-3 rounded-lg border-[2.5px] border-white/40 bg-white/10 backdrop-blur-[6px] text-white placeholder:text-white/60 text-base outline-none focus:border-white/60 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-6 rounded-lg text-white font-bold text-base border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(235,169,122,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: saving ? '#ccc' : "linear-gradient(135deg, #eba97a, #f3da51)", cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]">
          <div className="bg-white p-8 rounded-xl text-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-[#ff6a00] rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      )}
    </div>
  );
}
