
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
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
import { Loader2, RefreshCw } from 'lucide-react';
import { fetchActiveApiConfig } from '@/utils/apiUtils';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, getRequestHeaders, ProxyType } from '@/utils/proxyUtils';

type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

const ApiTesterPage = () => {
  const [kioskToken, setKioskToken] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('allorigins');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApiConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('api_configs')
          .select('user_token, kiosk_token')
          .eq('is_active', true)
          .single();
          
        if (data) {
          setUserToken(data.user_token || '');
          setKioskToken(data.kiosk_token || '');
        }
      } catch (error) {
        console.error('Error loading API config:', error);
      }
    };

    loadApiConfig();
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

      const headers = getRequestHeaders();
      
      const response = await fetch(proxyUrl, { 
        headers,
        cache: 'no-store'
      });
      
      const responseText = await response.text();
      
      let parsedResponse: ApiResponse | null = null;
      
      if (selectedProxy === 'allorigins' && responseText.includes('"contents"')) {
        try {
          const allOriginsData = JSON.parse(responseText);
          if (allOriginsData && allOriginsData.contents) {
            parsedResponse = JSON.parse(allOriginsData.contents);
            setRawResponse(JSON.stringify(parsedResponse, null, 2));
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          setError('Không thể phân tích phản hồi');
        }
      } else {
        try {
          parsedResponse = JSON.parse(responseText);
          setRawResponse(JSON.stringify(parsedResponse, null, 2));
        } catch (error) {
          console.error('Error parsing JSON:', error);
          setError('Phản hồi không phải định dạng JSON hợp lệ');
        }
      }
      
      if (parsedResponse) {
        setApiResponse(parsedResponse);
      }
      
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
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <div className="flex flex-col md:flex-row gap-4 items-end">
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
          
          <div>
            <Button 
              onClick={handleApiTest} 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
              Kiểm Tra API
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-md">
            {error}
          </div>
        )}
        
        {apiResponse && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">JSON response:</div>
                <pre className="bg-gray-50 p-4 rounded-md border overflow-x-auto text-xs">
                  {rawResponse}
                </pre>
              </CardContent>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              Cập nhật lần cuối: {lastUpdated}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Công cụ kiểm tra API Taphoammo</p>
        <p className="mt-1">Lưu ý: Công cụ này chỉ dùng cho mục đích kiểm tra API, không lưu trữ hoặc chia sẻ thông tin token.</p>
      </div>
    </AdminLayout>
  );
};

export default ApiTesterPage;

