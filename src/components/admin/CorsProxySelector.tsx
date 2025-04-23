import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface CorsProxySelectorProps {
  onProxyChange?: (proxy: string) => void;
  defaultProxy?: string;
}

const PROXY_OPTIONS = [
  {
    id: 'direct',
    name: 'Direct Connection',
    description: 'Connect directly to the API without a proxy',
    value: '',
  },
  {
    id: 'corsanywhere',
    name: 'CORS Anywhere',
    description: 'Use the CORS Anywhere proxy service',
    value: 'https://cors-anywhere.herokuapp.com/',
  },
  {
    id: 'corsproxy',
    name: 'CORS Proxy',
    description: 'Use the CORS Proxy service',
    value: 'https://corsproxy.io/?',
  },
  {
    id: 'custom',
    name: 'Custom Proxy',
    description: 'Use a custom proxy URL',
    value: 'custom',
  },
];

export const CorsProxySelector: React.FC<CorsProxySelectorProps> = ({
  onProxyChange,
  defaultProxy = '',
}) => {
  const [selectedProxy, setSelectedProxy] = useState(
    defaultProxy ? (PROXY_OPTIONS.some(p => p.value === defaultProxy) ? defaultProxy : 'custom') : ''
  );
  const [customProxy, setCustomProxy] = useState(
    defaultProxy && !PROXY_OPTIONS.some(p => p.value === defaultProxy) ? defaultProxy : ''
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [savedProxy, setSavedProxy] = useState(defaultProxy);

  useEffect(() => {
    // Load saved proxy from database or local storage
    const loadSavedProxy = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'cors_proxy')
          .single();

        if (error) {
          console.error('Error loading proxy setting:', error);
          return;
        }

        if (data?.value) {
          const proxyValue = data.value;
          setSavedProxy(proxyValue);
          
          // Set the appropriate radio button
          const matchingOption = PROXY_OPTIONS.find(option => option.value === proxyValue);
          if (matchingOption) {
            setSelectedProxy(matchingOption.value);
          } else {
            setSelectedProxy('custom');
            setCustomProxy(proxyValue);
          }
        }
      } catch (err) {
        console.error('Failed to load proxy setting:', err);
      }
    };

    loadSavedProxy();
  }, []);

  const handleProxyChange = (value: string) => {
    setSelectedProxy(value);
    setTestResult(null);
    
    if (value !== 'custom') {
      if (onProxyChange) {
        onProxyChange(value);
      }
    }
  };

  const handleCustomProxyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomProxy(e.target.value);
    setTestResult(null);
  };

  const testProxy = async () => {
    const proxyUrl = selectedProxy === 'custom' ? customProxy : selectedProxy;
    if (!proxyUrl && selectedProxy !== 'direct') {
      toast.error('Please enter a proxy URL');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test URL that requires CORS
      const testUrl = 'https://api.github.com/users/octocat';
      const finalUrl = selectedProxy === 'direct' ? testUrl : `${proxyUrl}${testUrl}`;

      const response = await fetch(finalUrl);
      if (response.ok) {
        setTestResult('success');
        toast.success('Proxy test successful!');
      } else {
        setTestResult('error');
        toast.error(`Proxy test failed: ${response.statusText}`);
      }
    } catch (error) {
      setTestResult('error');
      toast.error(`Proxy test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const saveProxy = async () => {
    const proxyUrl = selectedProxy === 'custom' ? customProxy : selectedProxy;
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'cors_proxy', 
          value: proxyUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setSavedProxy(proxyUrl);
      if (onProxyChange) {
        onProxyChange(proxyUrl);
      }
      
      toast.success('Proxy settings saved successfully');
    } catch (error) {
      toast.error(`Failed to save proxy settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CORS Proxy Settings</CardTitle>
        <CardDescription>
          Configure a CORS proxy to help with API requests that have CORS restrictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedProxy} onValueChange={handleProxyChange} className="space-y-4">
          {PROXY_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start space-x-2">
              <RadioGroupItem value={option.value} id={option.id} />
              <div className="grid gap-1.5">
                <Label htmlFor={option.id} className="font-medium">
                  {option.name}
                </Label>
                <p className="text-sm text-muted-foreground">{option.description}</p>
                {option.id === 'custom' && selectedProxy === 'custom' && (
                  <Input
                    value={customProxy}
                    onChange={handleCustomProxyChange}
                    placeholder="Enter custom proxy URL"
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          ))}
        </RadioGroup>

        {testResult === 'success' && (
          <div className="flex items-center mt-4 p-2 bg-green-50 text-green-700 rounded-md">
            <Check className="h-5 w-5 mr-2" />
            <span>Proxy test successful!</span>
          </div>
        )}

        {testResult === 'error' && (
          <div className="flex items-center mt-4 p-2 bg-red-50 text-red-700 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Proxy test failed. Please check the URL and try again.</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={testProxy} disabled={isTesting}>
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Proxy'
          )}
        </Button>
        <Button onClick={saveProxy}>
          Save Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CorsProxySelector;
