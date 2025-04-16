import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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
  const [userToken, setUserToken] = useState<string>('');
  
  const proxyOptions: ProxyOption[] = [
    { value: 'allorigins', label: 'AllOrigins', description: 'https://api.allorigins.win/get?url=' },
    { value: 'corsproxy', label: 'CORS Proxy', description: 'https://corsproxy.io/?' },
    { value: 'cors-anywhere', label: 'CORS Anywhere', description: 'https://cors-anywhere.herokuapp.com/' },
    { value: 'direct', label: 'Direct API Call', description: 'No Proxy (Direct)' },
    { value: 'custom', label: 'Custom Proxy URL', description: 'Your custom proxy' },
  ];
  
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
  };

  const handleCustomProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCustomProxyUrl(url);
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
    
    // Đặt proxy tạm thời để sử dụng cho lần fetch này
    setTempProxyOverride({
      type: selectedProxyType,
      url: selectedProxyType === 'custom' ? customProxyUrl : undefined
    });
    
    try {
      console.log("Using proxy: ", selectedProxyType);
      const productInfo = await fetchProductInfo(kioskToken);
      console.log("Product info received:", productInfo);
      
      // Kiểm tra nếu productInfo được trích xuất từ HTML
      if (productInfo && productInfo.description === "Information extracted from HTML response") {
        setIsMockData(true);
        setHtmlContent("The API returned HTML instead of JSON. Using extracted data.");
      }
      
      if (productInfo && productInfo.success === 'true') {
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
        
        if (!isMockData) {
          toast.success('Product information retrieved successfully');
        } else {
          toast.warning('Using data from HTML response - may be limited');
        }
      } else {
        // Handle error from API
        const errorMessage = productInfo?.description || 'Failed to retrieve product information';
        setApiError(errorMessage);
        toast.error(`Failed to retrieve product information: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error fetching product info:', error);
      setApiError(error.message || 'Failed to retrieve product information');
      toast.error(`Error: ${error.message || 'Unknown error'}`);
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
                    placeholder="Enter kiosk token for product lookup (e.g., WK76IVBVK3X0WW9DKZ4R)" 
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
            
            {htmlContent && (
              <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200 text-amber-700">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {htmlContent} Try a different proxy if needed.
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
