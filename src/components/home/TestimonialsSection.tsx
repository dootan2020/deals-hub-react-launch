
import React from 'react';

const testimonials = [
  {
    name: 'Nguyễn Văn A',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'Marketer',
    content: 'Tôi đã mua tài khoản Gmail và Facebook từ AccZen.net. Sản phẩm chất lượng, giao hàng nhanh và dịch vụ hỗ trợ rất tốt.',
    rating: 5
  },
  {
    name: 'Trần Thị B',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'Nhà phát triển',
    content: 'Đã mua nhiều công cụ AI từ trang này và rất hài lòng. Giá tốt và sản phẩm hoạt động đúng như mô tả. Sẽ quay lại mua tiếp.',
    rating: 5
  },
  {
    name: 'Lê Văn C',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    role: 'Chuyên viên SEO',
    content: 'Tài khoản Gmail mua từ AccZen hoạt động rất tốt, đã xác thực đúng như mô tả và chưa gặp vấn đề gì sau 3 tháng sử dụng.',
    rating: 4
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi?</h2>
          <p className="text-text-light max-w-2xl mx-auto">
            Trải nghiệm mua sắm thực tế từ các khách hàng đã sử dụng sản phẩm của AccZen.net
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-text-light text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <p className="text-text-light mb-4">
                "{testimonial.content}"
              </p>
              
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
