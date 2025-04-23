
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  prepareQueryParam,
  safeExtractProperty,
  prepareInsertData,
  prepareUpdateData,
  safeDatabaseData,
  hasId,
  safeExtractId
} from '@/utils/supabaseTypeUtils';

type ProxyType = 'allorigins' | 'corsproxy' | 'direct' | 'custom';

interface ProxySettings {
  type: ProxyType;
  customUrl?: string;
}

export const CorsProxySelector = () => {
  const [proxyType, setProxyType] = useState<ProxyType>('allorigins');
  const [customUrl, setCustomUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // First try to get from proxy_settings table
      const { data: proxyData, error: proxyError } = await supabase
        .from('proxy_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!proxyError && proxyData) {
        // Use safe extraction to avoid TypeScript errors
        setProxyType(safeExtractProperty<ProxyType>(proxyData, 'proxy_type', 'allorigins'));
        setCustomUrl(safeExtractProperty<string>(proxyData, 'custom_url', ''));
        setIsLoading(false);
        return;
      }

      // Fall back to site_settings table if proxy_settings doesn't exist
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', prepareQueryParam('cors_proxy'));

      if (settingsError) {
        if (settingsError.code !== 'PGRST116') { // Not found error
          throw settingsError;
        }
        // Default settings if nothing found
        setProxyType('allorigins');
        setCustomUrl('');
      } else if (settingsData && settingsData.length > 0 && settingsData[0]) {
        // Parse and set existing settings, using safe extraction
        const valueData = safeExtractProperty<any>(settingsData[0], 'value', {});
        if (valueData && typeof valueData === 'object') {
          setProxyType(safeExtractProperty<ProxyType>(valueData, 'type', 'allorigins'));
          setCustomUrl(safeExtractProperty<string>(valueData, 'customUrl', ''));
        }
      }
    } catch (error) {
      console.error('Error loading proxy settings:', error);
      toast.error('Error loading proxy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Prepare settings data
      const settings: ProxySettings = {
        type: proxyType,
        customUrl: proxyType === 'custom' ? customUrl : undefined
      };

      // First try to save to proxy_settings table
      const { data: existingSettings, error: fetchError } = await supabase
        .from('proxy_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingSettings && existingSettings.length > 0) {
        // Safely extract the ID
        const settingId = safeExtractId(existingSettings[0]);
        
        if (settingId) {
          // Update existing record using our safe update function
          const updateData = prepareUpdateData({
            proxy_type: proxyType,
            custom_url: proxyType === 'custom' ? customUrl : null
          });
          
          const { error: updateError } = await supabase
            .from('proxy_settings')
            .update(updateData)
            .eq('id', prepareQueryParam(settingId));

          if (updateError) throw updateError;
        } else {
          // Insert new record if we couldn't extract the ID
          await insertNewProxySettings();
        }
      } else {
        // Insert new record using our safe insert function
        await insertNewProxySettings();
      }

      // Also save to site_settings for backward compatibility
      const { data: existingSetting, error: settingFetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', prepareQueryParam('cors_proxy'))
        .maybeSingle();

      if (existingSetting) {
        // Update existing record
        const updateData = prepareUpdateData({
          value: settings,
          updated_at: new Date().toISOString()
        });
        
        const { error: updateError } = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('key', prepareQueryParam('cors_proxy'));

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const insertData = prepareInsertData({
          key: 'cors_proxy',
          value: settings,
          updated_at: new Date().toISOString()
        });
        
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      toast.success('Proxy settings saved successfully');
    } catch (error) {
      console.error('Error saving proxy settings:', error);
      toast.error('Error saving proxy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const insertNewProxySettings = async () => {
    const insertData = prepareInsertData({
      proxy_type: proxyType,
      custom_url: proxyType === 'custom' ? customUrl : null
    });
    
    const { error: insertError } = await supabase
      .from('proxy_settings')
      .insert(insertData);

    if (insertError) throw insertError;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="loading">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CORS Proxy Settings</CardTitle>
        <CardDescription>
          Configure the CORS proxy service for API requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <RadioGroup
            value={proxyType}
            onValueChange={(value) => setProxyType(value as ProxyType)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="allorigins" id="allorigins" />
              <Label htmlFor="allorigins">AllOrigins (Default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="corsproxy" id="corsproxy" />
              <Label htmlFor="corsproxy">CORS Proxy (corsproxy.io)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct">Direct API Call</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom URL</Label>
            </div>
          </RadioGroup>

          {proxyType === 'custom' && (
            <div className="mt-4">
              <Label htmlFor="custom-url">Custom Proxy URL</Label>
              <Input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-proxy-url.com/"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use {"{url}"} as a placeholder for the target URL
              </p>
            </div>
          )}

          <CardFooter className="flex justify-end px-0 pt-5">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default CorsProxySelector;
