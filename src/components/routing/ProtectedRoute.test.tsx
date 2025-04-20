
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthContext } from '@/context/AuthContext';

describe('ProtectedRoute', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  it('redirects to login when user is not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider 
          value={{ 
            isAuthenticated: false, 
            loading: false,
            checkUserRole: () => false
          }}
        >
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows unauthorized page when user lacks required role', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider 
          value={{ 
            isAuthenticated: true, 
            loading: false,
            checkUserRole: () => false
          }}
        >
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });

  it('renders protected content for authorized users', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider 
          value={{ 
            isAuthenticated: true, 
            loading: false,
            checkUserRole: () => true
          }}
        >
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
