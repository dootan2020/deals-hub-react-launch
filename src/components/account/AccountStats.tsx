
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { Wallet, ShoppingBag, Clock, User, Loader2 } from "lucide-react";

interface AccountStatsProps {
  balance: number;
  totalDeposited: number;
  totalOrders: number;
  lastLoginAt: Date | null;
  isLoadingBalance?: boolean;
}

const AccountStats = ({ balance, totalDeposited, totalOrders, lastLoginAt, isLoadingBalance }: AccountStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            {isLoadingBalance ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                <span className="text-2xl font-bold">Loading...</span>
              </div>
            ) : (
              <h3 className="text-2xl font-bold">{formatCurrency(balance)}</h3>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Deposited</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalDeposited)}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <h3 className="text-2xl font-bold">{totalOrders}</h3>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Login</p>
            <h3 className="text-sm font-medium">
              {lastLoginAt 
                ? lastLoginAt.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : 'N/A'}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountStats;
