
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { AccessControl } from '@/components/auth/AccessControl';

export default function DashboardPage() {
  const { isAuthenticated, userRoles, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            
            {/* Display admin access if available */}
            <AccessControl allowedFor={[UserRole.Admin]}>
              <Button variant="outline" asChild>
                <a href="/admin">Access Admin Panel</a>
              </Button>
            </AccessControl>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>User ID:</strong> {user?.id}</p>
                  <p><strong>Roles:</strong> {userRoles.join(', ') || 'No special roles'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View your recent activity and orders here.</p>
                <div className="mt-4 space-x-2">
                  <Button variant="outline" asChild>
                    <a href="/orders">View Orders</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/deposits">View Deposits</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
