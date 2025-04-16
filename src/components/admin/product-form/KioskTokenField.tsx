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
    
    // Đặt proxy tạm thời ngay khi người dùng chọn
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
      // Ensure we're using the selected proxy
      console.log("Using proxy: ", selectedProxyType);
      const productInfo = await fetchProductInfo(kioskToken);
      console.log("Product info received:", productInfo);
      
      // Check if product info was extracted from HTML
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
        toast.success('Product information retrieved successfully');
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
            
            {htmlContent && (
              <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200 text-amber-700">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {htmlContent}
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
