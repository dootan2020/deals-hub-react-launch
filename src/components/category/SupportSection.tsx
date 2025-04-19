
import React from 'react';
import { Button } from '@/components/ui/button';

export const SupportSection = () => {
  return (
    <div className="my-12 bg-primary/5 rounded-lg p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">Bạn cần hỗ trợ?</h2>
      <p className="text-text-light mb-6 max-w-lg mx-auto">
        Đội ngũ tư vấn của chúng tôi luôn sẵn sàng giúp bạn lựa chọn sản phẩm phù hợp nhất với nhu cầu của bạn.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <Button>
          Chat với tư vấn viên
        </Button>
        <Button variant="outline">
          Gọi hotline: 1900 1234
        </Button>
      </div>
    </div>
  );
};
