import { toast } from "sonner";

export type AuthEvent = {
  type: 'session_check' | 'login' | 'logout' | 'refresh' | 'error';
  timestamp: number;
  metadata?: Record<string, any>;
};

const authLogs: AuthEvent[] = [];
let sessionChecks = 0;
let isDebugMode = process.env.NODE_ENV === 'development';

export const authMonitoring = {
  logEvent(event: Omit<AuthEvent, 'timestamp'>) {
    const logEntry: AuthEvent = {
      ...event,
      timestamp: Date.now()
    };
    
    authLogs.push(logEntry);
    
    if (isDebugMode) {
      console.log(`[Auth Event] ${event.type}:`, event.metadata || {});
    }
    
    // Keep only last 100 events
    if (authLogs.length > 100) {
      authLogs.shift();
    }
  },

  incrementSessionChecks() {
    sessionChecks++;
    if (isDebugMode) {
      console.log(`[Auth] Session check count: ${sessionChecks}`);
    }
  },

  getSessionChecksCount() {
    return sessionChecks;
  },

  getRecentLogs() {
    return [...authLogs];
  },

  clearLogs() {
    authLogs.length = 0;
    sessionChecks = 0;
  },

  setDebugMode(enabled: boolean) {
    isDebugMode = enabled;
  },

  notifyAuthIssue(title: string, description?: string) {
    toast.error(title, {
      description,
      duration: 5000,
    });
    
    this.logEvent({
      type: 'error',
      metadata: { title, description }
    });
  }
};

export const useAuthMonitoring = () => {
  return {
    enableDebugMode: () => authMonitoring.setDebugMode(true),
    disableDebugMode: () => authMonitoring.setDebugMode(false),
    clearLogs: () => authMonitoring.clearLogs(),
    getRecentLogs: () => authMonitoring.getRecentLogs(),
    getSessionChecksCount: () => authMonitoring.getSessionChecksCount()
  };
};
