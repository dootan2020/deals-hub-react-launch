import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchProxySettings, fetchViaProxy } from '@/utils/proxyUtils';
import { fetchActiveApiConfig } from '@/utils/apiUtils';

interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
}

export function ApiProductTester({ onApiDataReceived }: { onApiDataReceived: (data: any) => void }) {
  const [kioskToken, setKioskToken] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiTest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const proxyConfig = await fetchProxySettings();
      const apiConfig = await fetchActiveApiConfig();
      
      if (!kioskToken || !apiConfig.user_token) {
        toast.error('Please enter both Kiosk Token and User Token');
        return;
      }

      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${apiConfig.user_token}`;
      const data = await fetchViaProxy(apiUrl, proxyConfig);

      if (data?.success === "true") {
        setApiResponse(data);
        onApiDataReceived(data); // Pass the API response to parent
        toast.success('Product data fetched successfully');
      } else {
        setError(data?.error || 'Failed to fetch product data');
        toast.error(data?.error || 'Failed to fetch product data');
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">API Product Lookup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label htmlFor="kioskToken" className="block text-sm font-medium mb-2">
              Kiosk Token
            </label>
            <Input 
              id="kioskToken"
              value={kioskToken}
              onChange={(e) => setKioskToken(e.target.value)}
              placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
          <Button 
            onClick={handleApiTest} 
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
            Get Product Info
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {apiResponse && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground mb-1">Product name:</div>
                  <div className="font-medium text-green-700">{apiResponse.name}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground mb-1">Price:</div>
                  <div className="font-medium text-blue-700">
                    {Number(apiResponse.price).toLocaleString()} VND
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground mb-1">Stock:</div>
                  <div className="font-medium text-purple-700">{apiResponse.stock}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
