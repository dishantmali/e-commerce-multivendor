import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-center bg-gray-50 border border-dashed rounded-sm">
          <h2 className="text-xl font-bold text-gray-700">Something went wrong.</h2>
          <button 
            className="text-primary hover:underline mt-2" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}