import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import bgImage from "../assets/bg.jpg";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    setErrors((s) => ({ ...s, otp: null }));
    setFeedback(null);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpDigits(newOtp);
    setErrors((s) => ({ ...s, otp: null }));
    const nextIndex = Math.min(pastedData.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: null }));
    setFeedback(null);
    // Reset OTP state if email changes after OTP was sent
    if (e.target.name === "email" && otpSent) {
      setOtpSent(false);
      setOtpDigits(["", "", "", "", "", ""]);
    }
  };



  const handleSendOtp = async () => {
    if (!form.email || !form.email.endsWith("@saranathan.ac.in")) {
      setErrors((s) => ({ ...s, email: "Only @saranathan.ac.in domain is allowed" }));
      return;
    }
    if (!form.name.trim() || form.name.length < 3) {
      setErrors((s) => ({ ...s, name: "Enter a valid name first" }));
      return;
    }
    if (!form.password || form.password.length < 8) {
      setErrors((s) => ({ ...s, password: "Enter a valid password first" }));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrors((s) => ({ ...s, confirmPassword: "Passwords must match" }));
      return;
    }

    setSendingOtp(true);
    setFeedback(null);

    try {
      // Call register endpoint - this should send OTP to email
      await register(form.name, form.email, form.password);
      setOtpSent(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setFeedback({ text: `OTP sent to ${form.email}. Please check your inbox.`, type: "info" });
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      setFeedback({
        text: error.message || "Failed to send OTP. Please try again.",
        type: "error"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);
    setFeedback(null);
    setOtpDigits(["", "", "", "", "", ""]);
    setErrors((s) => ({ ...s, otp: null }));

    try {
      const response = await authAPI.resendOtp(form.email);
      if (response.success) {
        setFeedback({ text: `OTP resent to ${form.email}. Please check your inbox.`, type: "info" });
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setFeedback({ text: response.message || "Failed to resend OTP", type: "error" });
      }
    } catch (error) {
      setFeedback({
        text: error.message || "Failed to resend OTP. Please try again.",
        type: "error"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      setErrors((s) => ({ ...s, otp: "Please enter complete 6-digit OTP" }));
      return;
    }

    setVerifyingOtp(true);
    setFeedback(null);

    try {
      const response = await authAPI.verifyOtp(form.email, enteredOtp);
      if (response.success) {
        setFeedback({ text: "Registration successful! Redirecting to login...", type: "success" });
        setTimeout(() => {
          setVerifyingOtp(false);
          navigate("/login");
        }, 1500);
      } else {
        setErrors((s) => ({ ...s, otp: response.message || "Invalid OTP" }));
        setVerifyingOtp(false);
      }
    } catch (error) {
      setErrors((s) => ({ ...s, otp: error.message || "OTP verification failed" }));
      setVerifyingOtp(false);
    }
  };



  const inputBaseClass = "w-full py-[0.7rem] sm:py-[0.9rem] px-3 sm:px-4 rounded-lg sm:rounded-xl border bg-[rgba(240,244,248,0.95)] text-[#2c3e50] text-sm sm:text-base outline-none transition-[box-shadow,transform] duration-200 placeholder:text-[rgba(44,62,80,0.5)] focus:shadow-[0_6px_18px_rgba(0,0,0,0.1)] focus:-translate-y-px focus:border-[rgba(44,62,80,0.7)]";
  const inputNormalClass = `${inputBaseClass} border-[rgba(200,217,223,0.7)]`;
  const inputErrorClass = `${inputBaseClass} !border-[#fc5c7d]`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans bg-[length:cover,800%_800%] bg-blend-overlay animate-gradient-move"
      style={{
        background: `url("${bgImage}") center/cover no-repeat, linear-gradient(270deg, #8ec5fc, #e0c3fc, #f0f4f8, #cfd9df)`,
        backgroundSize: "cover, 800% 800%",
        animation: "gradientMove 25s ease infinite",
      }}
    >
      <div
        className="w-full max-w-[520px] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] backdrop-saturate-[120%] rounded-[14px] sm:rounded-[18px] p-4 sm:p-6 md:p-[2.4rem] shadow-[0_18px_50px_rgba(0,0,0,0.1)] flex flex-col gap-[0.7rem] sm:gap-[0.9rem] text-[#2c3e50]"
      >
        <h1 className="m-0 text-center text-[1.5rem] sm:text-[1.7rem] md:text-[1.9rem] font-bold text-[#2c3e50]">Create Student Account</h1>
        <p className="m-0 text-center text-[#4f5d75] text-[0.85rem] sm:text-[0.98rem] mb-1">Register to manage your student activity portfolio</p>

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Full Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className={errors.name ? inputErrorClass : inputNormalClass}
          disabled={sendingOtp || verifyingOtp || otpSent}
        />
        {errors.name && <div className="text-[#e74c3c] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.name}</div>}

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="yourname@saranathan.ac.in"
          className={errors.email ? inputErrorClass : inputNormalClass}
          disabled={sendingOtp || verifyingOtp || otpSent}
        />
        {errors.email && <div className="text-[#e74c3c] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.email}</div>}

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Password</label>
        <div className="relative flex items-center gap-[0.6rem]">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className={errors.password ? inputErrorClass : inputNormalClass}
            disabled={sendingOtp || verifyingOtp || otpSent}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#2c3e50] text-xs sm:text-sm font-semibold cursor-pointer py-[0.15rem] px-[0.4rem] sm:px-[0.6rem] rounded-lg"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <div className="text-[#e74c3c] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.password}</div>}

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Confirm Password</label>
        <div className="relative flex items-center gap-[0.6rem]">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            className={errors.confirmPassword ? inputErrorClass : inputNormalClass}
            disabled={sendingOtp || verifyingOtp || otpSent}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#2c3e50] text-xs sm:text-sm font-semibold cursor-pointer py-[0.15rem] px-[0.4rem] sm:px-[0.6rem] rounded-lg"
            onClick={() => setShowConfirmPassword((s) => !s)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword && <div className="text-[#e74c3c] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.confirmPassword}</div>}

        {!otpSent && (
          <button
            type="button"
            className="mt-[0.6rem] bg-transparent border border-dashed border-[rgba(44,62,80,0.3)] text-[#2c3e50] py-2.5 sm:py-3 rounded-[10px] cursor-pointer hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendOtp}
            disabled={sendingOtp || verifyingOtp}
          >
            {sendingOtp ? "Sending OTP..." : "Send OTP to Email"}
          </button>
        )}

        {otpSent && (
          <>
            <label className="text-[0.85rem] sm:text-[0.95rem] mt-2 text-[#2c3e50] font-semibold text-center">Enter OTP sent to {form.email}</label>
            <div className="flex justify-center gap-2 sm:gap-3 mt-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border-2 bg-[rgba(240,244,248,0.95)] text-[#2c3e50] outline-none transition-all duration-200 focus:border-[#6a82fb] focus:shadow-[0_0_0_3px_rgba(106,130,251,0.2)] ${errors.otp ? "border-[#fc5c7d]" : digit ? "border-[#6a82fb]" : "border-[rgba(200,217,223,0.7)]"
                    }`}
                  disabled={verifyingOtp}
                />
              ))}
            </div>
            {errors.otp && <div className="text-[#e74c3c] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem] text-center">{errors.otp}</div>}

            <button
              type="button"
              className="mt-2 border-none py-2.5 sm:py-3 rounded-xl text-white font-bold text-sm sm:text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(90deg, #6a82fb, #fc5c7d)" }}
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otpDigits.join("").length !== 6}
            >
              {verifyingOtp ? "Verifying..." : "Verify and Register"}
            </button>

            <button
              type="button"
              className="text-sm text-[#6a82fb] underline cursor-pointer bg-transparent border-none"
              onClick={handleResendOtp}
              disabled={sendingOtp || verifyingOtp}
            >
              {sendingOtp ? "Sending..." : "Resend OTP"}
            </button>
          </>
        )}

        <button
          type="button"
          className="mt-3 bg-transparent border-none text-[#2c3e50] font-semibold underline cursor-pointer text-sm sm:text-base"
          onClick={() => navigate("/login")}
          disabled={sendingOtp || verifyingOtp}
        >
          Back to Login
        </button>

        {feedback && (
          <div
            className={`mt-[0.6rem] p-[0.6rem] rounded-[10px] text-center font-bold ${feedback.type === "success"
              ? "bg-[#d8ffe8] text-[#006b29]"
              : feedback.type === "info"
                ? "bg-[#dbe7ff] text-[#0446c7]"
                : "bg-[#fff2f3] text-[#b00020]"
              }`}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
