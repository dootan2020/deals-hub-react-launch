
import { Route, Routes } from "react-router-dom";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import NotFound from "@/pages/NotFound";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export const AppRouter = () => {
  const { refreshUserProfile, isAuthenticated, userRoles } = useAuth();

  // Add an effect to refresh user profile when navigating to admin routes
  useEffect(() => {
    if (isAuthenticated && window.location.pathname.startsWith('/admin')) {
      console.log("Admin route detected, refreshing user profile");
      refreshUserProfile().catch(err => {
        console.error("Failed to refresh profile for admin route:", err);
      });
    }
  }, [isAuthenticated, refreshUserProfile]);

  // Debug information about authentication state
  useEffect(() => {
    console.log("AppRouter - Authentication state:", {
      isAuthenticated,
      userRoles,
      currentPath: window.location.pathname
    });
  }, [isAuthenticated, userRoles]);

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
