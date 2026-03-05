import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-dark)",
                    color: "var(--text-primary)",
                    padding: "2rem",
                    textAlign: "center"
                }}>
                    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</h1>
                    <h2 style={{ fontWeight: 800 }}>Something went wrong.</h2>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        The application encountered an unexpected error.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                        style={{ marginTop: "2rem" }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
