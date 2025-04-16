
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, RefreshCw, Globe, Code } from 'lucide-react';
import { ProxyType } from '@/utils/proxyUtils';
import { fetchActiveApiConfig } from '@/utils/apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, getRequestHeaders } from '@/utils/proxyUtils';

type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ApiTesterPage = () => {
  const [kioskToken, setKioskToken] = useState<string>('KH5ZB5QB8G1L7J7S4DGW');
  const [userToken, setUserToken] = useState<string>('');
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [responseType, setResponseType] = useState<'json' | 'html'>('json');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved user token from API config
    const loadUserToken = async () => {
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
        console.error('Error loading user token:', error);
      }
    };

    loadUserToken();
  }, []);

  const handleApiTest = async () => {
    if (!kioskToken || !userToken) {
      setError('Vui lòng nhập cả Kiosk Token và User Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    
    try {
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(userToken);
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}`;
      
      const { url: proxyUrl, description } = buildProxyUrl(apiUrl, { type: selectedProxy });
      console.log('Using proxy:', description);

      const timestamp = new Date().getTime();
      const headers = getRequestHeaders();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      const contentType = response.headers.get('Content-Type') || '';
      console.log(`Content-Type: ${contentType}`);
      
      const responseText = await response.text();
      setResponseType(contentType.includes('html') ? 'html' : 'json');
      
      let parsedResponse: ApiResponse | null = null;
      
      // Handle AllOrigins specific response format
      if (selectedProxy === 'allorigins' && responseText.includes('"contents"')) {
        try {
          const allOriginsData = JSON.parse(responseText);
          if (allOriginsData && allOriginsData.contents) {
            try {
              parsedResponse = JSON.parse(allOriginsData.contents);
              setRawResponse(JSON.stringify(parsedResponse, null, 2));
            } catch (error) {
              console.error('Error parsing AllOrigins contents:', error);
              setRawResponse(allOriginsData.contents);
              setError('Không thể phân tích nội dung JSON từ AllOrigins');
            }
          }
        } catch (error) {
          console.error('Error parsing AllOrigins response:', error);
          setRawResponse(responseText);
          setError('Không thể phân tích phản hồi từ AllOrigins');
        }
      } else {
        // Try to parse as JSON directly
        try {
          parsedResponse = JSON.parse(responseText);
          setRawResponse(JSON.stringify(parsedResponse, null, 2));
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          setRawResponse(responseText);
          setError('Phản hồi không phải định dạng JSON hợp lệ');
        }
      }
      
      if (parsedResponse) {
        setApiResponse(parsedResponse);
      }
      
      // Update last updated timestamp
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      );
      
    } catch (error: any) {
      console.error('API test error:', error);
      setError(`Lỗi: ${error.message || 'Không thể kết nối đến API'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Kiểm Tra API Taphoammo">
      <Card className="border-primary/20 bg-primary/5 mb-4">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-primary mb-1">Kiểm Tra API Taphoammo</h1>
          <p className="text-muted-foreground">
            Công cụ kiểm tra API với giải pháp khắc phục lỗi CORS
          </p>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="cors-proxy">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cors-proxy" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sử dụng CORS Proxy
          </TabsTrigger>
          <TabsTrigger value="desktop-code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Mã cho Máy Tính Cục Bộ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cors-proxy" className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Phương pháp sử dụng CORS Proxy</h2>
          <p className="text-muted-foreground mb-6">
            Sử dụng proxy công khai để vượt qua giới hạn CORS và gọi API từ trình duyệt.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="kioskToken" className="block text-sm font-medium mb-2">
                Kiosk Token
              </label>
              <Input 
                id="kioskToken"
                value={kioskToken}
                onChange={(e) => setKioskToken(e.target.value)}
                placeholder="Nhập Kiosk Token"
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="userToken" className="block text-sm font-medium mb-2">
                User Token
              </label>
              <Input 
                id="userToken"
                value={userToken}
                onChange={(e) => setUserToken(e.target.value)}
                placeholder="Nhập User Token"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-end mb-8">
            <div className="w-full md:w-1/3">
              <label htmlFor="corsProxy" className="block text-sm font-medium mb-2">
                CORS Proxy
              </label>
              <Select 
                value={selectedProxy} 
                onValueChange={(value) => setSelectedProxy(value as ProxyType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn proxy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allorigins">AllOrigins</SelectItem>
                  <SelectItem value="corsproxy">CORS Proxy</SelectItem>
                  <SelectItem value="cors-anywhere">CORS Anywhere</SelectItem>
                  <SelectItem value="direct">Direct API Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-auto">
              <Button 
                onClick={handleApiTest} 
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
                Kiểm Tra API
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {apiResponse && (
            <>
              <h3 className="text-lg font-medium mb-4">Kết Quả API</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Tên sản phẩm:</div>
                    <div className="font-medium text-green-700">{apiResponse.name}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Giá:</div>
                    <div className="font-medium text-blue-700">
                      {Number(apiResponse.price).toLocaleString()} VND
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground mb-1">Số lượng tồn kho:</div>
                    <div className="font-medium text-purple-700">{apiResponse.stock}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">JSON response:</div>
                <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto">
                  {rawResponse}
                </pre>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Cập nhật lần cuối: {lastUpdated}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="desktop-code" className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Mã cho Máy Tính Cục Bộ</h2>
          <p className="text-muted-foreground mb-6">
            Sử dụng mã này để kiểm tra API từ ứng dụng máy tính hoặc Node.js.
          </p>
          
          <div className="mb-6">
            <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto text-sm">
{`// JavaScript - Node.js
const https = require('https');

const kioskToken = "${kioskToken}";
const userToken = "${userToken}";

const url = \`https://taphoammo.net/api/getStock?kioskToken=\${encodeURIComponent(kioskToken)}&userToken=\${encodeURIComponent(userToken)}\`;

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('API Response:', parsedData);
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
  
}).on('error', (err) => {
  console.error('Error making request:', err);
});`}
            </pre>
          </div>
          
          <div className="mb-6">
            <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto text-sm">
{`// PHP
<?php
$kioskToken = "${kioskToken}";
$userToken = "${userToken}";

$url = "https://taphoammo.net/api/getStock?kioskToken=" . urlencode($kioskToken) . "&userToken=" . urlencode($userToken);

$options = [
    'http' => [
        'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\\r\\n"
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    echo "Error fetching API";
} else {
    $data = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "Product: " . $data["name"] . "\\n";
        echo "Price: " . $data["price"] . " VND\\n";
        echo "Stock: " . $data["stock"] . "\\n";
    } else {
        echo "Error parsing JSON response";
        echo "Raw response: " . $response;
    }
}
?>`}
            </pre>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Lưu ý: Công cụ này chỉ dùng cho mục đích kiểm tra API, không lưu trữ hoặc chia sẻ thông tin token.
          </p>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Công cụ kiểm tra API Taphoammo</p>
        <p className="mt-1">Lưu ý: Công cụ này chỉ dùng cho mục đích kiểm tra API, không lưu trữ hoặc chia sẻ thông tin token.</p>
      </div>
    </AdminLayout>
  );
};

export default ApiTesterPage;
