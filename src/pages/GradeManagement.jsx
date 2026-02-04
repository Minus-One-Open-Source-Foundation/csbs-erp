import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

export default function GradeManagement() {
  const [studentInfo, setStudentInfo] = useState({
    name: "John Doe",
    registerNo: "813823244001",
    dept: "Computer Science And Business Systems",
  });

  const [semesters, setSemesters] = useState([
    { id: 1, name: "Semester 1", file: null },
    { id: 2, name: "Semester 2", file: null },
    { id: 3, name: "Semester 3", file: null },
    { id: 4, name: "Semester 4", file: null },
    { id: 5, name: "Semester 5", file: null },
    { id: 6, name: "Semester 6", file: null },
    { id: 7, name: "Semester 7", file: null },
    { id: 8, name: "Semester 8", file: null },
  ]);

  const deptInputRef = useRef(null);

  // Auto-resize the department input width based on text
  useEffect(() => {
    if (deptInputRef.current) {
      deptInputRef.current.style.width =
        studentInfo.dept.length > 0
          ? `${studentInfo.dept.length + 2}ch`
          : "120px";
    }
  }, [studentInfo.dept]);

  const handleFileChange = (id, file) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === id ? { ...sem, file } : sem))
    );
  };

  const handleSave = () => {
    console.log("Student Info:", studentInfo);
    console.log("Uploaded Records:", semesters);
    toast.success(
      "Grades/marksheets saved successfully and reflected on student page!"
    );
  };

  return (
    <div className="grade-management">
      <h1>Grade Management</h1>
      <p className="subtitle">
        Upload marksheets for each semester. These will reflect in the
        student’s Academic Records page.
      </p>

      {/* Editable student info */}
      <div className="student-info">
        <label>
          Student Name:{" "}
          <input
            type="text"
            value={studentInfo.name}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, name: e.target.value })
            }
          />
        </label>
        <label>
          Register No:{" "}
          <input
            type="text"
            value={studentInfo.registerNo}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, registerNo: e.target.value })
            }
          />
        </label>
        <label>
          Department:{" "}
          <input
            type="text"
            className="dept-input"
            size={studentInfo.dept.length + 2}
            value={studentInfo.dept}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, dept: e.target.value })
            }
            ref={deptInputRef}
          />
        </label>

        <button className="search-btn">Search</button>
      </div>

      {/* Semester cards */}
      <div className="semester-grid">
        {semesters.map((sem) => (
          <div key={sem.id} className="semester-card">
            <h3>{sem.name}</h3>
            <label className="custom-file-upload">
              Choose File
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={(e) => handleFileChange(sem.id, e.target.files[0])}
              />
            </label>

            {/* Display file name or "Not uploaded" below the button */}
            <p className={sem.file ? "uploaded" : "not-uploaded"}>
              {sem.file ? `📄 ${sem.file.name}` : "Not Uploaded"}
            </p>
          </div>
        ))}
      </div>

      <button className="save-btn" onClick={handleSave}>
        Save Changes
      </button>

      <style>{`
        /* Hide default file input */
        .semester-card input[type="file"] {
          display: none;
        }

        /* Custom file upload button */
        .custom-file-upload {
          display: inline-block;
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-radius: 6px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .custom-file-upload:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* File name display below button */
        .uploaded {
          color: green;
          font-weight: bold;
          font-size: 0.9rem;
          margin-top: 0.6rem;
        }

        .not-uploaded {
          color: #e7529aff;
          font-size: 0.9rem;
          margin-top: 0.6rem;
        }

        .grade-management {
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          text-align: center;
        }

        .subtitle {
          margin-bottom: 1rem;
          color: #505255ff;
        }

        .student-info {
         
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
          align-items: center;
        }

        .student-info label {
          font-size: 0.95rem;
          color: #000000ff;
          font-weight: 580;
        }

        .student-info input {
          margin-left: 0.5rem;
          padding: 0.5rem 0.6rem;
          border: 1px solid rgba(118, 75, 162, 0.35);
          border-radius: 8px;
          min-width: 220px;
          max-width: 320px;
          font-size: 1rem;
          background: rgba(118, 75, 162, 0.45);
          backdrop-filter: blur(6px);
          color: #fff;
          transition: all 0.25s ease;
        }

        .student-info input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .student-info input:focus {
          border-color: #764ba2;
          background: rgba(118, 75, 162, 0.45);
          color: #fff;
        }

        .dept-input {
          min-width: 120px;
          max-width: 100%;
          transition: width 0.2s ease;
        }

        .search-btn {
          background: linear-gradient(90deg, #ff6a00, #ee0979);
          border: none;
          border-radius: 6px;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          transition: background 0.3s, transform 0.15s ease, box-shadow 0.2s ease;
        }

        .search-btn:hover {
          background: linear-gradient(90deg, #ff6a00, #ee0979);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .semester-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem; /* Increased gap for more vertical & horizontal spacing */
  margin-top: 1rem;
}

.semester-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px #764ba2;
  padding: 2rem; /* Increased padding to make card taller */
  text-align: center;
  min-height: 180px; /* Ensure consistent taller height */
  transition: all 0.3s ease;
}


        .semester-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 20px #667eea;
        }

        .semester-card h3 {
          margin-bottom: 1rem;
          color: #3a3aee;
        }

        .semester-card input {
          margin: 0.5rem 0;
        }

        .save-btn {
          margin-top: 2rem;
          padding: 0.8rem 2rem;
          border: none;
          border-radius: 8px;
          background: linear-gradient(90deg, #ff6a00, #ee0979);
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s, transform 0.15s ease, box-shadow 0.2s ease;
        }

        .save-btn:hover {
          background: linear-gradient(90deg, #ff6a00, #ee0979);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(238, 9, 121, 0.3);
        }
      `}</style>
    </div>
  );
}
