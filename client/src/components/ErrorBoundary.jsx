
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-black text-red-500 font-mono p-8">
                    <h1 className="text-3xl font-bold mb-4">SYSTEM BREACH: CRITICAL ERROR</h1>
                    <div className="bg-[#1a1a1a] p-6 rounded border border-red-900 max-w-2xl w-full overflow-auto">
                        <p className="text-xl mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-red-900/30 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded transition-all"
                    >
                        REBOOT SYSTEM
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
