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
import { ProxyType, fetchProxySettings } from '@/utils/proxyUtils';
import { fetchActiveApiConfig, fetchProductInfoViaServerless } from '@/utils/apiUtils';
import { supabase } from "@/integrations/supabase/client";

interface ApiResponse {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
}

interface ApiProductTesterProps {
  onApiDataReceived: (data: ApiResponse) => void;
  initialKioskToken?: string;
  initialUserToken?: string;
}

export function ApiProductTester({ 
  onApiDataReceived, 
  initialKioskToken = '', 
  initialUserToken = '' 
}: ApiProductTesterProps) {
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

  useEffect(() => {
    const loadApiConfig = async () => {
      try {
        const apiConfig = await fetchActiveApiConfig();
        if (apiConfig) {
          setUserToken(apiConfig.user_token || '');
        }
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    };
    
    if (!initialUserToken) {
      loadApiConfig();
    }
  }, [initialUserToken]);

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

    addLog('Starting API test using direct serverless function...');

    try {
      if (!kioskToken) {
        throw new Error('Kiosk Token is required');
      }

      if (!userToken) {
        throw new Error('User Token is required');
      }
      
      // Use Supabase Edge Function directly
      addLog('Calling serverless API proxy function...');
      
      const { data, error: invokeError } = await supabase.functions.invoke('api-proxy', {
        body: { 
          endpoint: 'getStock',
          kioskToken,
          userToken
        }
      });
      
      if (invokeError) {
        throw new Error(`Serverless function error: ${invokeError.message}`);
      }
      
      if (!data) {
        throw new Error('Empty response from serverless function');
      }
      
      // Log and set the raw response
      setRawResponse(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      addLog(`Raw response received: ${JSON.stringify(data).substring(0, 50)}...`);
      
      // Handle the response data
      if (data.fromHtml || data.parseError || data.fetchError) {
        addLog('API returned problematic data, but it was handled by the serverless function');
        setIsMockData(data.fromHtml || data.parseError || data.fetchError);
      }
      
      setApiResponse(data);
      setLastUpdated(new Date().toLocaleString());
      
      if (data.success === "true") {
        addLog('Successfully processed API response');
        toast.success('Product data retrieved successfully!');
      } else {
        addLog(`API returned error: ${data.error || 'Unknown error'}`);
        toast.error(`API error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      const errorMsg = `API request failed: ${err.message}`;
      setError(errorMsg);
      addLog(`Error: ${err.message}`);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const applyApiDataToForm = () => {
    if (apiResponse) {
      onApiDataReceived({
        success: apiResponse.success,
        name: apiResponse.name,
        price: apiResponse.price,
        stock: apiResponse.stock,
        description: apiResponse.description
      });
      toast.success('Data applied to form successfully');
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
        
        <div className="flex flex-col md:flex-row gap-4 items-end mb-4">
          <div className="w-full md:w-1/3">
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
          
          <div className="flex flex-wrap gap-2">
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
              onClick={applyApiDataToForm}
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
