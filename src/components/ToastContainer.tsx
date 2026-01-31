import { useToast, type ToastType } from '../hooks/useToast';
import { Icons } from './ui/Icons';

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <Icons.CheckCircle2 className="w-5 h-5" />,
    error: <Icons.AlertCircle className="w-5 h-5" />,
    warning: <Icons.AlertCircle className="w-5 h-5" />,
    info: <Icons.Info className="w-5 h-5" />,
};

const styleMap: Record<ToastType, string> = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-indigo-500 text-white',
};

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${styleMap[toast.type]} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300`}
                    role="alert"
                >
                    {iconMap[toast.type]}
                    <p className="font-medium text-sm flex-1">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                        aria-label="Lukk melding"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
