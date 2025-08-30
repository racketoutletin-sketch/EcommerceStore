// src/pages/Profile.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchProfile } from "../redux/features/user/userThunks";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import AboutRacketOutlet from "../components/HomePage/AboutRacketOutlet";
import Footer from "../components/HomePage/Footer";
import Loader from "../components/Loader";

import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { logout } from "../redux/features/auth/authSlice";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useAppSelector((s) => s.user);
  const { accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken && !profile && !loading) {
      dispatch(fetchProfile());
    }
  }, [dispatch, accessToken, profile, loading]);

  if (!accessToken)
    return (
      <PageWrapper>
        <Message text="Please login to view your profile." color="red" />
      </PageWrapper>
    );

  if (loading) return <Loader />;

  if (error)
    return (
      <PageWrapper>
        <Message text={error} color="red" />
      </PageWrapper>
    );

  if (!profile)
    return (
      <PageWrapper>
        <Message text="No profile data available." color="gray" />
      </PageWrapper>
    );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      <div className="w-full px-8 lg:px-24 py-6 flex flex-col gap-6">
        {/* Greeting */}
        <h2 className="text-3xl font-semibold text-gray-800">
          Hey, {profile.user.first_name} {profile.user.last_name} 👋
        </h2>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Side: Info Cards + Preferences */}
          <div className="lg:w-2/3 flex flex-col items-center lg:items-start space-y-6">
            {/* Info Cards */}
            <div className="w-full space-y-4">
              <InfoCard icon={<FaEnvelope />} label="Email" value={profile.user.email} />
              <InfoCard icon={<FaUser />} label="Username" value={profile.user.username} />
              <InfoCard icon={<FaPhone />} label="Phone" value={profile.user.phone_number || "-"} />
              <InfoCard icon={<FaMapMarkerAlt />} label="Address" value={profile.user.address || "-"} />
              <InfoCard icon={<FaBirthdayCake />} label="DOB" value={profile.date_of_birth || "-"} />
            </div>

            {/* Preferences */}
            {profile.preferences && Object.keys(profile.preferences).length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm w-full">
                <h3 className="text-lg font-semibold mb-2">Preferences</h3>
                <div className="space-y-2">
                  {Object.entries(profile.preferences).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between p-2 bg-white rounded-lg shadow hover:shadow-md transition"
                    >
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-900 font-semibold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Profile Image + Actions */}
          <div className="lg:w-1/3 flex flex-col gap-4 items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-xl border-4 border-gray-200 mb-6">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-lg">
                  No Image
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/profile/update")}
              className="w-full py-3 px-6 rounded-xl bg-black text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/change-password")}
              className="w-full py-3 px-6 rounded-xl bg-black text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-6 rounded-xl bg-black text-white font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <AboutRacketOutlet />
      <Footer />
    </div>
  );
}

/* 🔹 Helpers */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />
      {children}
      <AboutRacketOutlet />
      <Footer />
    </div>
  );
}

function Message({ text, color }: { text: string; color: string }) {
  return (
    <p className={`text-${color}-500 text-center mt-10 text-lg font-medium`}>
      {text}
    </p>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition w-full">
      <span className="text-black text-xl">{icon}</span>
      <div className="flex flex-col">
        <span className="text-gray-500 text-sm">{label}</span>
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}
