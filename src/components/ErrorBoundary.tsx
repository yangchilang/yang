import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center min-h-[60vh] px-4"
        >
          <div className="text-center max-w-md">
            <div className="text-tarot-gold/30 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-decorative text-tarot-gray mb-2">页面加载出错</h2>
            <p className="text-tarot-gray/60 font-crimson mb-6">
              抱歉，页面内容暂时无法显示。请尝试刷新页面。
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 rounded-lg font-decorative bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
            >
              刷新页面
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;