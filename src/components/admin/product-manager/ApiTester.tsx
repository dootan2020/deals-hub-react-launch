
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { fetchProxySettings, ProxyType, ProxyConfig } from '@/utils/proxyUtils';
import { 
  ApiResponse, 
  fetchActiveApiConfig, 
  normalizeProductInfo,
  productInfoToApiResponse
} from '@/utils/apiUtils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isValidRecord } from '@/utils/supabaseHelpers';

interface ApiTesterProps {
  initialKioskToken?: string;
  onApiDataReceived?: (data: ApiResponse) => void;
}

export const ApiTester = ({ initialKioskToken = '', onApiDataReceived }: ApiTesterProps) => {
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [proxyType, setProxyType] = useState<ProxyType>('allorigins');
  
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKioskToken(e.target.value);
  };
  
  const handleTest = async () => {
    if (!kioskToken.trim()) {
      toast.error('Please enter a Kiosk Token');
      return;
    }
    
    setIsLoading(true);
    setApiResponse(null);
    
    try {
      // Get proxy settings
      const proxyConfig = await fetchProxySettings();
      setProxyType(proxyConfig.proxyType);
      
      // Get API config
      const apiConfig = await fetchActiveApiConfig();
      const userToken = apiConfig.user_token || '';
      
      if (!userToken) {
        toast.error('User API Token not configured');
        return;
      }
      
      // Call the API through serverless function
      const { data, error } = await supabase.functions.invoke('api-proxy', {
        body: { 
          endpoint: 'getStock',
          kioskToken,
          userToken
        }
      });
      
      if (error) {
        toast.error(`API Error: ${error.message}`);
        return;
      }
      
      if (data) {
        const responseData: ApiResponse = data as ApiResponse;
        setApiResponse(responseData);
        
        if (onApiDataReceived && responseData) {
          onApiDataReceived(responseData);
        }
        
        if (responseData.success === 'true') {
          toast.success('Product found!');
        } else {
          toast.error(`API Error: ${responseData.error || 'Unknown error'}`);
        }
      } else {
        toast.error('No data returned from API');
      }
    } catch (error: any) {
      console.error('API test error:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleManualDataEntry = (productInfo: any) => {
    if (!isValidRecord(productInfo)) return;
    
    const normalizedInfo = normalizeProductInfo(productInfo);
    if (normalizedInfo) {
      const apiResponseData = productInfoToApiResponse(normalizedInfo);
      setApiResponse(apiResponseData);
      
      if (onApiDataReceived) {
        onApiDataReceived(apiResponseData);
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>API Product Tester</span>
          <Badge variant="outline">{proxyType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="kioskToken" className="text-sm font-medium">
            Kiosk Token
          </label>
          <div className="flex mt-1">
            <Input 
              id="kioskToken"
              value={kioskToken} 
              onChange={handleTokenChange}
              placeholder="Enter kiosk token..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleTest} 
              className="ml-2" 
              disabled={isLoading || !kioskToken.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Testing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> 
                  Test
                </>
              )}
            </Button>
          </div>
        </div>
        
        {apiResponse && (
          <>
            <Separator />
            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-medium">API Response</h3>
                {apiResponse.success === 'true' ? (
                  <Badge variant="success" className="ml-2">Success</Badge>
                ) : (
                  <Badge variant="destructive" className="ml-2">Error</Badge>
                )}
              </div>
              
              {apiResponse.success === 'true' ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Product Name:</span>
                    <span>{apiResponse.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span>{apiResponse.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Stock:</span>
                    <span>{apiResponse.stock}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 rounded-md flex items-center text-red-800">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {apiResponse.error || 'Unknown API error'}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => handleManualDataEntry({
            name: "Sample Product",
            price: "10",
            stock: "100",
            description: "This is a sample product for testing",
            success: "true"
          })}
          disabled={isLoading}
        >
          <Check className="mr-2 h-4 w-4" />
          Use Sample Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiTester;
