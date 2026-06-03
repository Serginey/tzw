import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Frontend render error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          padding: '32px',
          background: '#f7f8fb',
          color: '#1f2937',
          fontFamily: 'Satoshi Variable, sans-serif',
        }}>
          <h1 style={{ marginBottom: '12px' }}>Frontend error</h1>
          <p style={{ color: '#e74c3c', marginBottom: '16px' }}>{this.state.error.message}</p>
          <pre style={{
            whiteSpace: 'pre-wrap',
            background: '#ffffff',
            border: '1px solid #e4e7ee',
            padding: '16px',
            borderRadius: '8px',
          }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
