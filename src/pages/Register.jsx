import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: null }));
    setFeedback(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.length < 3) newErrors.name = "Enter a valid name (min 3 chars)";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.password || form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords must match";
    if (otpSent && (!form.phone || !/^\d{10}$/.test(form.phone))) newErrors.phone = "Enter a valid 10-digit phone";
    if (otpSent && form.otp !== generatedOtp) newErrors.otp = "Invalid OTP";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = () => {
    if (!form.phone || !/^\d{10}$/.test(form.phone)) {
      setErrors((s) => ({ ...s, phone: "Enter valid 10-digit phone" }));
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setFeedback({ text: `OTP sent (mock): ${otp}`, type: "info" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setFeedback({ text: "Please fix form errors", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const result = await register(form.name, form.email, form.password);
      console.log('Register result:', result); // Debug log
      setFeedback({ text: "Registration successful! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error('Registration error details:', error);
      setFeedback({
        text: error.message || "Registration failed. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass = "w-full py-[0.9rem] px-4 rounded-xl border bg-[rgba(240,244,248,0.95)] text-[#2c3e50] text-base outline-none transition-[box-shadow,transform] duration-200 placeholder:text-[rgba(44,62,80,0.5)] focus:shadow-[0_6px_18px_rgba(0,0,0,0.1)] focus:-translate-y-px focus:border-[rgba(44,62,80,0.7)]";
  const inputNormalClass = `${inputBaseClass} border-[rgba(200,217,223,0.7)]`;
  const inputErrorClass = `${inputBaseClass} !border-[#fc5c7d]`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8 font-sans bg-[length:cover,800%_800%] bg-blend-overlay animate-gradient-move"
      style={{
        background: `url("${bgImage}") center/cover no-repeat, linear-gradient(270deg, #8ec5fc, #e0c3fc, #f0f4f8, #cfd9df)`,
        backgroundSize: "cover, 800% 800%",
        animation: "gradientMove 25s ease infinite",
      }}
    >
      <form
        className="w-full max-w-[520px] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] backdrop-saturate-[120%] rounded-[18px] p-[2.4rem] shadow-[0_18px_50px_rgba(0,0,0,0.1)] flex flex-col gap-[0.9rem] text-[#2c3e50] max-[720px]:p-[1.6rem] max-[720px]:text-[1.6rem]"
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className="m-0 text-center text-[1.9rem] font-bold text-[#2c3e50]">Create Student Account</h1>
        <p className="m-0 text-center text-[#4f5d75] text-[0.98rem] mb-1">Register to manage your student activity portfolio</p>

        <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Full Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
          className={errors.name ? inputErrorClass : inputNormalClass}
          disabled={loading}
        />
        {errors.name && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.name}</div>}

        <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={errors.email ? inputErrorClass : inputNormalClass}
          disabled={loading}
        />
        {errors.email && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.email}</div>}

        <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Password</label>
        <div className="relative flex items-center gap-[0.6rem]">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className={errors.password ? inputErrorClass : inputNormalClass}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#2c3e50] font-semibold cursor-pointer py-[0.15rem] px-[0.6rem] rounded-lg"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.password}</div>}

        <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Confirm Password</label>
        <div className="relative flex items-center gap-[0.6rem]">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            className={errors.confirmPassword ? inputErrorClass : inputNormalClass}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#2c3e50] font-semibold cursor-pointer py-[0.15rem] px-[0.6rem] rounded-lg"
            onClick={() => setShowConfirmPassword((s) => !s)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.confirmPassword}</div>}

        <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">Phone (optional)</label>
        <input
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="10-digit phone number"
          className={errors.phone ? inputErrorClass : inputNormalClass}
          disabled={loading}
        />
        {errors.phone && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.phone}</div>}

        <button
          type="button"
          className="mt-[0.6rem] bg-transparent border border-dashed border-[rgba(44,62,80,0.3)] text-[#2c3e50] py-3 rounded-[10px] cursor-pointer hover:-translate-y-0.5"
          onClick={handleSendOtp}
          disabled={loading}
        >
          {otpSent ? "Resend OTP" : "Send OTP"}
        </button>

        {otpSent && (
          <>
            <label className="text-[0.95rem] mt-2 text-[#2c3e50] font-semibold">OTP</label>
            <input
              name="otp"
              type="text"
              value={form.otp}
              onChange={handleChange}
              placeholder="Enter OTP (mock)"
              className={errors.otp ? inputErrorClass : inputNormalClass}
              disabled={loading}
            />
            {errors.otp && <div className="text-[#e74c3c] text-[0.86rem] mt-[0.35rem]">{errors.otp}</div>}
          </>
        )}

        <button
          type="submit"
          className="mt-3 border-none py-[0.95rem] rounded-xl text-white font-bold text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(90deg, #6a82fb, #fc5c7d)" }}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <button
          type="button"
          className="mt-2 bg-transparent border-none text-[#2c3e50] font-semibold underline cursor-pointer"
          onClick={() => navigate("/login")}
          disabled={loading}
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
      </form>
    </div>
  );
}
