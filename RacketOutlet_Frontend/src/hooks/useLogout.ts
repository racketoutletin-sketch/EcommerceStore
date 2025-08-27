// src/hooks/useLogout.ts
import { useAppDispatch } from "../redux/store";
import { logout } from "../redux/features/auth/authSlice";
import { clearProfile } from "../redux/features/user/userSlice";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());        // clears auth token
    dispatch(clearProfile());  // clears user profile state
    navigate("/login");        // redirect to login page
  };

  return handleLogout;
};
