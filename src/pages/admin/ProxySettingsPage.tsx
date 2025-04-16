
import AdminLayout from '@/components/layout/AdminLayout';
import { CorsProxySelector } from '@/components/admin/CorsProxySelector';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProxySettingsPage = () => {
  return (
    <AdminLayout title="CORS Proxy Settings">
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-2">API Connection Settings</h2>
              <p className="text-muted-foreground">
                Configure which CORS proxy to use for fetching product information from TapHoaMMO. Different proxies may have varying reliability or rate limits.
              </p>
              <p className="text-muted-foreground mt-2 text-sm flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> 
                Select a proxy that returns JSON data consistently for your API calls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="text-amber-700">
          <p className="font-medium">Why use a CORS proxy?</p>
          <p className="mt-1">External APIs may not have CORS headers enabled, preventing direct browser access. Proxies help bypass these restrictions to fetch data from TapHoaMMO API.</p>
        </AlertDescription>  
      </Alert>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-1">
          <CorsProxySelector />
        </div>
        
        <div className="col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-3">About CORS Proxies</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium">AllOrigins</h4>
                  <p className="text-muted-foreground">A popular free proxy service. Response comes wrapped in a JSON object with the original content in the "contents" field.</p>
                </div>
                <div>
                  <h4 className="font-medium">CORS Proxy</h4>
                  <p className="text-muted-foreground">A simple proxy that adds CORS headers to responses. Returns the original response directly.</p>
                </div>
                <div>
                  <h4 className="font-medium">Direct API Call</h4>
                  <p className="text-muted-foreground">Attempts to make direct calls to the API without a proxy. May fail due to CORS restrictions.</p>
                </div>
                <div>
                  <h4 className="font-medium">Custom Proxy</h4>
                  <p className="text-muted-foreground">Specify your own proxy URL. Enter the full URL including where the target URL should be inserted.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProxySettingsPage;
