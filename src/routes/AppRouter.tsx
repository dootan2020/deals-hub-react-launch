
import { Route, Routes } from "react-router-dom";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import NotFound from "@/pages/NotFound";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";

export const AppRouter = () => {
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
