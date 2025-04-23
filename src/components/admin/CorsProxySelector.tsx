
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Globe, Save, RefreshCw, TestTube2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProxyType, ProxyConfig } from '@/utils/proxyUtils';

const CorsProxySelector: React.FC = () => {
  const [proxyConfig, setProxyConfig] = useState<ProxyConfig>({
    proxyType: 'allorigins',
    customUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proxy_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setProxyConfig({
          proxyType: data.proxy_type as ProxyType,
          customUrl: data.custom_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching proxy settings:', error);
      toast.error('Failed to load proxy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeProxyType = (value: ProxyType) => {
    setProxyConfig({
      ...proxyConfig,
      proxyType: value
    });
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProxyConfig({
      ...proxyConfig,
      customUrl: e.target.value
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // First check if we have existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('proxy_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      let error;
      
      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('proxy_settings')
          .update({
            proxy_type: proxyConfig.proxyType,
            custom_url: proxyConfig.customUrl || null
          })
          .eq('id', existingSettings.id);
          
        error = updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('proxy_settings')
          .insert({
            proxy_type: proxyConfig.proxyType,
            custom_url: proxyConfig.customUrl || null
          });
          
        error = insertError;
      }

      if (error) throw error;
      
      toast.success('Proxy settings saved successfully');
    } catch (error) {
      console.error('Error saving proxy settings:', error);
      toast.error('Failed to save proxy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestProxy = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test URL
      const testUrl = 'https://httpbin.org/get';
      const proxyUrl = buildProxyUrl(testUrl, proxyConfig);
      
      toast.info(`Testing proxy: ${proxyConfig.proxyType}`);
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setTestResult({
        success: true,
        message: 'Proxy test successful!'
      });
      
      toast.success('Proxy test successful!');
    } catch (error) {
      console.error('Proxy test error:', error);
      
      setTestResult({
        success: false,
        message: `Test failed: ${(error as Error).message}`
      });
      
      toast.error(`Proxy test failed: ${(error as Error).message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const buildProxyUrl = (targetUrl: string, config: ProxyConfig): string => {
    const encodedUrl = encodeURIComponent(targetUrl);
    
    switch (config.proxyType) {
      case 'allorigins':
        return `https://api.allorigins.win/get?url=${encodedUrl}`;
        
      case 'corsproxy':
        return `https://corsproxy.io/?${encodedUrl}`;
        
      case 'corsanywhere':
        return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
        
      case 'direct':
        return targetUrl;
        
      default:
        if (config.customUrl) {
          return config.customUrl.replace('{{url}}', encodedUrl);
        }
        return `https://api.allorigins.win/get?url=${encodedUrl}`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          CORS Proxy Configuration
        </CardTitle>
        <CardDescription>
          Select a CORS proxy service to use for API requests. This allows the frontend to make requests to APIs that don't support CORS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup 
          value={proxyConfig.proxyType} 
          onValueChange={(value) => handleChangeProxyType(value as ProxyType)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="allorigins" id="allorigins" />
            <Label htmlFor="allorigins" className="font-medium">AllOrigins</Label>
            <span className="text-xs text-muted-foreground ml-2">
              (api.allorigins.win)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="corsproxy" id="corsproxy" />
            <Label htmlFor="corsproxy" className="font-medium">CORS Proxy</Label>
            <span className="text-xs text-muted-foreground ml-2">
              (corsproxy.io)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="corsanywhere" id="corsanywhere" />
            <Label htmlFor="corsanywhere" className="font-medium">CORS Anywhere</Label>
            <span className="text-xs text-muted-foreground ml-2">
              (cors-anywhere.herokuapp.com)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct" className="font-medium">Direct Request</Label>
            <span className="text-xs text-muted-foreground ml-2">
              (No proxy, API must support CORS)
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="font-medium">Custom Proxy URL</Label>
          </div>
        </RadioGroup>
        
        {proxyConfig.proxyType === 'custom' && (
          <div className="pt-2">
            <Label htmlFor="customUrl" className="text-sm">Custom Proxy URL</Label>
            <Input 
              id="customUrl"
              placeholder="https://your-proxy-service.com/?url={{url}}"
              value={proxyConfig.customUrl || ''}
              onChange={handleCustomUrlChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {{url}} as a placeholder where the target URL should be inserted.
            </p>
          </div>
        )}
        
        {testResult && (
          <Alert className={testResult.success ? "bg-green-50" : "bg-red-50"}>
            <CheckCircle2 className={`h-4 w-4 ${testResult.success ? "text-green-500" : "text-red-500"}`} />
            <AlertDescription className={testResult.success ? "text-green-700" : "text-red-700"}>
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestProxy}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
            Test Proxy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorsProxySelector;
