import { toast } from "sonner";
import { AuthEvent } from "@/types";

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
    console.log(`[Auth] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
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
