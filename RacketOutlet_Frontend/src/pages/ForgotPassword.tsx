// src/pages/ForgotPassword.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    try {
      const res = await api.post<{ detail?: string }>("api/users/password/reset/", { email });
      setMessage(res.data.detail || "Check your email for reset link.");
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
      setShowToast(true);
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

      <div className="w-full px-6 lg:px-24 py-8 flex flex-col gap-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-black hover:underline font-medium"
          >
            &larr; Back to Login
          </button>
        </div>

        {/* Centered Form */}
        <div className="w-full flex justify-center">
          <div className="lg:w-2/3 bg-white rounded-3xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
              Forgot Password 🔑
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition disabled:opacity-50"
              >
                {loading ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-4 text-gray-600 text-center">
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

/* 🔹 Helpers */
function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
