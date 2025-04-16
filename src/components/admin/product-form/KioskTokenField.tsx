
// src/components/admin/product-form/KioskTokenField.tsx

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useProductSync, ProxyType } from '@/hooks/use-product-sync';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function KioskTokenField() {
  const form = useFormContext();
  const { setTempProxyOverride } = useProductSync();
  const [isLoadingProductInfo, setIsLoadingProductInfo] = useState(false);
  const [selectedProxyType, setSelectedProxyType] = useState<ProxyType>('allorigins');
  const [customProxyUrl, setCustomProxyUrl] = useState<string>('');
  const [activeProxy, setActiveProxy] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchActiveProxy = async () => {
      try {
        const { data, error } = await supabase
          .from('proxy_settings')
          .select('proxy_type, custom_url')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching proxy settings:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const proxy = data[0];
          setSelectedProxyType(proxy.proxy_type as ProxyType);
          setCustomProxyUrl(proxy.custom_url || '');
          
          setActiveProxy(proxy.proxy_type === 'custom' ? 
            `Custom (${proxy.custom_url})` : 
            proxy.proxy_type.charAt(0).toUpperCase() + proxy.proxy_type.slice(1));
        } else {
          setActiveProxy('AllOrigins (default)');
          setSelectedProxyType('allorigins');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    const fetchApiConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('api_configs')
          .select('user_token')
          .eq('is_active', true)
          .single();
          
        if (data && data.user_token) {
          setUserToken(data.user_token);
        }
      } catch (error) {
        console.error('Error fetching API config:', error);
      }
    };
    
    fetchActiveProxy();
    fetchApiConfig();
  }, []);

  const handleSelectProxy = (proxy: ProxyType) => {
    setSelectedProxyType(proxy);
    setTempProxyOverride({
      type: proxy,
      url: proxy === 'custom' ? customProxyUrl : undefined
    });
  };

  const handleCustomProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomProxyUrl(url);
    
    if (selectedProxyType === 'custom') {
      setTempProxyOverride({
        type: 'custom',
        url
      });
    }
  };

  // Function to add log entry
  const addLog = (message: string) => {
    const now = new Date();
    const timestamp = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
    console.log(`${timestamp} ${message}`);
  };

  const handleFetchProductInfo = async () => {
    const kioskToken = form.getValues('kioskToken');
    
    if (!kioskToken) {
      toast.error('Please enter a Kiosk Token');
      return;
    }

    if (!userToken) {
      toast.error('No active API configuration found. Please set up API configuration first.');
      return;
    }

    setIsLoadingProductInfo(true);
    setApiError(null);
    setApiSuccess(null);
    setIsMockData(false);
    setHtmlContent(null);
    setLogs([]);
    
    try {
      addLog(`Using proxy: ${selectedProxyType}`);
      
      // Use our serverless function instead of direct API call
      const timestamp = new Date().getTime();
      const apiUrl = `/functions/v1/api-proxy?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}&proxyType=${selectedProxyType}&_t=${timestamp}`;
      
      addLog(`Calling API proxy: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
        }
      });
      
      addLog(`Response status: ${response.status}`);
      addLog(`Content-Type: ${response.headers.get('content-type')}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseText = await response.text();
      addLog(`Received ${responseText.length} bytes of data`);
      
      let productInfo;
      try {
        productInfo = JSON.parse(responseText);
        addLog('Successfully parsed response as JSON');
      } catch (error) {
        addLog('Failed to parse response as JSON, response may be HTML');
        throw new Error('Invalid JSON response from API');
      }
      
      if (productInfo) {
        if (productInfo.mock === true || productInfo.fromMockData === true) {
          setIsMockData(true);
          addLog('Response contains mock data');
          setHtmlContent("The API returned mock data because the original response was HTML or invalid.");
        } else {
          addLog('Response contains real data from API');
        }
        
        if (productInfo.success === 'true') {
          // Fill form with product info
          form.setValue('title', productInfo.name || '');
          form.setValue('description', productInfo.description || form.getValues('description') || '');
          form.setValue('price', productInfo.price || '0');
          form.setValue('inStock', parseInt(productInfo.stock || '0', 10) > 0);
          
          // Generate slug if not provided
          if (!form.getValues('slug') && productInfo.name) {
            const slug = productInfo.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            form.setValue('slug', slug);
          }
          
          setApiSuccess('Product information retrieved successfully');
          toast.success('Product information retrieved successfully');
          addLog('Product information filled in form successfully');
        } else {
          // Handle error from API
          const errorMessage = productInfo?.description || 'Failed to retrieve product information';
          setApiError(errorMessage);
          toast.error(`Failed to retrieve product information: ${errorMessage}`);
          addLog(`API returned error: ${errorMessage}`);
        }
      }
    } catch (error: any) {
      console.error('Error fetching product info:', error);
      setApiError(error.message || 'Failed to retrieve product information');
      toast.error(`Error: ${error.message || 'Unknown error'}`);
      addLog(`Error: ${error.message}`);
      
      // Try to use serverless function as fallback if needed
      if (error.message.includes('JSON') || error.message.includes('HTML')) {
        addLog('Trying to use serverless function as fallback...');
        await handleServerlessFetch(kioskToken);
      }
    } finally {
      setIsLoadingProductInfo(false);
    }
  };
  
  const handleServerlessFetch = async (kioskToken: string) => {
    if (!kioskToken || !userToken) {
      return;
    }
    
    addLog('Falling back to serverless function direct call...');
    
    try {
      // URL to serverless function with force=true to bypass cache and use mock data if needed
      const serverlessUrl = `/functions/v1/api-proxy?kioskToken=${encodeURIComponent(kioskToken)}&userToken=${encodeURIComponent(userToken)}&proxyType=${selectedProxyType}&force=true`;
      addLog(`Calling serverless function directly: ${serverlessUrl.substring(0, 80)}...`);
      
      const response = await fetch(serverlessUrl);
      addLog(`Serverless function returned status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Serverless error: ${response.status}`);
      }
      
      const data = await response.json();
      addLog('Successfully retrieved data from serverless function');
      
      if (data && data.success === 'true') {
        // Fill form with product info
        form.setValue('title', data.name || '');
        form.setValue('description', data.description || form.getValues('description') || '');
        form.setValue('price', data.price || '0');
        form.setValue('inStock', parseInt(data.stock || '0', 10) > 0);
        
        // Generate slug if not provided
        if (!form.getValues('slug') && data.name) {
          const slug = data.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          form.setValue('slug', slug);
        }
        
        setIsMockData(true);
        setApiSuccess('Product information retrieved successfully (using mock data)');
        toast.success('Product information retrieved using mock data');
        addLog('Form filled with mock data');
      }
    } catch (error: any) {
      addLog(`Serverless fallback error: ${error.message}`);
      setApiError(`Error: ${error.message}`);
      toast.error('Error connecting to serverless function');
    }
  };

  return (
    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-8">
      <FormField
        name="kioskToken"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Kiosk Token</FormLabel>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter kiosk token for product lookup (e.g., WK76IVBVK3X0WW9DKZ4R)" 
                    className="flex-grow"
                  />
                </FormControl>
              </div>
              
              <div className="flex gap-2 mt-2">
                <div className="w-[180px]">
                  <div className="text-sm text-muted-foreground mb-1">CORS Proxy</div>
                  <Select
                    value={selectedProxyType}
                    onValueChange={(value) => handleSelectProxy(value as ProxyType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proxy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allorigins">AllOrigins</SelectItem>
                      <SelectItem value="corsproxy">CORS Proxy</SelectItem>
                      <SelectItem value="cors-anywhere">CORS Anywhere</SelectItem>
                      <SelectItem value="direct">Direct API Call</SelectItem>
                      <SelectItem value="custom">Custom Proxy URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  {selectedProxyType === 'custom' && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Custom Proxy URL</div>
                      <Input 
                        value={customProxyUrl}
                        onChange={handleCustomProxyChange}
                        placeholder="https://your-custom-proxy.com/?url="
                      />
                    </div>
                  )}
                </div>
                
                <div className="self-end">
                  <Button
                    type="button"
                    onClick={handleFetchProductInfo}
                    disabled={isLoadingProductInfo}
                  >
                    {isLoadingProductInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Product Info
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Enter a valid kiosk token to retrieve product information from TapHoaMMO API.
              </p>
              {activeProxy && (
                <p className="text-xs text-muted-foreground">
                  Default proxy: <span className="font-medium">{activeProxy}</span> 
                  <a href="/admin/proxy-settings" className="ml-1 text-primary hover:underline">(manage)</a>
                </p>
              )}
            </div>
            
            {apiSuccess && (
              <Alert variant="default" className="mt-2 bg-green-50 border-green-200 text-green-700">
                <AlertDescription>
                  {apiSuccess}
                </AlertDescription>
              </Alert>
            )}
            
            {isMockData && (
              <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200 text-amber-700">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {htmlContent || "Using mock data because the API returned HTML or encountered a CORS error"}
                </AlertDescription>
              </Alert>
            )}
            
            {apiError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {apiError}
                </AlertDescription>
              </Alert>
            )}
            
            {logs.length > 0 && (
              <div className="mt-4 border rounded-md p-2 bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-medium">Debug Logs</div>
                  <button 
                    onClick={() => setLogs([])} 
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Clear
                  </button>
                </div>
                <div className="bg-black text-green-400 p-2 rounded-md text-xs font-mono h-24 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">{log}</div>
                  ))}
                </div>
              </div>
            )}
            
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
