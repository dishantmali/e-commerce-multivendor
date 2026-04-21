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
        <div className="p-10 text-center bg-[#FAF8F5] border border-dashed border-[#A87C51]/40 rounded-xl animate-fade-in">
          <div className="mb-4 flex justify-center">
            <svg className="w-12 h-12 text-[#A87C51] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#2C1E16] mb-2">Something went wrong.</h2>
          <button
            className="mt-2 text-[#A87C51] font-bold hover:text-[#5A3825] underline underline-offset-4 transition-colors duration-200"
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