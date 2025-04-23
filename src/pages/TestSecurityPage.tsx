
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth.types';
import AccessControl from '@/components/auth/AccessControl';

const TestSecurityPage = () => {
  const { isAuthenticated, isAdmin, userRoles, user, checkUserRole } = useAuth();

  return (
    <Layout title="Security Testing">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">Security & Access Control Testing</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Authentication Status */}
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Is Authenticated:</span>
                <span className={isAuthenticated ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {isAuthenticated ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>User ID:</span>
                <span className="font-mono text-sm">{user?.id || "Not logged in"}</span>
              </div>
              
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Email:</span>
                <span>{user?.email || "Not available"}</span>
              </div>
            </div>
          </Card>

          {/* User Roles */}
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Roles</h2>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Is Admin:</span>
                <span className={isAdmin ? "text-green-600 font-medium" : "text-gray-600 font-medium"}>
                  {isAdmin ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="p-2 bg-gray-50 rounded">
                <div className="mb-1">Assigned Roles:</div>
                {userRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role) => (
                      <span key={role} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No roles assigned</span>
                )}
              </div>
            </div>
          </Card>
          
          {/* Role-Based UI Testing */}
          <Card className="p-6 shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Role-Based UI Testing</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Admin-Only Content</h3>
                <div className="p-4 border rounded bg-gray-50">
                  <AccessControl requiredRoles={[UserRole.Admin]} fallback={
                    <div className="text-red-500">This content is hidden because you're not an admin</div>
                  }>
                    <div className="text-green-500">This content is visible because you're an admin</div>
                  </AccessControl>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Authenticated-Only Content</h3>
                <div className="p-4 border rounded bg-gray-50">
                  <AccessControl
                    requiredRoles={[]} 
                    fallback={<div className="text-red-500">This content is hidden because you're not logged in</div>}
                  >
                    <div className="text-green-500">This content is visible because you're authenticated</div>
                  </AccessControl>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Route Testing */}
          <Card className="p-6 shadow-md md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Route Access Testing</h2>
            <p className="mb-4 text-gray-600">
              Click these links to test if route protection is working correctly. You should only be able to access admin routes if you have the admin role.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium">Public Routes</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/">Home</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/products">Products</Link>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Protected Routes</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/deposit">Deposit</Link>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Admin Routes</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin">Admin Dashboard</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/products">Admin Products</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/admin/orders">Admin Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TestSecurityPage;
