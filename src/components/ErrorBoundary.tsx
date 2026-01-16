import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log error to an external service here
    this.setState({ error, info });
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold text-destructive">Đã xảy ra lỗi 😞</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ứng dụng gặp sự cố khi hiển thị. Thông tin chi tiết dưới đây:</p>
          <div className="mt-4 bg-muted p-4 rounded">
            <pre className="text-xs whitespace-pre-wrap">{this.state.error?.message}</pre>
            {this.state.info && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">Stack trace</summary>
                <pre className="text-xs whitespace-pre-wrap">{this.state.info.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
