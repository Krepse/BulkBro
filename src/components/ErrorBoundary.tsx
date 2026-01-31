import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Icons } from './ui/Icons';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // TODO: Send to error monitoring service (Sentry, etc.)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">
                            Oops! Noe gikk galt
                        </h1>
                        <p className="text-slate-500 mb-6">
                            En uventet feil oppstod. Prøv å laste siden på nytt.
                        </p>
                        {this.state.error && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left overflow-auto max-h-32">
                                <code className="text-xs text-red-600 break-all">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-sm"
                        >
                            <Icons.RotateCcw className="w-5 h-5" />
                            Last inn på nytt
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
