import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((s) => ({ ...s, [e.target.name]: null }));
    setFeedback(null);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (!form.password || form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setFeedback({ text: "Please fix the errors above", type: "error" });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const userData = await login(form.email, form.password);
      setFeedback({ text: "Login successful — redirecting...", type: "success" });

      // Role-based redirection
      setTimeout(() => {
        if (userData?.role === "FACULTY" || userData?.role === "faculty") {
          navigate("/faculty");
        } else {
          navigate("/");
        }
      }, 900);
    } catch (error) {
      setFeedback({
        text: error.response?.data?.message || error.message || "Login failed. Please check your credentials.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans bg-[length:800%_800%,cover] bg-center bg-fixed animate-gradient-move"
      style={{
        backgroundImage: `linear-gradient(270deg, rgba(142,197,252,0.75), rgba(224,195,252,0.75), rgba(240,244,248,0.75), rgba(207,217,223,0.75)), url("${bgImage}")`,
      }}
    >
      <form
        className="w-full max-w-[420px] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] backdrop-saturate-[120%] rounded-[14px] sm:rounded-[18px] p-4 sm:p-6 md:p-[2.4rem] shadow-[0_18px_50px_rgba(0,0,0,0.1)] flex flex-col gap-[0.7rem] sm:gap-[0.9rem] text-[#2c3e50] animate-fade-in"
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <h1 className="m-0 text-center text-[1.5rem] sm:text-[1.7rem] md:text-[1.9rem] font-bold text-[#2c3e50]">Welcome Back</h1>
        <p className="m-0 text-center text-[#4f5d75] text-[0.85rem] sm:text-[0.98rem] mb-[0.6rem]">Sign in to access your dashboard</p>

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-[0.6rem] mb-[0.35rem] font-semibold text-[#2c3e50]">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={`w-full py-[0.7rem] sm:py-[0.9rem] px-3 sm:px-4 rounded-lg sm:rounded-xl border bg-[rgba(240,244,248,0.95)] text-[#2c3e50] text-sm sm:text-base outline-none transition-[box-shadow,transform] duration-200 placeholder:text-[#7d8ca3] focus:shadow-[0_6px_18px_rgba(0,0,0,0.1)] focus:-translate-y-px focus:border-[#a1b5d8] ${errors.email ? "border-[#fc5c7d] animate-shake" : "border-[rgba(200,217,223,0.7)]"}`}
          disabled={loading}
        />
        {errors.email && <div className="text-[#b00020] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.email}</div>}

        <label className="text-[0.85rem] sm:text-[0.95rem] mt-[0.6rem] mb-[0.35rem] font-semibold text-[#2c3e50]">Password</label>
        <div className="relative flex items-center gap-[0.6rem]">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
            className={`w-full py-[0.7rem] sm:py-[0.9rem] px-3 sm:px-4 rounded-lg sm:rounded-xl border bg-[rgba(240,244,248,0.95)] text-[#2c3e50] text-sm sm:text-base outline-none transition-[box-shadow,transform] duration-200 placeholder:text-[#7d8ca3] focus:shadow-[0_6px_18px_rgba(0,0,0,0.1)] focus:-translate-y-px focus:border-[#a1b5d8] ${errors.password ? "border-[#fc5c7d] animate-shake" : "border-[rgba(200,217,223,0.7)]"}`}
            disabled={loading}
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
        {errors.password && <div className="text-[#b00020] text-[0.8rem] sm:text-[0.86rem] mt-[0.35rem]">{errors.password}</div>}

        <button
          type="submit"
          className="mt-[0.65rem] border-none py-[0.95rem] rounded-xl text-white font-bold text-base cursor-pointer shadow-[0_10px_20px_rgba(235,169,122,0.4)] transition-[transform,box-shadow] duration-150 enabled:hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #eba97a, #f3da51)" }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          className="mt-1 bg-transparent text-[#2c3e50] border-none underline font-semibold cursor-pointer text-sm sm:text-base"
          onClick={() => navigate("/register")}
          disabled={loading}
        >
          Create an account
        </button>

        {feedback && (
          <div className={`mt-[0.6rem] p-[0.5rem] sm:p-[0.6rem] rounded-[10px] text-center font-bold text-sm sm:text-base ${feedback.type === "success" ? "bg-[#d8ffe8] text-[#006b29] animate-pop-in" : "bg-[#fff2f3] text-[#b00020] animate-shake"}`}>
            {feedback.text}
          </div>
        )}
      </form>
    </div>
  );
}
