
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth.types';

// Mock the useAuth hook
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate hook from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', () => {
    // Set up the mock to return unauthenticated state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, 
      loading: false,
      checkUserRole: vi.fn(() => false),
      user: null,
      session: null,
      userRoles: [],
      userBalance: 0,
      refreshUserBalance: vi.fn(),
      refreshUserProfile: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAdmin: false,
      isStaff: false,
      isEmailVerified: false,
      resendVerificationEmail: vi.fn(),
      isLoadingBalance: false,
      refreshBalance: vi.fn(), // Added for backward compatibility
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Check if we're redirecting to login
    const navigate = screen.getByTestId('navigate');
    expect(navigate.getAttribute('data-to')).toBe('/login');
  });

  it('shows unauthorized page when user lacks required role', () => {
    // Set up the mock to return authenticated but without required role
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => false),
      user: { id: '1', email: 'test@example.com' } as any,
      session: {} as any,
      userRoles: [UserRole.User],
      userBalance: 0,
      refreshUserBalance: vi.fn(),
      refreshUserProfile: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAdmin: false,
      isStaff: false,
      isEmailVerified: true,
      resendVerificationEmail: vi.fn(),
      isLoadingBalance: false,
      refreshBalance: vi.fn(), // Added for backward compatibility
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={[UserRole.Admin]}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Check if we're redirecting to unauthorized
    const navigate = screen.getByTestId('navigate');
    expect(navigate.getAttribute('data-to')).toBe('/unauthorized');
  });

  it('renders protected content for authorized users', () => {
    // Set up the mock to return authenticated with required role
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => true),
      user: { id: '1', email: 'admin@example.com' } as any,
      session: {} as any,
      userRoles: [UserRole.Admin],
      userBalance: 0,
      refreshUserBalance: vi.fn(),
      refreshUserProfile: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAdmin: true,
      isStaff: false,
      isEmailVerified: true,
      resendVerificationEmail: vi.fn(),
      isLoadingBalance: false,
      refreshBalance: vi.fn(), // Added for backward compatibility
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRoles={[UserRole.Admin]}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Check if the protected content is rendered
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

// END FILE
