
import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to a service if needed
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ? (
          this.props.fallback
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-xl font-semibold text-destructive mb-2">Something went wrong.</div>
            <pre className="bg-red-50 p-4 rounded text-destructive text-xs overflow-auto max-w-full">{this.state.error?.message}</pre>
            <button className="mt-4 px-4 py-2 rounded bg-primary text-white" onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
