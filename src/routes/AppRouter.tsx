
import { Routes } from "react-router-dom";
import { userRoutes } from "./userRoutes";
import { adminRoutes } from "./adminRoutes";

export const AppRouter = () => {
  return (
    <Routes>
      {userRoutes}
      {adminRoutes}
    </Routes>
  );
};

export default AppRouter;

