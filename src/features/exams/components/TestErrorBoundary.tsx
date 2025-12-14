import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorMessage from "@/shared/components/atoms/error-message/ErrorMessage";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class TestErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Test component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorMessage
          title="Test Error"
          message="An unexpected error occurred. Please refresh the page and try again."
        />
      );
    }

    return this.props.children;
  }
}

export default TestErrorBoundary;
