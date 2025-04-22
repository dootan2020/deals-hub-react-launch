
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ProxyType, ProxySettings } from '@/utils/proxyUtils';
import { prepareInsert, castData } from '@/utils/supabaseHelpers';

export const CorsProxySelector = () => {
  const [proxyType, setProxyType] = useState<ProxyType>('allorigins');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<ProxySettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('proxy_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error("Error loading proxy settings:", error);
          toast.error("Error loading proxy settings");
        }
        return;
      }
      
      if (data) {
        // Use castData to safely cast to ProxySettings
        const safeData = castData<ProxySettings>(data);
        setSettings(safeData);
        setProxyType(safeData.proxy_type as ProxyType);
        setCustomUrl(safeData.custom_url || '');
      }
    } catch (error) {
      console.error("Error loading proxy settings:", error);
      toast.error("Error loading proxy settings");
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      const proxyData = {
        proxy_type: proxyType,
        custom_url: proxyType === 'custom' ? customUrl : null
      };
      
      if (settings?.id) {
        // Update existing settings
        const { error } = await supabase
          .from('proxy_settings')
          .update(proxyData)
          .eq('id', settings.id);
          
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('proxy_settings')
          .insert(proxyData);
          
        if (error) throw error;
      }
      
      toast.success("Proxy settings saved successfully");
      loadSettings();
    } catch (error: any) {
      console.error("Error saving proxy settings:", error);
      toast.error(error.message || "Error saving proxy settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProxyTypeChange = (value: string) => {
    setProxyType(value as ProxyType);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">CORS Proxy Selector</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="proxyType">Proxy Type</Label>
              <RadioGroup value={proxyType} onValueChange={handleProxyTypeChange} className="pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="allorigins" id="r1" />
                  <Label htmlFor="r1">AllOrigins</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corsproxy" id="r2" />
                  <Label htmlFor="r2">CORS Proxy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cors-anywhere" id="r3" />
                  <Label htmlFor="r3">CORS Anywhere</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direct" id="r4" />
                  <Label htmlFor="r4">Direct</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="r5" />
                  <Label htmlFor="r5">Custom</Label>
                </div>
              </RadioGroup>
            </div>

            {proxyType === 'custom' && (
              <div>
                <Label htmlFor="customUrl">Custom URL</Label>
                <Input
                  type="text"
                  id="customUrl"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>
            )}

            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorsProxySelector;
