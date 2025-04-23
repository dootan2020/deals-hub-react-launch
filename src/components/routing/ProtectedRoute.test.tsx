
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { UserRole, AuthContextType } from '@/types/index';

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

// Mock for AuthContext
const mockAuthContext: AuthContextType = {
  user: { id: 'test-user' },
  session: {},
  loading: false,
  isAuthenticated: true,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  refreshUserBalance: vi.fn().mockResolvedValue(0),
  refreshBalance: vi.fn().mockResolvedValue(0), // Backward compatibility
  refreshUserProfile: vi.fn().mockResolvedValue(undefined),
  login: vi.fn().mockResolvedValue({}), // Add mock login function
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue({}),
  checkUserRole: vi.fn(),
  isEmailVerified: true,
  isLoadingBalance: false,
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', () => {
    // Set up the mock to return unauthenticated state
    vi.mocked(useAuth).mockReturnValue({
      ...mockAuthContext,
      isAuthenticated: false, 
      loading: false,
      user: null,
      session: null,
      userRoles: [],
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
      ...mockAuthContext,
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => false),
      user: { id: '1', email: 'test@example.com' } as any,
      userRoles: [UserRole.User],
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
      ...mockAuthContext,
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => true),
      user: { id: '1', email: 'admin@example.com' } as any,
      userRoles: [UserRole.Admin],
      isAdmin: true,
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

  // Remove the isPublic test since that prop doesn't exist
});
