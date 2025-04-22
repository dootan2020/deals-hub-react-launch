
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Info, AlertCircle } from 'lucide-react';

type NotificationType = 
  'error' | 
  'welcome' | 
  'notification' | 
  'warning' | 
  'success' | 
  'systemAlert' |
  'lowStockAlert' |
  'outOfStockAlert' |
  'syncError' |
  'payment_successful' |
  'payment_failed' |
  'deposit_completed' |
  'deposit_failed' |
  'connection_change';

export function RealtimeNotifier() {
  const { user, userRoles } = useAuth();
  const [ready, setReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  useEffect(() => {
    if (!user) return;
    
    // Add a small delay to ensure auth context is fully loaded
    const timer = setTimeout(() => setReady(true), 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!ready || !user) return;
    
    // Handle connection status changes
    const handleConnectionChange = (status: 'CONNECTED' | 'DISCONNECTED') => {
      if (status === 'DISCONNECTED' && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
        toast.error("Connection lost", {
          description: "You've been disconnected from the server. Reconnecting..."
        });
      } else if (status === 'CONNECTED' && connectionStatus === 'disconnected') {
        setConnectionStatus('connected');
        toast.success("Connection restored", {
          description: "You're now reconnected to the server."
        });
      }
    };

    // Setup notification channel
    const notificationChannel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Process notification
          const notification = payload.new;
          
          // Skip admin notifications if user is not admin
          if (notification.admin_only && (!userRoles || !userRoles.includes('admin'))) {
            return;
          }
          
          // Display notification
          if (notification.type && notification.message) {
            showNotification(
              notification.type as NotificationType, 
              notification.message,
              notification.description
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to notifications channel');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to notifications channel');
          toast.error("Notification system error", {
            description: "Unable to connect to real-time notification system."
          });
        }
        
        // Handle connection status
        if (status === 'CONNECTED' || status === 'SUBSCRIBED') {
          handleConnectionChange('CONNECTED');
        } else if (status === 'DISCONNECTED' || status === 'CHANNEL_ERROR') {
          handleConnectionChange('DISCONNECTED');
        }
      });

    // Clean up on component unmount
    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [ready, user, userRoles, connectionStatus]);

  // Function to display notification
  const showNotification = (
    type: NotificationType, 
    message: string, 
    description?: string
  ) => {
    const options: any = {};
    
    if (description) {
      options.description = description;
    }
    
    switch (type) {
      case 'error':
        toast.error(message, options);
        break;
      case 'success':
        toast.success(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      case 'notification':
        toast(message, options);
        break;
      case 'systemAlert':
        toast.error(message, {
          ...options,
          icon: <AlertCircle className="h-5 w-5" />
        });
        break;
      case 'payment_successful':
      case 'deposit_completed':
        toast.success(message, {
          ...options,
          duration: 6000
        });
        break;
      case 'payment_failed':
      case 'deposit_failed':
        toast.error(message, {
          ...options,
          duration: 6000
        });
        break;
      case 'welcome':
        toast(message, {
          ...options,
          icon: <Info className="h-5 w-5 text-blue-500" />
        });
        break;
      case 'connection_change':
        if (message.includes('lost')) {
          toast.error(message, options);
        } else {
          toast.success(message, options);
        }
        break;
      default:
        toast(message, options);
    }
  };

  return null; // Component doesn't render anything visible
}

export default RealtimeNotifier;
