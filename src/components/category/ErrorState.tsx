
import React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ title, message, error }) => {
  return (
    <div>
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>{title || 'Error'}</AlertTitle>
        <AlertDescription>
          {message || error || 'An error occurred'}
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
