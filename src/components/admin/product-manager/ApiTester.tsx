import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProxyConfig, fetchViaProxyWithFallback } from '@/utils/proxyUtils';
import { isHtmlResponse, extractFromHtml, normalizeProductInfo } from '@/utils/apiUtils';
import { ApiResponse } from '@/types';

interface ApiTesterProps {
  onSelectResult?: (result: ApiResponse) => void;
  initialUrl?: string;
}

export const ApiTester: React.FC<ApiTesterProps> = ({ 
  onSelectResult, 
  initialUrl = ''
}) => {
  const [apiUrl, setApiUrl] = useState(initialUrl);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiUrl(e.target.value);
  };

const handleTestApi = async () => {
  if (!apiUrl) {
    toast.error("Please enter API URL");
    return;
  }

  setIsLoading(true);
  setApiResponse(null);

  try {
    const config: ProxyConfig = { proxy_type: 'allorigins' };
    
    const result = await fetchViaProxyWithFallback(apiUrl, config);
    
    let normalizedData: ApiResponse;

    if (typeof result === 'string' && isHtmlResponse(result)) {
      normalizedData = extractFromHtml(result);
    } else {
      normalizedData = normalizeProductInfo(result);
    }

    setApiResponse(normalizedData);
    setJsonResult(normalizedData);
    
    if (normalizedData.success === 'true') {
      toast.success("API test successful!");
    } else {
      toast.error(`API test error: ${normalizedData.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.error('API test error:', error);
    setApiResponse({ success: 'false', error: error.message });
    toast.error(`API test error: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleSelectResult = () => {
    if (apiResponse && onSelectResult) {
      onSelectResult(apiResponse);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="apiUrl">API URL</Label>
            <Input
              type="text"
              id="apiUrl"
              value={apiUrl}
              onChange={handleApiUrlChange}
            />
          </div>
          <Button onClick={handleTestApi} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API'
            )}
          </Button>

          {apiResponse && (
            <div>
              <Label>API Response</Label>
              <Textarea value={JSON.stringify(apiResponse, null, 2)} readOnly className="min-h-[100px]" />
            </div>
          )}

          {jsonResult && (
            <div>
              <Label>Normalized Result</Label>
              <Textarea value={JSON.stringify(jsonResult, null, 2)} readOnly className="min-h-[100px]" />
            </div>
          )}

          {apiResponse && onSelectResult && (
            <Button onClick={handleSelectResult} variant="secondary">
              Select Result
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
