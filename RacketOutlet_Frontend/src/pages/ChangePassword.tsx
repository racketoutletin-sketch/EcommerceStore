import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("api/users/password/change/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage(res.data.detail || "Password changed successfully.");
      setOldPassword("");
      setNewPassword("");

      // Redirect to profile after 2 seconds
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
      // Auto-dismiss message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full space-y-6"
        >
          {/* Back to Profile Button */}
          <div className="flex justify-start mb-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-black hover:underline font-medium"
            >
              &larr; Back to Profile
            </button>
          </div>

          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Change Password
          </h2>

          {message && (
            <div className="p-3 rounded bg-green-100 text-green-800 text-center">
              {message}
            </div>
          )}

          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
