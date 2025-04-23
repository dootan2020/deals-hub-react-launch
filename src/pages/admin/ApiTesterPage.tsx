// src/pages/admin/ApiTesterPage.tsx
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, RefreshCw, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, ProxyType } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Define API response type
type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ApiTesterPage = () => {
  const [kioskToken, setKioskToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
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
        const { data, error } = await supabase
          .from('api_configs')
          .select('user_token, kiosk_token')
          .eq('is_active', true)
          .single();
          
        if (data) {
          setUserToken(data.user_token || '');
          setKioskToken(data.kiosk_token || '');
        }
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    };

    loadApiConfig();
  }, []);

  // Function to add log entry
  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  const handleApiTest = async () => {
    if (!kioskToken || !userToken) {
      setError('Please enter both Kiosk Token and User Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);
    setLogs([]);
    
    try {
      addLog(`Testing with ${selectedProxy} proxy...`);
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}`;
      addLog(`API URL: ${apiUrl}`);
      
      const { url: proxyUrl } = buildProxyUrl(apiUrl, { 
        proxy_type: selectedProxy,
        type: selectedProxy  // Add the type property for compatibility
      });
      addLog(`Proxy URL: ${proxyUrl}`);
      
      try {
        const response = await fetch(proxyUrl);
        addLog(`Response status: ${response.status}`);
        addLog(`Content-Type: ${response.headers.get('content-type')}`);
        
        const responseText = await response.text();
        addLog(`Received ${responseText.length} bytes of data`);
        
        try {
          let parsedResponse = null;
          
          if (selectedProxy === 'allorigins' && responseText.includes('"contents"')) {
            const allOriginsData = JSON.parse(responseText);
            if (allOriginsData && allOriginsData.contents) {
              parsedResponse = JSON.parse(allOriginsData.contents);
            }
          } else {
            parsedResponse = JSON.parse(responseText);
          }
          
          if (parsedResponse) {
            addLog('Successfully retrieved and parsed data from API');
            setApiResponse(parsedResponse);
            setRawResponse(JSON.stringify(parsedResponse, null, 2));
          }
        } catch (parseError) {
          addLog(`Error parsing response: ${parseError}`);
          await handleServerlessFetch();
        }
      } catch (fetchError) {
        addLog(`Fetch error: ${fetchError}`);
        await handleServerlessFetch();
      }
      
      // Update timestamp
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      );
    } catch (error: any) {
      console.error('API test error:', error);
      setError(`Error: ${error.message || 'Unable to connect to API'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to use serverless function
  const handleServerlessFetch = async () => {
    if (!kioskToken || !userToken) {
      return;
    }
    
    addLog('Falling back to serverless function...');
    
    try {
      // URL to serverless function
      const serverlessUrl = `https://xcpwyvrlutlslgaueokd.supabase.co/functions/v1/api-proxy?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}&proxyType=${selectedProxy}`;
      addLog(`Calling serverless function: ${serverlessUrl.substring(0, 80)}...`);
      
      const response = await fetch(serverlessUrl);
      addLog(`Serverless function returned status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Serverless error: ${response.status}`);
      }
      
      const data = await response.json();
      addLog('Successfully retrieved data from serverless function');
      
      setApiResponse(data);
      setRawResponse(JSON.stringify(data, null, 2));
      setIsMockData(true);
      
      toast.success('Data successfully loaded from serverless function');
    } catch (error: any) {
      addLog(`Serverless error: ${error.message}`);
      setError(`Error: ${error.message}`);
      toast.error('Error connecting to serverless function');
    }
  };

  // Clear logs function
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <AdminLayout title="Test Taphoammo API">
      <Card className="border-primary/20 bg-primary/5 mb-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-primary mb-1">Test Taphoammo API</h1>
          <p className="text-muted-foreground">
            Tool for testing API with CORS error handling solutions
          </p>
        </CardContent>
      </Card>
      
      <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-blue-700">
          If the API returns an error or HTML instead of JSON, the system will automatically fall back to the serverless function or sample data.
        </AlertDescription>  
      </Alert>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          <div>
            <label htmlFor="userToken" className="block text-sm font-medium mb-2">
              User Token
            </label>
            <Input 
              id="userToken"
              value={userToken}
              onChange={(e) => setUserToken(e.target.value)}
              placeholder="Enter User Token"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label htmlFor="corsProxy" className="block text-sm font-medium mb-2">
              CORS Proxy
            </label>
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
                <SelectItem value="corsanywhere">CORS Anywhere</SelectItem>
                <SelectItem value="direct">Direct API Call</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleApiTest} 
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
              Test API
            </Button>
            
            <Button 
              onClick={handleServerlessFetch} 
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white"
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Product name:</div>
                  <div className="font-medium text-green-700">{apiResponse.name}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Price:</div>
                  <div className="font-medium text-blue-700">
                    {Number(apiResponse.price).toLocaleString()} VND
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Stock:</div>
                  <div className="font-medium text-purple-700">{apiResponse.stock}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">JSON response:</div>
                <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto text-xs">
                  {rawResponse}
                </pre>
              </CardContent>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </div>
          </div>
        )}
        
        {logs.length > 0 && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Logs</div>
                <div className="text-xs text-muted-foreground">{logs.length} entries</div>
              </div>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs overflow-x-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Taphoammo API Testing Tool</p>
        <p className="mt-1">Note: This tool is for API testing purposes only and does not store or share token information.</p>
      </div>
    </AdminLayout>
  );
};

export default ApiTesterPage;
