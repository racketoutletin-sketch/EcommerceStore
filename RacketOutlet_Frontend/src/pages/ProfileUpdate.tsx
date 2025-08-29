// src/pages/ProfileUpdate.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchProfile, updateProfile } from "../redux/features/user/userThunks";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader"; 

export default function ProfileUpdate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useAppSelector((s) => s.user);

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    date_of_birth: "",
    preferences: {} as Record<string, any>,
    profile_picture: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);

  // Load existing profile data into form
  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile());
    } else if (profile.user) {
      setForm({
        username: profile.user.username || "",
        email: profile.user.email || "",
        first_name: profile.user.first_name || "",
        last_name: profile.user.last_name || "",
        address: profile.user.address || "",
        phone_number: profile.user.phone_number || "",
        date_of_birth: profile.date_of_birth || "",
        preferences: profile.preferences || {},
        profile_picture: null,
      });
      setPreview(profile.profile_picture || null);
    }
  }, [dispatch, profile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, profile_picture: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      <div className="flex-grow flex justify-center items-start px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">Update Profile</h2>

          {/* Back to Profile Button */}
          <div className="flex justify-start">
            <button
              onClick={() => navigate("/profile")}
              className="text-blue-500 hover:underline font-medium mb-4"
            >
              &larr; Back to Profile
            </button>
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {loading && <Loader />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Preview */}
            {preview && (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 mb-4"
                />
              </div>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={form.first_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={form.last_name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              name="date_of_birth"
              value={form.date_of_birth || ""}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
