
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

// Create complete mock for AuthContext with all required properties
const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  session: null,
  loading: false,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  balance: null,
  balanceLoading: false,
  isLoadingBalance: false,
  fetchBalance: vi.fn().mockResolvedValue(0),
  setUserBalance: vi.fn(),
  fetchUserBalance: vi.fn().mockResolvedValue(0),
  refreshUserBalance: vi.fn().mockResolvedValue(0),
  refreshBalance: vi.fn().mockResolvedValue(0),
  refreshUserProfile: vi.fn().mockResolvedValue(undefined),
  refreshUserData: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue({}),
  checkUserRole: vi.fn(),
  isEmailVerified: true,
  resendVerificationEmail: vi.fn().mockResolvedValue(true),
  authError: null,
  ...overrides
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when user is not authenticated', () => {
    // Set up the mock to return unauthenticated state
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      isAuthenticated: false, 
      loading: false,
      user: null,
      session: null,
      userRoles: [],
      balance: null,
    }));

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
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => false),
      user: { id: '1', email: 'test@example.com' } as any,
      userRoles: [UserRole.User],
    }));

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
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext({
      isAuthenticated: true, 
      loading: false,
      checkUserRole: vi.fn(() => true),
      user: { id: '1', email: 'admin@example.com' } as any,
      userRoles: [UserRole.Admin],
      isAdmin: true,
    }));

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
