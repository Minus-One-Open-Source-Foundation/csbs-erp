import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSearch, FaTrash } from "react-icons/fa";
import api from "../services/api";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showReasonPopup, setShowReasonPopup] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // Load all profiles on component mount
  useEffect(() => {
    loadAllProfiles();
  }, []);

  const loadAllProfiles = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load profiles...');
      const profiles = await api.getAllProfiles();
      console.log('✅ Profiles loaded successfully:', profiles);
      setStudents(profiles);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading profiles:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      setError(`Failed to load student profiles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.registerNumber && s.registerNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowConfirmPopup(true);
  };

  const confirmDelete = () => {
    setShowConfirmPopup(false);
    setShowReasonPopup(true);
  };

    const submitReason = async () => {
    if (deleteReason.trim() === "") {
      toast.warning("Please enter a reason for deletion.");
      return;
    }
    
    try {
      await api.deleteUserByEmail(studentToDelete.email);
      setStudents(students.filter((s) => s.email !== studentToDelete.email));
      console.log(
        `Student ${studentToDelete.name} deleted. Reason: ${deleteReason}`
      );
      toast.success(`Student ${studentToDelete.name} has been successfully deleted.`);
      setDeleteReason("");
      setStudentToDelete(null);
      setShowReasonPopup(false);
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Failed to delete student. Please try again.');
    }
  };

  return (
    <div className="student-management">
      <header>
        <h1>Student Management</h1>
        <p>Manage student details and profiles</p>
      </header>

      {/* Search Bar */}
      <div className="top-bar">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or register number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadAllProfiles} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Student Grid */}
      {!loading && !error && (
        <div className="student-grid-container">
          <div className="student-grid">
            {filteredStudents.map((student) => (
              <div className="student-card" key={student.email}>
                {/* Delete Button */}
                <button
                  className="delete-button"
                  onClick={() => handleDeleteClick(student)}
                >
                  <FaTrash />
                </button>

                {/* Profile Photo */}
                <div className="profile-section">
                  <div className="profile-photo">
                    <img 
                      src={student.profileImageUrl || "/src/assets/default-profile.jpg"} 
                      alt={student.name || "Student"} 
                      onError={(e) => {
                        e.target.src = "/src/assets/default-profile.jpg";
                      }}
                    />
                  </div>
                </div>

                {/* Student Info */}
                <div className="student-info">
                  <h2>{student.name || "N/A"}</h2>
                  <p>
                    <strong>Date of Birth:</strong> {student.dateOfBirth || "N/A"}
                  </p>
                  <p>
                    <strong>Register No:</strong> {student.registerNumber || "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong> {student.department || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {student.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {student.phoneNumber || "N/A"}
                  </p>
                  <span className="status-badge active">
                    Active
                  </span>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && !loading && !error && (
              <p className="no-data">No students found</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{studentToDelete?.name}</strong>?
            </p>
            <div className="popup-actions">
              <button onClick={() => setShowConfirmPopup(false)}>Cancel</button>
              <button onClick={confirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Reason Popup */}
      {showReasonPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reason for Deletion</h3>
            <textarea
              rows="4"
              placeholder="Enter reason..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <div className="popup-actions">
              <button onClick={() => setShowReasonPopup(false)}>Cancel</button>
              <button onClick={submitReason}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .student-management {
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          width: 100%;
          max-width: 100%;
          margin: 0;
        }

        header {
          text-align: center;
          margin-bottom: 2rem;
        }

        header h1 {
          font-size: 2.3rem;
          font-weight: 700;
          color: #1e293b;
        }

        header p {
          color: #475569;
        }

        /* Search bar */
        .top-bar {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .search-wrapper {
          position: relative;
          width: 90%;
        }

        .search-icon {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1.1rem;
        }

        .search-wrapper input {
          width: 100%;
          padding: 1rem 1.6rem 1rem 3rem;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 1.05rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          outline: none;
          transition: 0.3s;
        }

        .search-wrapper input:focus {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }

        .student-grid-container {
          max-height: 75vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .student-grid-container::-webkit-scrollbar {
          width: 6px;
        }

        .student-grid-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .student-grid-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .student-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
          gap: 1.5rem;
          width: 100%;
        }

        .student-card {
          position: relative;
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.3s ease;
          width: 100%;
        }

        .student-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        /* Delete Button */
        .delete-button {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 1cm;
          height: 1cm;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          background: #f87171;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        .delete-button:hover {
          background: #dc2626;
        }

        .profile-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-left: 1cm;
          margin-top: 1cm;
        }

        .profile-photo {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #d1d5db;
          box-shadow: 0 6px 18px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .profile-photo:hover img {
          transform: scale(1.05);
        }

        .student-info {
          flex: 2;
          margin-left: 1.5cm;
        }

        .student-info h2 {
          font-size: 1.3rem;
          margin-bottom: 0.4rem;
          position: relative;
          top: -4px;
        }

        .student-info p {
          margin: 0.2rem 0;
          font-size: 0.95rem;
        }

        .status-badge {
          display: inline-block;
          margin-top: 0.4rem;
          padding: 0.3rem 0.6rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #15803d;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #b91c1c;
        }

        .no-data {
          text-align: center;
          font-size: 1rem;
          color: #6b7280;
        }

        /* Loading and Error States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-left: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .error-container p {
          color: #dc2626;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #2563eb;
        }

        /* Popup Styles */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .popup {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .popup h3 {
          margin-bottom: 1rem;
        }

        .popup p {
          margin-bottom: 1.2rem;
        }

        .popup textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 0.8rem;
          resize: none;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .popup-actions {
          display: flex;
          justify-content: space-between;
        }

        .popup-actions button {
          flex: 1;
          margin: 0 0.3rem;
          padding: 0.6rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          cursor: pointer;
          font-weight: 600;
        }

        .popup-actions button:first-child {
          background: #e5e7eb;
          color: #374151;
        }

        .popup-actions button:last-child {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 768px) {
          .student-card {
            flex-direction: column;
            text-align: center;
          }

          .profile-section {
            margin-bottom: 1rem;
            margin-left: 0;
            margin-top: 0;
          }

          .profile-photo {
            width: 140px;
            height: 140px;
          }

          .student-info {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
