
# Auth Module Documentation

## Overview

The Auth Module provides authentication and authorization functionality for Digital Deals Hub. It's built on top of Supabase Auth with additional features like session monitoring, token refresh, and offline detection.

## Core Components

### AuthContext

The main provider that manages authentication state and exposes auth functionality to the application.

```typescript
const { user, isAuthenticated, login, logout, register } = useAuth();
```

### Available Hooks

1. `useAuthTokens`
   - Manages JWT tokens and refresh logic
   - Handles automatic token refresh before expiration
   - Provides token cleanup on logout

2. `useUserProfile`
   - Manages user profile data and caching
   - Handles profile updates and synchronization
   - Provides role-based access control helpers

3. `useSessionMonitoring`
   - Monitors online/offline status
   - Handles session timeout detection
   - Manages token refresh scheduling

4. `useAuthActions`
   - Provides authentication actions (login, logout, register)
   - Handles form validation and error management
   - Manages authentication flow

## Authentication Flow

1. User attempts login/register
2. On success:
   - Tokens are stored and managed by useAuthTokens
   - User profile is fetched and cached
   - Session monitoring begins
3. During session:
   - Tokens are refreshed proactively (5 minutes before expiration)
   - Online/offline status is monitored
   - Profile data is kept in sync
4. On logout:
   - Tokens are cleared
   - Profile cache is invalidated
   - Session monitoring stops

## Usage Examples

### Protected Route
```tsx
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};
```

### Role-Based Access
```tsx
const AdminOnly = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) return <AccessDenied />;
  
  return children;
};
```

## Error Handling

The module includes comprehensive error handling:
- Network errors during authentication
- Invalid credentials
- Session timeout
- Token refresh failures
- Offline status

Errors are propagated through the AuthErrorBoundary and displayed using toast notifications.

## Performance Considerations

- Context is split to prevent unnecessary rerenders
- Memoization is used for expensive computations
- Token refresh is scheduled efficiently
- Profile data is cached with TTL
