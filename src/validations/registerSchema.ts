
import { z } from 'zod';

// Enhanced password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

export const registerSchema = z.object({
  displayName: z.string().min(2, 'Tên hiển thị phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(
      passwordRegex,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmPassword: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách Bảo mật"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
