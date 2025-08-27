// src/pages/Register.tsx
import TopBar from "../components/HomePage/TopBar";
import Header from "../components/HomePage/Header";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { registerUser } from "../redux/features/auth/authThunks";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    } else if (registerUser.rejected.match(result)) {
      setErrors(result.payload as { [key: string]: string[] } || {});
    }
  };

  const renderErrors = (field: string) =>
    errors[field]?.map((err, i) => (
      <p key={i} className="text-red-500 text-sm mt-1">{err}</p>
    ));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      <Header />

      <div className="flex-grow flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-gray-600 font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
              {renderErrors("email")}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
              {renderErrors("username")}
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block mb-1 text-gray-600 font-medium">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {renderErrors("first_name")}
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-gray-600 font-medium">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {renderErrors("last_name")}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">Phone Number</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {renderErrors("phone_number")}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">Address</label>
              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              {renderErrors("address")}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
              {renderErrors("password")}
            </div>

            <div>
              <label className="block mb-1 text-gray-600 font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              />
              {renderErrors("password_confirm")}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-white hover:text-black hover:border transition-colors disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
