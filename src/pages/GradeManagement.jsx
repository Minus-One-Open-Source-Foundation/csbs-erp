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

  const inputClass = "ml-2 py-2 px-2.5 border-none rounded-lg min-w-[220px] max-w-[320px] text-base backdrop-blur-[6px] text-white transition-all duration-[250ms] placeholder:text-white/70 shadow-md";

  return (
    <div className="p-8 font-sans text-center max-sm:p-4">
      <header className="text-center mb-10 mt-10">
        <h1 className="text-[2.2rem] font-bold text-slate-800 mb-2 max-sm:text-[1.5rem]">Grade Management</h1>
        <p className="text-gray-600">
          Upload marksheets for each semester. These will reflect in the
          student's Academic Records page.
        </p>
      </header>

      {/* Editable student info */}
      <div className="p-4 rounded-lg mb-6 flex flex-wrap justify-center gap-4 items-center max-sm:flex-col max-sm:items-stretch">
        <label className="text-[0.95rem] text-black font-semibold">
          Student Name:{" "}
          <input
            type="text"
            value={studentInfo.name}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, name: e.target.value })
            }
            className={inputClass}
            style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.4), rgba(172, 186, 196, 0.4))" }}
          />
        </label>
        <label className="text-[0.95rem] text-black font-semibold">
          Register No:{" "}
          <input
            type="text"
            value={studentInfo.registerNo}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, registerNo: e.target.value })
            }
            className={inputClass}
            style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.4), rgba(172, 186, 196, 0.4))" }}
          />
        </label>
        <label className="text-[0.95rem] text-black font-semibold">
          Department:{" "}
          <input
            type="text"
            size={studentInfo.dept.length + 2}
            value={studentInfo.dept}
            onChange={(e) =>
              setStudentInfo({ ...studentInfo, dept: e.target.value })
            }
            ref={deptInputRef}
            className={`${inputClass} min-w-[120px] max-w-full transition-[width] duration-200`}
            style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.4), rgba(172, 186, 196, 0.4))" }}
          />
        </label>

        <button
          className="border-none rounded-md py-2.5 px-8 cursor-pointer text-white text-base font-bold transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(235,169,122,0.4)]"
          style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
        >
          Search
        </button>
      </div>

      {/* Semester cards */}
      <div className="grid grid-cols-4 gap-8 mt-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-4">
        {semesters.map((sem) => (
          <div
            key={sem.id}
            className="backdrop-blur-[10px] border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-8 text-center min-h-[180px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
            style={{ background: "linear-gradient(135deg, rgba(48, 54, 79, 0.4), rgba(172, 186, 196, 0.2))" }}
          >
            <h3 className="mb-4 text-[#3a3aee]">{sem.name}</h3>
            <label
              className="inline-block py-2 px-4 cursor-pointer rounded-md text-white font-semibold text-[0.9rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.3)]"
              style={{ background: "linear-gradient(135deg, #30364f, #acbac4)" }}
            >
              Choose File
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                onChange={(e) => handleFileChange(sem.id, e.target.files[0])}
                className="hidden"
              />
            </label>

            {/* Display file name or "Not uploaded" below the button */}
            <p className={sem.file ? "text-green-600 font-bold text-[0.9rem] mt-2.5" : "text-[#e7529a] text-[0.9rem] mt-2.5"}>
              {sem.file ? `📄 ${sem.file.name}` : "Not Uploaded"}
            </p>
          </div>
        ))}
      </div>

      <button
        className="mt-8 py-3 px-10 border-none rounded-lg text-white text-base font-bold cursor-pointer transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_6px_20px_rgba(235,169,122,0.4)]"
        style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}
