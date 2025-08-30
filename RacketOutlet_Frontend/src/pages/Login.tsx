// src/pages/Login.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { loginUser } from "../redux/features/auth/authThunks";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    } else if (loginUser.rejected.match(result)) {
      setLocalError((result.payload as string) || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      <div className="w-full px-6 lg:px-24 py-8 flex flex-col gap-6 items-start">
        {/* Centered Form */}
        <div className="w-full flex justify-center">
          <div className="lg:w-2/3 bg-white rounded-3xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
              Welcome Back 👋
            </h2>

            {(error || localError) && (
              <p className="text-red-500 mb-4 text-center">{error || localError}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter your email"
              />

              <InputField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
              />

              {/* Forgot Password */}
              <p
                onClick={() => navigate("/forgot-password")}
                className="mt-1 text-right text-sm text-black cursor-pointer hover:underline"
              >
                Forgot Password?
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-white hover:text-black hover:border hover:border-black transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-black font-medium cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </p>
          </div>
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
