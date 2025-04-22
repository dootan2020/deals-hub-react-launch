
import { useEffect, useState } from 'react';
import { useAuthMonitoring } from '@/utils/auth/auth-monitoring';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AuthDebugger = () => {
  const { getRecentLogs, getSessionChecksCount, clearLogs } = useAuthMonitoring();
  const [logs, setLogs] = useState<AuthEvent[]>([]);
  const [sessionChecks, setSessionChecks] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getRecentLogs());
      setSessionChecks(getSessionChecksCount());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="fixed bottom-4 right-4 z-50"
        >
          Auth Debug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Auth Debugger</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p>Session Checks: {sessionChecks}</p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={clearLogs}
            >
              Clear Logs
            </Button>
          </div>
          <div className="bg-secondary p-4 rounded-md space-y-2 max-h-[400px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="text-sm">
                <span className="text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {' - '}
                <span className="font-medium">{log.type}</span>
                {log.metadata && (
                  <pre className="mt-1 text-xs">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDebugger;
