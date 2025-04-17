
import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div>
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'Category not found'}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Link 
          to="/" 
          className="text-primary hover:underline flex items-center"
        >
          Return to homepage
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;
