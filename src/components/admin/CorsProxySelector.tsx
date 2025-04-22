import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle, 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ProxyType } from '@/utils/proxyUtils';
import { isValidRecord, isSupabaseRecord } from '@/utils/supabaseHelpers';

export type { ProxyType } from '@/utils/proxyUtils';

interface ProxyConfig {
  type: ProxyType;
  url?: string;
}

export function CorsProxySelector() {
  const [loading, setLoading] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [customProxyUrl, setCustomProxyUrl] = useState('');
  const [savedConfig, setSavedConfig] = useState<ProxyConfig | null>(null);

  const proxyOptions = [
    { value: 'allorigins', label: 'AllOrigins (https://api.allorigins.win/get?url=)' },
    { value: 'corsproxy', label: 'CORS Proxy (https://corsproxy.io/?)' },
    { value: 'cors-anywhere', label: 'CORS Anywhere (https://cors-anywhere.herokuapp.com/)' },
    { value: 'direct', label: 'Direct API Call (No Proxy)' },
    { value: 'custom', label: 'Custom Proxy URL' },
  ];

  useEffect(() => {
    fetchCurrentProxy();
  }, []);

  const fetchCurrentProxy = async () => {
    setLoading(true);
    try {
      const { data: proxySettings, error } = await supabase
        .from('proxy_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setLoading(false);
        return;
      }

      if (proxySettings && isSupabaseRecord(proxySettings) && isValidRecord(proxySettings)) {
        const proxyType = typeof proxySettings.proxy_type === 'string' 
          ? proxySettings.proxy_type as ProxyType 
          : 'allorigins';

        const customUrl = typeof proxySettings.custom_url === 'string' 
          ? proxySettings.custom_url 
          : '';

        setSavedConfig({
          type: proxyType,
          url: customUrl || undefined,
        });
        setSelectedProxy(proxyType);
        setCustomProxyUrl(customUrl || '');
      }
    } catch (error) {
      // toast error optional
    } finally {
      setLoading(false);
    }
  };

  const saveProxySettings = async () => {
    setLoading(true);
    try {
      const proxyData: any = {
        proxy_type: selectedProxy,
        custom_url: selectedProxy === 'custom' ? customProxyUrl : null,
      };

      const { error } = await supabase
        .from('proxy_settings')
        .insert([proxyData]); // Must be array

      if (error) throw error;

      setSavedConfig({
        type: selectedProxy,
        url: selectedProxy === 'custom' ? customProxyUrl : undefined,
      });

      toast.success('CORS proxy settings saved successfully');
    } catch (error: any) {
      toast.error(`Failed to save proxy settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CORS Proxy Settings</CardTitle>
        <CardDescription>
          Select which proxy to use for API requests to TapHoaMMO
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="proxy-select">Proxy Type</Label>
          <Select
            value={selectedProxy}
            onValueChange={(value) => setSelectedProxy(value as ProxyType)}
            disabled={loading}
          >
            <SelectTrigger id="proxy-select" className="w-full">
              <SelectValue placeholder="Select a proxy" />
            </SelectTrigger>
            <SelectContent>
              {proxyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Different proxies may have varying reliability or rate limits
          </p>
        </div>

        {selectedProxy === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-proxy">Custom Proxy URL</Label>
            <Input
              id="custom-proxy"
              placeholder="https://your-proxy.com/proxy?url="
              value={customProxyUrl}
              onChange={(e) => setCustomProxyUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Enter the full URL including the placeholder where the target URL will be inserted
            </p>
          </div>
        )}

        {savedConfig && (
          <div className="rounded-md bg-muted p-3 mt-2">
            <p className="text-sm font-medium">Current active setting:</p>
            <p className="text-sm text-muted-foreground">
              {proxyOptions.find(opt => opt.value === savedConfig.type)?.label}
              {savedConfig.type === 'custom' && savedConfig.url && 
                ` (${savedConfig.url})`
              }
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={saveProxySettings} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Proxy Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
