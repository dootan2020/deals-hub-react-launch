
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Globe, Loader2, Info, AlertCircle } from 'lucide-react';
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
import { extractFromHtml } from '@/utils/apiUtils';

interface ProxyOption {
  value: string;
  label: string;
  description: string;
}

export function KioskTokenField() {
  const form = useFormContext();
  const { fetchProductInfo, setTempProxyOverride } = useProductSync();
  const [isLoadingProductInfo, setIsLoadingProductInfo] = useState(false);
  const [selectedProxyType, setSelectedProxyType] = useState<ProxyType>('allorigins');
  const [customProxyUrl, setCustomProxyUrl] = useState<string>('');
  const [activeProxy, setActiveProxy] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  
  const proxyOptions: ProxyOption[] = [
    { value: 'allorigins', label: 'AllOrigins', description: 'https://api.allorigins.win/get?url=' },
    { value: 'corsproxy', label: 'CORS Proxy', description: 'https://corsproxy.io/?' },
    { value: 'cors-anywhere', label: 'CORS Anywhere', description: 'https://cors-anywhere.herokuapp.com/' },
    { value: 'direct', label: 'Direct API Call', description: 'No Proxy (Direct)' },
    { value: 'custom', label: 'Custom Proxy URL', description: 'Your custom proxy' },
  ];
  
  // Fetch the active proxy on component mount
  import { useEffect } from 'react';
  import { supabase } from '@/integrations/supabase/client';
  
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
    
    fetchActiveProxy();
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

  const handleFetchProductInfo = async () => {
    const kioskToken = form.getValues('kioskToken');
    
    if (!kioskToken) {
      toast.error('Please enter a Kiosk Token');
      return;
    }

    setIsLoadingProductInfo(true);
    setApiError(null);
    setApiSuccess(null);
    setIsMockData(false);
    setHtmlContent(null);
    
    try {
      setTempProxyOverride({
        type: selectedProxyType,
        url: selectedProxyType === 'custom' ? customProxyUrl : undefined
      });
      
      const productInfo = await fetchProductInfo(kioskToken);
      
      console.log("Product info received:", productInfo);
      
      if (productInfo && productInfo.name && productInfo.name.startsWith('Demo Product')) {
        setIsMockData(true);
      }
      
      if (productInfo && productInfo.success === 'true') {
        form.setValue('title', productInfo.name || '');
        form.setValue('description', productInfo.description || form.getValues('description') || '');
        form.setValue('price', productInfo.price || '0');
        form.setValue('inStock', parseInt(productInfo.stock || '0', 10) > 0);
        
        if (!form.getValues('slug') && productInfo.name) {
          const slug = productInfo.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          form.setValue('slug', slug);
        }
        
        setApiSuccess('Product information retrieved successfully');
        toast.success('Product information retrieved successfully');
      } else {
        const errorMessage = productInfo?.description || 'Failed to retrieve product information';
        setApiError(errorMessage);
        toast.error(`Failed to retrieve product information: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error fetching product info:', error);
      
      let errorMsg = error.message;
      
      if (errorMsg.includes('<!DOCTYPE') || errorMsg.includes('<html')) {
        try {
          const extracted = extractFromHtml(errorMsg);
          
          if (extracted && (extracted.name || extracted.price)) {
            setHtmlContent(errorMsg);
            setApiSuccess('Some product information was extracted from the HTML response');
            toast.success('Some product information was extracted from the HTML response');
            return;
          } else {
            errorMsg = 'API returned HTML instead of JSON. Could not extract product information from the HTML.';
          }
        } catch (extractError) {
          errorMsg = 'API returned HTML instead of JSON. Failed to extract any useful information.';
        }
      }
      
      setApiError(errorMsg || 'Failed to retrieve product information');
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsLoadingProductInfo(false);
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
                    placeholder="Enter kiosk token for product lookup" 
                    className="flex-grow"
                  />
                </FormControl>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <Select
                      value={selectedProxyType}
                      onValueChange={(value) => handleSelectProxy(value as ProxyType)}
                    >
                      <SelectTrigger className="w-[130px]" aria-label="Select CORS Proxy">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>CORS Proxy</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {proxyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={handleFetchProductInfo}
                    disabled={isLoadingProductInfo}
                    className="whitespace-nowrap"
                  >
                    {isLoadingProductInfo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Get Product Info
                  </Button>
                </div>
              </div>
              
              {selectedProxyType === 'custom' && (
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={customProxyUrl}
                    onChange={handleCustomProxyChange}
                    placeholder="https://your-custom-proxy.com/?url="
                    className="flex-grow"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                Enter a valid kiosk token (e.g., KH5ZB5QB8G1L7J7S4DGW) to retrieve product information.
              </p>
              {activeProxy && (
                <p className="text-xs text-muted-foreground">
                  Default proxy: <span className="font-medium">{activeProxy}</span> 
                  <a href="/admin/proxy-settings" className="ml-1 text-primary hover:underline">(manage)</a>
                </p>
              )}
            </div>
            
            {isMockData && (
              <Alert variant="default" className="mt-2 bg-blue-50 border-blue-200 text-blue-700">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Using mock data because the API connection to TapHoaMMO is returning HTML instead of JSON. This is for demo purposes only.
                </AlertDescription>
              </Alert>
            )}
            
            {apiSuccess && (
              <Alert variant="default" className="mt-2 bg-green-50 border-green-200 text-green-700">
                <AlertDescription>
                  {apiSuccess}
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
            
            {htmlContent && (
              <div className="mt-3">
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                    Show Raw HTML Content (for debugging)
                  </summary>
                  <div className="mt-2 bg-slate-100 p-3 rounded-md overflow-auto max-h-40">
                    <code className="text-xs whitespace-pre-wrap">{htmlContent}</code>
                  </div>
                </details>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
