
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Bell, Wifi, WifiOff, RefreshCw, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { isOrder, OrderData } from '@/utils/supabaseHelpers';

interface NotificationState {
  orders: OrderData[];
  connected: boolean;
  hasUnread: boolean;
}

export function RealtimeNotifier() {
  const [state, setState] = useState<NotificationState>({
    orders: [],
    connected: false,
    hasUnread: false
  });
  
  const { user } = useAuth();
  const isAdmin = false; // TODO: Replace with actual admin check from context
  
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to realtime updates for orders table
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('New order received:', payload);
          const newOrder = payload.new;
          
          if (isOrder(newOrder)) {
            // Only add to local state if it's for the current user or user is admin
            if (isAdmin || (user && newOrder.user_id === user.id)) {
              setState(prev => ({
                ...prev,
                orders: [newOrder, ...prev.orders].slice(0, 10),
                hasUnread: true
              }));
              
              // Show toast notification
              toast.success('New order received!');
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to realtime updates');
          setState(prev => ({
            ...prev,
            connected: true
          }));
        } else if (
          status === 'TIMED_OUT' || 
          status === 'CLOSED' || 
          status === 'CHANNEL_ERROR'
        ) {
          console.error('Failed to connect to realtime updates', status);
          setState(prev => ({
            ...prev,
            connected: false
          }));
        }
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);
  
  const markAsRead = () => {
    setState(prev => ({
      ...prev,
      hasUnread: false
    }));
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={markAsRead}
              className={cn(
                "transition-all relative",
                state.connected ? "" : "text-muted-foreground"
              )}
            >
              {state.connected ? (
                <>
                  <Bell className="h-5 w-5" />
                  {state.hasUnread && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500"
                    />
                  )}
                </>
              ) : (
                <RefreshCw className="h-5 w-5 animate-spin" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-sm">
            {state.connected ? (
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                <span>Realtime updates enabled</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3 text-amber-500" />
                <span>Connecting to realtime...</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Make sure to export this component as both a named export and default export
export default RealtimeNotifier;
