import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '2rem',
          margin: '2rem auto',
          maxWidth: '480px',
          background: '#1c1916',
          border: '1px solid #c94040',
          borderRadius: '10px',
          color: '#e07070',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</p>
          <p style={{ fontSize: '0.8rem', color: '#9a8e7c' }}>{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '1rem',
              background: 'none',
              border: '1px solid #3d3830',
              color: '#9a8e7c',
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
