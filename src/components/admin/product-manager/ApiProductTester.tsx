
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, InfoIcon, Loader2, CheckCircle } from 'lucide-react';
import { fetchViaProxy, isHtmlResponse } from '@/utils/proxyUtils';
import { fetchActiveApiConfig } from '@/utils/apiUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ApiResponse {
  name?: string;
  description?: string;
  price?: string;
  stock?: string;
  success?: string;
  error?: string;
  kioskToken?: string;
  [key: string]: any;
}

interface ApiProductTesterProps {
  initialKioskToken?: string;
  onApiDataReceived?: (data: ApiResponse) => void;
}

export function ApiProductTester({ initialKioskToken = '', onApiDataReceived }: ApiProductTesterProps) {
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [proxyType, setProxyType] = useState<string>('serverless');
  
  useEffect(() => {
    if (initialKioskToken && initialKioskToken !== kioskToken) {
      setKioskToken(initialKioskToken);
    }
  }, [initialKioskToken]);

  const handleApiTest = async () => {
    if (!kioskToken) {
      toast.error('Please enter a kiosk token');
      return;
    }

    setIsLoading(true);
    setApiResponse(null);
    
    try {
      toast.info('Fetching product data...');
      
      let data: any;
      
      // Get the user token from API config
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token;
      
      if (proxyType === 'serverless') {
        // Use serverless function
        const { data: result, error } = await supabase.functions.invoke('api-proxy', {
          body: { 
            endpoint: 'getStock',
            kioskToken,
            userToken
          }
        });
        
        if (error) throw new Error(`Serverless function error: ${error.message}`);
        data = result;
      } else {
        // Use direct proxy
        const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${userToken}`;
        const response = await fetchViaProxy(apiUrl, { proxy_type: proxyType });
        
        // Check if we got an HTML response
        if (typeof response === 'string' && isHtmlResponse(response)) {
          throw new Error('HTML response received. Try a different proxy method.');
        }
        
        data = response;
      }
      
      if (data && data.success === "true") {
        setApiResponse(data);
        
        // Notify parent component
        if (onApiDataReceived) {
          onApiDataReceived(data);
          
          // Also dispatch a custom event in case parent components need it
          const apiDataEvent = new CustomEvent('apiDataReceived', { 
            detail: data,
            bubbles: true
          });
          window.dispatchEvent(apiDataEvent as any);
        }
        
        toast.success('Product data retrieved successfully!');
      } else {
        setApiResponse(data || { error: 'Empty response received' });
        toast.error(`Failed to retrieve data: ${data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('API test error:', error);
      setApiResponse({ error: error.message });
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Product Tester</CardTitle>
        <CardDescription>
          Test product data retrieval from TapHoaMMO API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="kioskToken" className="text-sm font-medium">
                Kiosk Token
              </label>
              <Input
                id="kioskToken"
                placeholder="Enter kiosk token (e.g., DUP32BXSLWAP4847J84B)"
                value={kioskToken}
                onChange={(e) => setKioskToken(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="proxyType" className="text-sm font-medium">
                API Method
              </label>
              <Select value={proxyType} onValueChange={setProxyType}>
                <SelectTrigger id="proxyType">
                  <SelectValue placeholder="Select API method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serverless">Serverless Function (Recommended)</SelectItem>
                  <SelectItem value="allorigins">AllOrigins Proxy</SelectItem>
                  <SelectItem value="corsproxy">CORS Proxy IO</SelectItem>
                  <SelectItem value="corsanywhere">CORS Anywhere</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the method to use for API requests. Serverless is the most reliable.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleApiTest} 
            disabled={isLoading || !kioskToken}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API & Get Product Data'
            )}
          </Button>

          {apiResponse && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">API Response</h3>
              
              {apiResponse.error ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Error: {apiResponse.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded-md p-4 bg-green-50 space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800">Success!</p>
                      <div className="space-y-1 mt-2 text-sm">
                        <p><span className="font-medium">Name:</span> {apiResponse.name}</p>
                        <p><span className="font-medium">Price:</span> {apiResponse.price}</p>
                        <p><span className="font-medium">Stock:</span> {apiResponse.stock}</p>
                        {apiResponse.description && (
                          <div>
                            <p className="font-medium">Description:</p>
                            <p className="text-xs whitespace-pre-wrap">{apiResponse.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Enter a valid Kiosk Token to retrieve product data from the API.
              This data can be used to quickly populate the product form.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
