
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw } from 'lucide-react';
import { ProxyType } from '@/utils/proxyUtils';
import { ApiResponse } from '@/utils/apiUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiTesterProps {
  initialKioskToken?: string;
  onApiDataReceived?: (data: ApiResponse) => void;
}

export function ApiTester({ initialKioskToken = '', onApiDataReceived }: ApiTesterProps) {
  const [kioskToken, setKioskToken] = useState(initialKioskToken);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  
  const handleProxyChange = (value: string) => {
    setSelectedProxy(value as ProxyType);
  };
  
  const handleTestApi = async () => {
    if (!kioskToken) {
      alert('Please enter a kiosk token');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API test endpoint
      const response = await fetch(`/api/test-api?kioskToken=${encodeURIComponent(kioskToken)}&proxyType=${selectedProxy}`);
      const data = await response.json();
      
      if (onApiDataReceived && data) {
        onApiDataReceived(data);
      }
    } catch (error) {
      console.error('Error testing API:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">API Data Retrieval</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Kiosk Token
          </label>
          <Input
            value={kioskToken}
            onChange={(e) => setKioskToken(e.target.value)}
            placeholder="Enter kiosk token"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Proxy Type
          </label>
          <Select value={selectedProxy} onValueChange={handleProxyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select proxy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allorigins">AllOrigins</SelectItem>
              <SelectItem value="corsproxy">CORS Proxy</SelectItem>
              <SelectItem value="corsanywhere">CORS Anywhere</SelectItem>
              <SelectItem value="direct">Direct Request</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleTestApi} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Retrieving Data...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Get Product Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export { ApiResponse };
