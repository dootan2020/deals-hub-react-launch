
import { Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";

// Admin routes are temporarily disabled during cleanup
export const adminRoutes = (
  <>
    {/* Admin routes will be rebuilt later */}
    <Route path="/admin/*" element={<NotFound />} />
  </>
);
