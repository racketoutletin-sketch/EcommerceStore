// src/pages/ProfileUpdate.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
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

      {/* Top Back Button */}
      <div className="w-full px-6 lg:px-24 py-4 flex justify-start">
        <button
          onClick={() => navigate("/profile")}
          className="text-black hover:underline font-medium"
        >
          &larr; Back to Profile
        </button>
      </div>

      <div className="w-full px-6 lg:px-24 py-6 flex flex-col gap-6 items-start">
        {/* Greeting */}
        <h2 className="text-3xl font-semibold text-gray-800">
          Hey, {profile?.user.first_name} {profile?.user.last_name} 👋
        </h2>

        {/* Form Container */}
        <div className="lg:w-2/3 bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Update Profile</h3>

          {error && <p className="text-red-500">{error}</p>}
          {loading && <Loader />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image Preview */}
            {preview && (
              <div className="flex justify-center mb-4">
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
              </div>
            )}

            <InputField label="Username" name="username" value={form.username} onChange={handleInputChange} />
            <InputField label="Email" name="email" value={form.email} onChange={handleInputChange} type="email" />
            <InputField label="First Name" name="first_name" value={form.first_name} onChange={handleInputChange} />
            <InputField label="Last Name" name="last_name" value={form.last_name} onChange={handleInputChange} />
            <InputField label="Address" name="address" value={form.address} onChange={handleInputChange} />
            <InputField label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleInputChange} />
            <InputField label="Date of Birth" name="date_of_birth" value={form.date_of_birth || ""} onChange={handleInputChange} type="date" />
            <FileInput label="Profile Picture" onChange={handleFileChange} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Helpers */
function InputField({ label, name, value, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

function FileInput({ label, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 font-medium mb-1">{label}</label>
      <input type="file" accept="image/*" onChange={onChange} className="w-full" />
    </div>
  );
}
