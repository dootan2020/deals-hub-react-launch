
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from '@supabase/supabase-js';
import { User as UserIcon, Mail } from 'lucide-react';

interface AccountProfileProps {
  user: User;
}

const AccountProfile = ({ user }: AccountProfileProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Profile</CardTitle>
        <CardDescription>View and manage your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 border-b pb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-lg">{user.user_metadata?.display_name || user.email?.split('@')[0]}</p>
              <p className="text-sm text-muted-foreground">Account ID: {user.id.slice(0, 8)}...</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Email Address:</span>
              <span className="ml-2">{user.email}</span>
            </div>
            
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Account Created:</span>
              <span className="ml-2">
                {user.created_at 
                  ? new Date(user.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountProfile;
