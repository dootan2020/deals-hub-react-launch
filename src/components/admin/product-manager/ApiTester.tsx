
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ProxyType, ProxyConfig, fetchProxySettings, fetchViaProxy, fetchViaProxyWithFallback } from '@/utils/proxyUtils';
import { isHtmlResponse, extractFromHtml, normalizeProductInfo } from '@/utils/apiUtils';

interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
}

interface ApiTesterProps {
  onApiDataReceived: (data: ApiResponse) => void;
  initialKioskToken?: string;
  initialUserToken?: string;
}

export function ApiTester({ onApiDataReceived, initialKioskToken = '', initialUserToken = '' }: ApiTesterProps) {
  const [kioskToken, setKioskToken] = useState<string>(initialKioskToken);
  const [userToken, setUserToken] = useState<string>(initialUserToken);
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  const handleApiTest = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);

    addLog(`Starting API test using ${selectedProxy} proxy...`);

    try {
      if (!kioskToken) {
        throw new Error('Kiosk Token is required');
      }

      // Create proper proxy configuration object
      const proxyConfig: ProxyConfig = { type: selectedProxy };
      
      // Format the API URL properly
      const url = `https://api.taphoammo.net/kioskapi.php?kiosk=${kioskToken}&usertoken=${userToken}`;
      
      addLog(`Requesting: ${url} through ${selectedProxy} proxy`);
      
      try {
        let responseData;
        
        try {
          // First try with normal proxy
          responseData = await fetchViaProxy(url, proxyConfig);
          addLog(`Received response from ${selectedProxy} proxy`);
        } catch (proxyError) {
          // If that fails, try with the fallback method
          addLog(`${selectedProxy} proxy failed: ${(proxyError as Error).message}`);
          addLog('Attempting fallback method...');
          
          responseData = await fetchViaProxyWithFallback(url, proxyConfig);
          addLog('Fallback method succeeded');
        }
        
        // Save the raw response for debugging
        setRawResponse(typeof responseData === 'string' ? responseData : JSON.stringify(responseData, null, 2));
        addLog(`Raw response received: ${JSON.stringify(responseData).substring(0, 50)}...`);
        
        // Handle HTML responses
        if (typeof responseData === 'string' && isHtmlResponse(responseData)) {
          addLog('Response is HTML, attempting to extract product information');
          const extractedData = extractFromHtml(responseData);
          setApiResponse(extractedData);
          onApiDataReceived(extractedData);
          setIsMockData(true);
        } else {
          // Handle JSON responses
          const normalizedData = normalizeProductInfo(responseData);
          setApiResponse(normalizedData);
          onApiDataReceived(normalizedData);
          addLog('Successfully processed API response');
        }
        
        setLastUpdated(new Date().toLocaleString());
      } catch (requestError) {
        throw new Error(`API request failed: ${(requestError as Error).message}`);
      }
    } catch (err: any) {
      setError(`API request failed: ${err.message}`);
      addLog(`Error: ${err.message}`);
      
      // Show mock data when an error occurs
      const mockData = {
        success: 'mock',
        name: 'Sample Product (Mock)',
        price: '150000',
        stock: '10',
        description: 'This is mock data because the API request failed'
      };
      
      setIsMockData(true);
      setApiResponse(mockData);
      onApiDataReceived(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerlessFetch = async () => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);

    addLog('Starting serverless API request...');

    try {
      if (!kioskToken) {
        throw new Error('Kiosk Token is required');
      }

      const response = await fetch('/api/product-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kioskToken, userToken })
      });

      if (!response.ok) {
        throw new Error(`Serverless function returned status ${response.status}`);
      }

      const data = await response.json();
      setApiResponse(data);
      onApiDataReceived(data);
      setRawResponse(JSON.stringify(data, null, 2));
      setLastUpdated(new Date().toLocaleString());
      addLog('Successfully received and parsed serverless response');
    } catch (err: any) {
      setError(`Serverless request failed: ${err.message}`);
      addLog(`Error: ${err.message}`);
      
      const mockData = {
        success: 'mock',
        name: 'Sample Product (Mock)',
        price: '150000',
        stock: '10',
        description: 'This is mock data shown because the serverless function failed'
      };
      
      setIsMockData(true);
      setApiResponse(mockData);
      onApiDataReceived(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    toast.info('Logs cleared');
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">API Product Lookup</h3>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <Label htmlFor="kioskToken" className="block text-sm font-medium mb-2">
              Kiosk Token
            </Label>
            <Input 
              id="kioskToken"
              value={kioskToken}
              onChange={(e) => setKioskToken(e.target.value)}
              placeholder="Enter Kiosk Token (e.g., DUP32BXSLWAP4847J84B)"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="userToken" className="block text-sm font-medium mb-2">
              User Token
            </Label>
            <Input 
              id="userToken"
              value={userToken}
              onChange={(e) => setUserToken(e.target.value)}
              placeholder="Enter User Token"
              className="w-full"
              type="password"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 items-end mb-4">
          <div className="w-full">
            <Label htmlFor="corsProxy" className="block text-sm font-medium mb-2">
              CORS Proxy
            </Label>
            <Select 
              value={selectedProxy} 
              onValueChange={(value) => setSelectedProxy(value as ProxyType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select proxy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allorigins">AllOrigins</SelectItem>
                <SelectItem value="corsproxy">CORS Proxy</SelectItem>
                <SelectItem value="cors-anywhere">CORS Anywhere</SelectItem>
                <SelectItem value="direct">Direct API Call</SelectItem>
                <SelectItem value="yproxy">YProxy (AllOrigins Raw)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full">
            <Button 
              onClick={handleApiTest} 
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
              Test API
            </Button>
            
            <Button 
              onClick={handleServerlessFetch} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Use Serverless
            </Button>
            
            <Button 
              onClick={clearLogs} 
              variant="outline"
              className="border-gray-300 text-gray-600"
            >
              Clear Logs
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {isMockData && apiResponse && (
          <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              Displaying sample data because the API returned HTML or encountered a CORS error
            </AlertDescription>
          </Alert>
        )}
        
        {apiResponse && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
            
            <Button 
              onClick={() => onApiDataReceived(apiResponse)}
              type="button"
              className="w-full"
              variant="secondary"
            >
              Apply API Data to Form
            </Button>
          </div>
        )}
        
        <ApiLogs logs={logs} />
      </CardContent>
    </Card>
  );
}

function ApiLogs({ logs }: { logs: string[] }) {
  if (logs.length === 0) return null;
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">API Request Logs</div>
        <div className="text-xs text-muted-foreground">{logs.length} entries</div>
      </div>
      <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
