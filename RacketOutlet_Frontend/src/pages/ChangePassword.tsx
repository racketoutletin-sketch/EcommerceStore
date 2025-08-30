// src/pages/ChangePassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post<{ detail?: string }>("api/users/password/change/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setMessage(res.data.detail || "Password changed successfully.");
      setOldPassword("");
      setNewPassword("");

      setTimeout(() => navigate("/profile"), 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      {/* Back Button */}
      <div className="w-full px-6 lg:px-24 py-4 flex justify-start">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="text-black hover:underline font-medium"
        >
          &larr; Back to Profile
        </button>
      </div>

      <div className="w-full px-6 lg:px-24 py-6 flex flex-col gap-6 items-start">
        {/* Greeting */}
        <h2 className="text-3xl font-semibold text-gray-800">Change Password 🔒</h2>

        {/* Form */}
        <div className="lg:w-2/3 bg-white rounded-3xl shadow-lg p-8 space-y-6">
          {message && (
            <div className="p-3 rounded bg-green-100 text-green-800 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Old Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <InputField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Helpers */
function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
