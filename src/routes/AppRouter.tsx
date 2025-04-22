
import { Route, Routes } from "react-router-dom";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import NotFound from "@/pages/NotFound";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useCallback } from "react";

export const AppRouter = () => {
  const { refreshUserProfile, isAuthenticated, userRoles, user, session } = useAuth();

  // Enhanced function to refresh user profile with proper error handling
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      console.log("Refreshing user profile and permissions...");
      await refreshUserProfile();
      console.log("User profile refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, [isAuthenticated, refreshUserProfile, user?.id]);

  // Refresh user profile for admin routes and also on initial load
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check if on admin route
      if (window.location.pathname.startsWith('/admin')) {
        console.log("Admin route detected, refreshing user profile and permissions");
        refreshUserData();
      }
      
      // Also refresh when session token changes (login, refresh, etc)
      if (session?.access_token) {
        console.log("Session token available, scheduling refresh");
        const timeoutId = setTimeout(() => {
          refreshUserData();
        }, 500); // Short delay to ensure auth is settled
        return () => clearTimeout(timeoutId);
      }
    }
  }, [isAuthenticated, refreshUserData, session?.access_token, user?.id]);

  // Debug information about authentication state
  useEffect(() => {
    console.log("AppRouter - Authentication state:", {
      isAuthenticated,
      userRoles,
      userId: user?.id,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'No session',
      currentPath: window.location.pathname
    });
  }, [isAuthenticated, userRoles, user?.id, session?.expires_at]);

  return (
    <Routes>
      {userRoutes}
      {adminRoutes}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
