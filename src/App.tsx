
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Console debug info
console.log('App initializing - Build date:', new Date().toISOString());

const App = () => {
  return (
    <React.StrictMode>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl font-bold">Welcome to Digital Deals Hub</h1>
        </div>
      </TooltipProvider>
    </React.StrictMode>
  );
};

export default App;
