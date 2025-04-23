
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiResponse } from "@/utils/apiUtils";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { fetchActiveApiConfig, fetchViaProxy } from '@/utils/apiUtils';
import { fetchProxySettings } from '@/utils/proxyUtils';
import { toast } from "sonner";
import { isValidRecord, safeString } from '@/utils/supabaseHelpers';

interface ProductFormHeaderProps {
  onApiDataReceived?: (data: ApiResponse) => void;
  initialKioskToken?: string;
}

export function ProductFormHeader({ onApiDataReceived, initialKioskToken = '' }: ProductFormHeaderProps) {
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiTest = async () => {
    if (!kioskToken) {
      toast.error('Please enter a kiosk token');
      return;
    }

    try {
      setIsLoading(true);
      toast.info('Fetching product data...');

      const proxyConfig = await fetchProxySettings();
      
      const apiConfig = await fetchActiveApiConfig();
      if (!isValidRecord(apiConfig)) {
        toast.error('Failed to fetch API configuration');
        return;
      }
      
      const userToken = safeString(apiConfig.user_token || '');
      
      if (!userToken) {
        toast.error('User token not configured');
        return;
      }
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${userToken}`;
      try {
        const data = await fetchViaProxy(apiUrl, proxyConfig);
        
        if (data?.success === "true") {
          const apiResponse: ApiResponse = {
            success: "true",
            name: data.name,
            price: data.price,
            stock: data.stock,
            description: data.description,
            kioskToken: kioskToken
          };
          
          if (onApiDataReceived) {
            onApiDataReceived(apiResponse);
          }
          
          toast.success('Product data fetched successfully!');
        } else {
          toast.error(`Failed to fetch product data: ${data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('API test error:', error);
        toast.error(`Error fetching product data: ${(error as Error).message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="kioskToken" className="block text-sm font-medium mb-1">
              Kiosk Token
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="kioskToken"
                placeholder="Enter product kiosk token"
                value={kioskToken}
                onChange={(e) => setKioskToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={handleApiTest}
                disabled={isLoading || !kioskToken}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Retrieve Data
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
