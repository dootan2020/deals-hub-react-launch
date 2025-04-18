
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, RefreshCw } from "lucide-react";

interface KioskTokenFieldProps {
  onTestApi?: () => void;
  isLoading?: boolean;
}

export function KioskTokenField({ onTestApi, isLoading }: KioskTokenFieldProps) {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Enter a Kiosk Token to automatically retrieve product information from the API.
          The Kiosk Token is required to save the product.
        </AlertDescription>
      </Alert>
      
      <div>
        <FormField
          control={form.control}
          name="kioskToken"
          rules={{ required: "Kiosk Token is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl className="flex-1">
                  <Input
                    placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
                    {...field}
                  />
                </FormControl>
                <Button 
                  onClick={onTestApi} 
                  disabled={isLoading}
                  variant="secondary"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? 
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> :
                    <RefreshCw className="mr-2 h-4 w-4" />
                  }
                  Test API
                </Button>
              </div>
              <FormDescription>
                This token is used to identify and synchronize the product with external services.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
