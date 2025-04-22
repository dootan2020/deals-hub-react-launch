
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  it("renders login form and submit button", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu|password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đăng nhập|login/i })).toBeInTheDocument();
  });

  it("shows error if submit empty", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /đăng nhập|login/i }));
    // Giả định validate hiển thị lỗi trên form, có thể tinh chỉnh nếu bạn dùng FormLib khác
    expect(await screen.findByText(/vui lòng/i)).toBeInTheDocument();
  });
});
