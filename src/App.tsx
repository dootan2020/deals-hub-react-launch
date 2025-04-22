
import React, { Suspense } from 'react';
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ErrorBoundary } from "./components/util/ErrorBoundary";
import { LazyLoadFallback } from "./utils/lazyUtils";
import PublicRoutes from './routes/PublicRoutes';
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <React.StrictMode>
      <LanguageProvider>
        <AuthProvider>
          <CategoriesProvider>
            <TooltipProvider>
              <Toaster />
              <ErrorBoundary>
                <Suspense fallback={<LazyLoadFallback />}>
                  <Routes>
                    {PublicRoutes()}
                    {UserRoutes()}
                    {AdminRoutes()}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </TooltipProvider>
          </CategoriesProvider>
        </AuthProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
};

export default App;
