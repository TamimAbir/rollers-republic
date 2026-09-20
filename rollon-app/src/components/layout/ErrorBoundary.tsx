import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white/5 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                        <p className="text-white/60">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium w-full"
                        >
                            Reload application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
