
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
import { InfoIcon } from "lucide-react";

export function KioskTokenField() {
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
      
      <FormField
        control={form.control}
        name="kioskToken"
        rules={{ required: "Kiosk Token is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kiosk Token <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
                {...field}
              />
            </FormControl>
            <FormDescription>
              This token is used to identify and synchronize the product with external services.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
