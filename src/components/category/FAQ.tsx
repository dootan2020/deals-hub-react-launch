
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  return (
    <div className="my-12 bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Câu hỏi thường gặp</h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Tôi có nhận được sản phẩm ngay sau khi mua hàng không?</AccordionTrigger>
          <AccordionContent>
            Có, sau khi thanh toán thành công, bạn sẽ nhận được thông tin truy cập sản phẩm ngay lập tức qua email. Hệ thống giao hàng của chúng tôi hoạt động tự động 24/7.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>Tôi có thể thanh toán bằng những phương thức nào?</AccordionTrigger>
          <AccordionContent>
            Hiện tại chúng tôi hỗ trợ thanh toán qua USDT, PayPal, và nhiều phương thức thanh toán phổ biến khác. Bạn có thể xem chi tiết trong quá trình thanh toán.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>Sản phẩm của bạn có bảo hành không?</AccordionTrigger>
          <AccordionContent>
            Chúng tôi cung cấp hỗ trợ kỹ thuật và đảm bảo sản phẩm hoạt động theo mô tả. Nếu có vấn đề, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger>Làm thế nào để liên hệ với bộ phận hỗ trợ?</AccordionTrigger>
          <AccordionContent>
            Bạn có thể liên hệ với đội ngũ hỗ trợ qua email support@digitaldealshub.com hoặc qua chat trực tiếp trên website của chúng tôi. Thời gian phản hồi thông thường là trong vòng 24 giờ.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
