
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface EmailVerificationGateProps {
  children: React.ReactNode;
}

export const EmailVerificationGate: React.FC<EmailVerificationGateProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for loading to complete
  if (loading) return null;

  // Not authenticated, don't block here, let ProtectedRoute handle
  if (!user) return <>{children}</>;

  // If email unverified, redirect
  if (!user.email_confirmed_at) {
    return <Navigate to="/verify-required" state={{ from: location }} replace />;
  }

  // Email verified: let access pass through
  return <>{children}</>;
};
