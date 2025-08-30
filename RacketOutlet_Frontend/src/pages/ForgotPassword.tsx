// src/pages/ForgotPassword.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    try {
      const res = await api.post("api/users/password/reset/", { email });
      setMessage(res.data.detail || "Check your email for reset link.");
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
      setShowToast(true);
      // Auto-dismiss toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      {/* Toast Notification */}
      {showToast && message && (
        <div className="fixed top-0 left-0 w-full bg-green-500 text-white py-4 text-center text-lg font-medium shadow-lg z-50 animate-slideDown">
          {message}
        </div>
      )}

      <div className="flex-grow flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-white rounded-4xl p-8">
          <h2 className="text-5xl font-bold text-center mb-6 text-gray-800">
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-600 font-medium">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border transition-colors disabled:opacity-50"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>

      {/* Tailwind animation */}
      <style>
        {`
          @keyframes slideDown {
            0% { transform: translateY(-100%); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
