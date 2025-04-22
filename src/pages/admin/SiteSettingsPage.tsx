
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/layout/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';

const allowedModels = [
  { value: "gpt-3.5-turbo", title: "GPT-3.5 Turbo (Nhanh, rẻ - đề xuất)", description: "Chi phí thấp, trả lời nhanh" },
  { value: "gpt-4-1106-preview", title: "GPT-4-1106-Preview", description: "Trí tuệ cao hơn, chi phí cao hơn" },
  { value: "gpt-4-turbo", title: "GPT-4 Turbo", description: "GPT-4 bản tiết kiệm tài nguyên" },
  { value: "claude-2", title: "Claude 2 (Anthropic)", description: "Sử dụng Claude nếu doanh nghiệp có API key" },
];

const SiteSettingsPage = () => {
  const [rate, setRate] = useState<string>('24000');
  const [aiModel, setAiModel] = useState<string>('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: currencySettings, isLoading: isLoadingSettings } = useCurrencySettings();

  // Load current settings on component mount
  useEffect(() => {
    if (currencySettings && !isLoadingSettings) {
      setRate(currencySettings.vnd_per_usd.toString());
    }
    // Lấy model AI
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ai_model')
      .single()
      .then(({ data, error }) => {
        if (data?.value && typeof data.value === 'object' && 'ai_model' in data.value) {
          setAiModel(data.value.ai_model as string);
        }
      });
  }, [currencySettings, isLoadingSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const numericRate = parseFloat(rate.replace(/,/g, ''));
      
      if (isNaN(numericRate) || numericRate <= 0) {
        throw new Error('Tỉ giá không hợp lệ');
      }

      // Cập nhật cả tỉ giá và model AI
      // tỉ giá: key = usd_rate; model: key = ai_model
      const { error: rateError } = await supabase
        .from('site_settings')
        .update({
          value: { vnd_per_usd: numericRate }
        })
        .eq('key', 'usd_rate');
      
      let modelError = null;
      // update hoặc insert nếu chưa có
      const { error: existErr, data: modelSetting } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'ai_model')
        .single();

      if (!existErr && modelSetting) {
        // update
        const { error } = await supabase
          .from('site_settings')
          .update({ value: { ai_model: aiModel } })
          .eq('key', 'ai_model');
        modelError = error;
      } else {
        // insert mới
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'ai_model', value: { ai_model: aiModel } }]);
        modelError = error;
      }

      if (rateError || modelError) throw rateError || modelError;

      // Invalidate cached settings
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'usd-rate'] });
      toast.success('Đã cập nhật cài đặt thành công');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Không thể cập nhật cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Cài đặt hệ thống">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tiền tệ &amp; AI</CardTitle>
          <CardDescription>
            Điều chỉnh tỉ giá quy đổi từ VND sang USD và chọn model AI xử lý hội thoại
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Model AI ChatBot (Acczen AI)
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                disabled={isLoading}
              >
                {allowedModels.map((m) => (
                  <option key={m.value} value={m.value}>{m.title}</option>
                ))}
              </select>
              <small className="block text-xs text-muted-foreground">
                {allowedModels.find((m) => m.value === aiModel)?.description || ""}
              </small>
            </div>

            <Button type="submit" disabled={isLoading || isLoadingSettings}>
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật cài đặt'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default SiteSettingsPage;
