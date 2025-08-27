// src/components/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";

interface Props {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: Props) {
  const { accessToken } = useAppSelector((s) => s.auth);

  // Redirect logged-in users away from login/register pages
  if (accessToken) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
