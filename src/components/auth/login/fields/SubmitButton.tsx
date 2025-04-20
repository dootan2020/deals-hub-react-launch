
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
}

export const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-primary hover:bg-primary-dark"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang đăng nhập...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Đăng nhập
        </>
      )}
    </Button>
  );
};
