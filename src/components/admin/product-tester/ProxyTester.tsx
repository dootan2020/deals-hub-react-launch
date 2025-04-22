
import React, { useState } from 'react';
import { ProxyType, ProxyConfig, buildProxyUrl } from '@/utils/proxyUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

// Define the enum for UI display
enum ProxyTypeEnum {
  Mobile = 'Mobile',
  Residential = 'Residential',
  Dedicated = 'Dedicated'
}

// Mapping between UI enum and actual ProxyType
const proxyTypeMapping: Record<ProxyTypeEnum, ProxyType> = {
  [ProxyTypeEnum.Mobile]: 'allorigins',
  [ProxyTypeEnum.Residential]: 'corsproxy',
  [ProxyTypeEnum.Dedicated]: 'cors-anywhere'
};

export const ProxyTester = () => {
  const [proxyType, setProxyType] = useState<ProxyTypeEnum>(ProxyTypeEnum.Mobile);
  const [proxyUrl, setProxyUrl] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleProxyTypeChange = (type: ProxyTypeEnum) => {
    setProxyType(type);
  };

  const handleTestProxy = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Convert UI enum to actual ProxyType
      const proxyTypeValue = proxyTypeMapping[proxyType]; 
      const proxyConfig: ProxyConfig = { proxy_type: proxyTypeValue };
      
      const proxyUrlResult = buildProxyUrl('https://api.example.com/test', proxyConfig);
      setProxyUrl(proxyUrlResult.url);

      const response = await fetch(proxyUrlResult.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult(result);

      if (response.ok) {
        toast.success('Proxy test successful!');
      } else {
        toast.error(`Proxy test failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Proxy test error:', error);
      toast.error(`Proxy test error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Proxy Tester</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="proxyType">Proxy Type</Label>
              <Select value={proxyType} onValueChange={handleProxyTypeChange}>
                <SelectTrigger id="proxyType">
                  <SelectValue placeholder="Select Proxy Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProxyTypeEnum.Mobile}>Mobile</SelectItem>
                  <SelectItem value={ProxyTypeEnum.Residential}>Residential</SelectItem>
                  <SelectItem value={ProxyTypeEnum.Dedicated}>Dedicated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTestProxy} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Proxy'
              )}
            </Button>

            {proxyUrl && (
              <div>
                <Label>Proxy URL</Label>
                <Input type="text" value={proxyUrl} readOnly />
              </div>
            )}

            {testResult && (
              <div>
                <Label>Test Result</Label>
                <Textarea value={JSON.stringify(testResult, null, 2)} readOnly className="min-h-[100px]" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProxyTester;
