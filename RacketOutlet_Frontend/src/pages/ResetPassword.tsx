// src/pages/ResetPassword.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    try {
      const res = await api.post("api/users/password/reset/confirm/", {
        uidb64: uid,
        token,
        new_password: newPassword,
      });
      setMessage(res.data.detail || "Password has been reset successfully.");
      setShowToast(true);

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
      setShowToast(true);
    } finally {
      setLoading(false);
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
            Reset Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-600 font-medium">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
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
