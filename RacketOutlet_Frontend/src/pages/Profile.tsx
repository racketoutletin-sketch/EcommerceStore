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
  FaUserTag,
} from "react-icons/fa";

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

  if (loading)
    return (
<Loader />
    );

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar />
      <Header />

      <div className="flex-grow flex justify-center items-start px-4 py-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl p-10 transition-transform hover:-translate-y-1 hover:shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT SIDE - Profile Info */}
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-800">
              {profile.user.first_name} {profile.user.last_name}
            </h2>

            <div className="space-y-4">
              <Info icon={<FaEnvelope />} text={profile.user.email} />
              <Info icon={<FaUser />} text={profile.user.username} />
              <Info icon={<FaMapMarkerAlt />} text={profile.user.address || "-"} />
              <Info icon={<FaPhone />} text={profile.user.phone_number || "-"} />
              <Info icon={<FaUserTag />} text={profile.user.role || "-"} />
              <Info icon={<FaBirthdayCake />} text={profile.date_of_birth || "-"} />
            </div>
          </div>

          {/* RIGHT SIDE - Profile Image + Preferences + Button */}
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Image */}
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-black shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border-4 border-gray-300 shadow-lg text-xl font-semibold">
                No Image
              </div>
            )}

            {/* Preferences */}
            {profile.preferences &&
              Object.keys(profile.preferences).length > 0 && (
                <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-2">Preferences</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {Object.entries(profile.preferences).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Edit Button */}
            <button
              onClick={() => navigate("/profile/update")}
              className="bg-black text-white py-2 px-8 rounded-xl font-semibold hover:bg-white hover:text-black border border-black transition-colors shadow hover:shadow-lg"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* About + Footer at bottom */}
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

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-700">
      <span className="text-black">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
