
import { Route, Routes } from "react-router-dom";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";
import NotFound from "@/pages/NotFound";

export const AppRouter = () => {
  return (
    <Routes>
      {userRoutes}
      {adminRoutes}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
