
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchActiveApiConfig, ApiResponse } from "@/utils/apiUtils";
import { ProxyType, fetchProxySettings } from "@/utils/proxyUtils";
import { isValidRecord } from "@/utils/supabaseHelpers";

interface ApiProductTesterProps {
  initialKioskToken?: string;
  onApiDataReceived: (data: ApiResponse) => void;
}

export const ApiProductTester: React.FC<ApiProductTesterProps> = ({
  initialKioskToken = "",
  onApiDataReceived,
}) => {
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [proxyType, setProxyType] = useState<ProxyType>("allorigins");

  const handleFetchData = async () => {
    if (!kioskToken) {
      toast.error("Please enter a kiosk token");
      return;
    }

    setIsLoading(true);
    try {
      const proxyConfig = await fetchProxySettings();
      setProxyType(proxyConfig.proxyType);

      const apiConfig = await fetchActiveApiConfig();
      if (!isValidRecord(apiConfig) || !apiConfig.user_token) {
        toast.error("API configuration not found or invalid");
        return;
      }

      const userToken = apiConfig.user_token || "";

      // Call the serverless function
      const { data, error } = await supabase.functions.invoke("api-proxy", {
        body: {
          endpoint: "getStock",
          kioskToken,
          userToken,
        },
      });

      if (error) {
        toast.error(`API Error: ${error.message}`);
        return;
      }

      if (data) {
        setApiResponse(data as ApiResponse);
        
        if (data.success === "true") {
          onApiDataReceived(data as ApiResponse);
          toast.success("Product data fetched successfully!");
        } else {
          toast.error(`Failed to fetch product data: ${data.error || "Unknown error"}`);
        }
      } else {
        toast.error("No data returned from API");
      }
    } catch (error: any) {
      console.error("API error:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>API Product Tester</span>
          <Badge variant="outline">{proxyType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="kioskToken" className="text-sm font-medium">
            Kiosk Token
          </label>
          <div className="flex">
            <Input
              id="kioskToken"
              value={kioskToken}
              onChange={(e) => setKioskToken(e.target.value)}
              placeholder="Enter kiosk token..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleFetchData}
              disabled={!kioskToken || isLoading}
              className="ml-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Test
                </>
              )}
            </Button>
          </div>
        </div>

        {apiResponse && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">API Response</h3>
            {apiResponse.success === "true" ? (
              <div className="border rounded-md p-3 bg-green-50/50">
                <div className="flex items-center mb-2">
                  <Check className="text-green-500 mr-2 h-4 w-4" />
                  <span className="font-medium">Product Found</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{apiResponse.name}</div>
                  <div className="font-medium">Price:</div>
                  <div>{apiResponse.price}</div>
                  <div className="font-medium">Stock:</div>
                  <div>{apiResponse.stock}</div>
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-3 bg-red-50/50">
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span>{apiResponse.error || "Unknown error"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!apiResponse && !isLoading && (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
            Enter a kiosk token and click Test to fetch product data
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export ApiResponse type for use in other components
export type { ApiResponse };

export default ApiProductTester;
