
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "@/context/AuthContext";
import { describe, it, vi, expect, beforeEach } from 'vitest';

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to unauthorized if user not admin", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      userRoles: ["user"],
      isAdmin: false,
      // ... stub các hàm khác nếu được gọi
    } as any);

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
    // Nếu route dùng <ProtectedRoute>, kiểm tra phản hồi Unauthorized
    expect(
      screen.queryByText(/quyền truy cập bị từ chối|unauthorized|không có quyền/i)
    ).toBeInTheDocument();
  });
});
