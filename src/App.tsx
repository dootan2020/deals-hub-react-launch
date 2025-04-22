import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AppRouter from "./routes/AppRouter";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const App = () => {
  return (
    <React.StrictMode>
      <LanguageProvider>
        <AuthProvider>
          <CategoriesProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
              <AssistantWidget />
            </TooltipProvider>
          </CategoriesProvider>
        </AuthProvider>
      </LanguageProvider>
    </React.StrictMode>
  );
};

export default App;
