
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchActiveApiConfig } from '@/utils/apiUtils';

export interface ApiResponse {
  success?: string;
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
  error?: string;
  kioskToken?: string;
  [key: string]: any;
}

interface ApiProductTesterProps {
  initialKioskToken?: string;
  onApiDataReceived?: (data: ApiResponse) => void;
}

export function ApiProductTester({ initialKioskToken = '', onApiDataReceived }: ApiProductTesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    if (initialKioskToken && initialKioskToken !== kioskToken) {
      setKioskToken(initialKioskToken);
    }
  }, [initialKioskToken]);

  const handleFetchProduct = async () => {
    if (!kioskToken.trim()) {
      toast.error('Please enter a kiosk token');
      return;
    }

    setIsLoading(true);
    try {
      // Get the user token from API config
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token;
      
      // Call the serverless function directly
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: { 
          endpoint: 'getStock',
          kioskToken,
          userToken
        }
      });
      
      if (error) {
        throw new Error(`Serverless function error: ${error.message}`);
      }
      
      if (data) {
        setApiResponse(data);
        
        // Dispatch event with API data for other components
        const customEvent = new CustomEvent('apiDataReceived', { 
          detail: { ...data, kioskToken }
        });
        window.dispatchEvent(customEvent);
        
        if (onApiDataReceived) {
          onApiDataReceived({ ...data, kioskToken });
        }
        
        toast.success('Product data fetched successfully!');
      } else {
        toast.error('Failed to fetch product data: Empty response');
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setApiResponse({ error: error.message });
      toast.error(`Error fetching product data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product API Tester</CardTitle>
        <CardDescription>
          Enter a Kiosk Token to fetch product information from the API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kiosk-token">Kiosk Token</Label>
          <div className="flex space-x-2">
            <Input
              id="kiosk-token"
              value={kioskToken}
              onChange={(e) => setKioskToken(e.target.value)}
              placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
            />
            <Button 
              onClick={handleFetchProduct}
              disabled={isLoading || !kioskToken}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test
            </Button>
          </div>
        </div>

        {apiResponse && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">API Response:</h4>
            <div className="rounded-md bg-muted p-3">
              {apiResponse.success === "true" ? (
                <div className="space-y-2">
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Success</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Name:</div>
                    <div className="font-medium">{apiResponse.name}</div>
                    <div>Price:</div>
                    <div className="font-medium">{apiResponse.price}</div>
                    <div>Stock:</div>
                    <div className="font-medium">{apiResponse.stock || '0'}</div>
                    {apiResponse.description && (
                      <>
                        <div>Description:</div>
                        <div className="font-medium truncate">{apiResponse.description}</div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {apiResponse.error || 'API returned an error'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
