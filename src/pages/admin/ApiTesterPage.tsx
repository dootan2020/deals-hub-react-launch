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
import { Loader2, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildProxyUrl, getRequestHeaders, ProxyType } from '@/utils/proxyUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu cho phản hồi API
type ApiResponse = {
  success: string;
  name: string;
  price: string;
  stock: string;
  description?: string;
};

// Dữ liệu mẫu cho các kioskToken khác nhau
const mockData: Record<string, ApiResponse> = {
  "IEB8KZ8SAJQ5616W2M21": {
    success: "true",
    name: "Gmail USA 2023-2024",
    price: "16000",
    stock: "4003",
    description: "Gmail USA với domain @gmail.com, tạo 2023-2024"
  },
  "WK76IVBVK3X0WW9DKZ4R": {
    success: "true",
    name: "Netflix Premium 4K",
    price: "35000",
    stock: "720",
    description: "Netflix Premium 4K Ultra HD, xem được trên 4 thiết bị cùng lúc"
  },
  "DUP32BXSLWAP4847J84B": {
    success: "true",
    name: "V1 INSTAGRAM QUA 282, NO INFO, NO LOGIN IP, TẠO > 10-30 NGÀY",
    price: "3500",
    stock: "8090",
    description: "Tài khoản Instagram đã qua 282, không yêu cầu login IP, tuổi 10-30 ngày"
  }
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
  const [isMockData, setIsMockData] = useState<boolean>(false);

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

  // Hàm lấy dữ liệu mẫu dựa trên kioskToken
  const getMockResponse = (token: string): ApiResponse => {
    // Nếu có dữ liệu sẵn cho kioskToken, trả về
    if (mockData[token]) {
      return mockData[token];
    }
    
    // Nếu không, trả về dữ liệu mẫu mặc định
    return {
      success: "true",
      name: "Gmail USA 2023-2024",
      price: "16000",
      stock: "4003",
      description: "Dữ liệu mẫu được sử dụng do gặp vấn đề CORS hoặc API"
    };
  };

  const handleApiTest = async () => {
    if (!kioskToken || !userToken) {
      setError('Vui lòng nhập cả Kiosk Token và User Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setRawResponse('');
    setIsMockData(false);
    
    try {
      const encodedKioskToken = encodeURIComponent(kioskToken);
      const encodedUserToken = encodeURIComponent(userToken);
      
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${encodedKioskToken}&userToken=${encodedUserToken}`;
      
      const { url: proxyUrl, description } = buildProxyUrl(apiUrl, { type: selectedProxy });
      console.log('Using proxy:', description);

      const headers = getRequestHeaders();
      
      // Thiết lập tùy chọn fetch
      const fetchOptions: RequestInit = {
        headers,
        cache: 'no-store',
        // Xóa mode: 'cors' vì một số proxy không hỗ trợ
      };

      // Thiết lập timeout để tránh treo khi yêu cầu thất bại
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      fetchOptions.signal = controller.signal;
      
      try {
        const response = await fetch(proxyUrl, fetchOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        // Kiểm tra nếu phản hồi là HTML
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          console.log('API response is HTML, using mock data');
          const mockResponse = getMockResponse(kioskToken);
          setApiResponse(mockResponse);
          setRawResponse(JSON.stringify(mockResponse, null, 2));
          setIsMockData(true);
          toast.warning('Sử dụng dữ liệu mẫu do API trả về HTML thay vì JSON');
        } else {
          // Xử lý phản hồi dựa trên loại proxy
          let parsedResponse: ApiResponse | null = null;
          
          if (selectedProxy === 'allorigins' && responseText.includes('"contents"')) {
            try {
              const allOriginsData = JSON.parse(responseText);
              if (allOriginsData && allOriginsData.contents) {
                // Kiểm tra nếu contents là HTML
                if (allOriginsData.contents.includes('<!DOCTYPE') || allOriginsData.contents.includes('<html')) {
                  console.log('AllOrigins content is HTML, using mock data');
                  parsedResponse = getMockResponse(kioskToken);
                  setIsMockData(true);
                  toast.warning('Sử dụng dữ liệu mẫu do API trả về HTML thay vì JSON');
                } else {
                  try {
                    parsedResponse = JSON.parse(allOriginsData.contents);
                  } catch (error) {
                    console.error('Error parsing AllOrigins contents:', error);
                    parsedResponse = getMockResponse(kioskToken);
                    setIsMockData(true);
                    toast.warning('Sử dụng dữ liệu mẫu do lỗi phân tích JSON');
                  }
                }
              }
            } catch (error) {
              console.error('Error parsing AllOrigins response:', error);
              parsedResponse = getMockResponse(kioskToken);
              setIsMockData(true);
              toast.warning('Sử dụng dữ liệu mẫu do lỗi phân tích phản hồi');
            }
          } else {
            try {
              parsedResponse = JSON.parse(responseText);
            } catch (error) {
              console.error('Error parsing JSON:', error);
              parsedResponse = getMockResponse(kioskToken);
              setIsMockData(true);
              toast.warning('Sử dụng dữ liệu mẫu do lỗi định dạng JSON');
            }
          }
          
          if (parsedResponse) {
            setApiResponse(parsedResponse);
            setRawResponse(JSON.stringify(parsedResponse, null, 2));
          }
        }
      } catch (fetchError: any) {
        console.error('Fetch error:', fetchError);
        
        // Sử dụng dữ liệu mẫu khi fetch thất bại
        const mockResponse = getMockResponse(kioskToken);
        setApiResponse(mockResponse);
        setRawResponse(JSON.stringify(mockResponse, null, 2));
        setIsMockData(true);
        
        if (fetchError.name === 'AbortError') {
          toast.error('Yêu cầu API đã hết thời gian, sử dụng dữ liệu mẫu thay thế');
        } else {
          toast.warning('Sử dụng dữ liệu mẫu do lỗi kết nối API');
        }
      }
      
      // Cập nhật thời gian
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      );
      
    } catch (error: any) {
      console.error('API test error:', error);
      setError(`Lỗi: ${error.message || 'Không thể kết nối đến API'}`);
      
      // Sử dụng dữ liệu mẫu khi API thất bại
      const mockResponse = getMockResponse(kioskToken);
      setApiResponse(mockResponse);
      setRawResponse(JSON.stringify(mockResponse, null, 2));
      setIsMockData(true);
      toast.warning('Sử dụng dữ liệu mẫu do lỗi kết nối API');
      
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
      );
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
      
      <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Nếu API trả về lỗi hoặc HTML thay vì JSON, hệ thống sẽ tự động hiển thị dữ liệu mẫu.
          Thử các CORS proxy khác nhau để xem kết quả tốt nhất.
        </AlertDescription>  
      </Alert>
      
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
              placeholder="Nhập Kiosk Token (ví dụ: DUP32BXSLWAP4847J84B)"
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
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <RefreshCw className="mr-2 h-4 w-4" />}
              Kiểm Tra API
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {isMockData && apiResponse && (
          <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              Hiển thị dữ liệu mẫu do API trả về HTML hoặc gặp lỗi CORS
            </AlertDescription>
          </Alert>
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
