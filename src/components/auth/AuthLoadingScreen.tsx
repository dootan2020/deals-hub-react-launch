
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, XCircle } from "lucide-react";

interface AuthLoadingScreenProps {
  onRetry?: () => void;
  onCancel?: () => void;
}

const AuthLoadingScreen = ({ onRetry, onCancel }: AuthLoadingScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-2">Verifying your session</h2>
          <p className="text-muted-foreground mb-6">
            Please wait while we authenticate your account...
          </p>
        </div>

        <div className="flex justify-center space-x-4 pt-2">
          {onRetry && (
            <Button 
              variant="outline"
              onClick={onRetry}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          
          {onCancel && (
            <Button 
              variant="ghost"
              onClick={onCancel}
              className="flex items-center text-muted-foreground"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
