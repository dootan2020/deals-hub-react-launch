
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';

const SiteSettingsPage = () => {
  const [rate, setRate] = useState<string>('24000');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: currencySettings, isLoading: isLoadingSettings } = useCurrencySettings();

  // Load current settings on component mount
  useEffect(() => {
    if (currencySettings && !isLoadingSettings) {
      setRate(currencySettings.vnd_per_usd.toString());
    }
  }, [currencySettings, isLoadingSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const numericRate = parseFloat(rate.replace(/,/g, ''));
      
      if (isNaN(numericRate) || numericRate <= 0) {
        throw new Error('Tỉ giá không hợp lệ');
      }

      const { error } = await supabase
        .from('site_settings')
        .update({
          value: { vnd_per_usd: numericRate }
        })
        .eq('key', 'usd_rate');

      if (error) throw error;

      // Invalidate the currency settings cache
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'usd-rate'] });
      toast.success('Đã cập nhật tỉ giá thành công');
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      toast.error('Không thể cập nhật tỉ giá');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Cài đặt hệ thống">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tiền tệ</CardTitle>
          <CardDescription>
            Điều chỉnh tỉ giá quy đổi từ VND sang USD cho hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tỉ giá VND/USD
              </label>
              <Input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Nhập tỉ giá VND/USD"
              />
              <p className="text-sm text-muted-foreground">
                1 USD = ? VND (Ví dụ: 24000)
              </p>
            </div>
            <Button type="submit" disabled={isLoading || isLoadingSettings}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật tỉ giá'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default SiteSettingsPage;
