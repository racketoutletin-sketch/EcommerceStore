import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { fetchProfile } from "../redux/features/user/userThunks";

export default function useInitAuth() {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.user);
  const { accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken && !profile) {
      dispatch(fetchProfile());
    }
  }, [accessToken, profile, dispatch]);
}
